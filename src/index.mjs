import path from 'path';
import { fileURLToPath } from 'url';
import { Scenes, session, Telegraf } from 'telegraf';

import { createCommand, startCommand } from './commands/index.mjs';
import { development, production } from './core/index.mjs';
import { chosenInlineResult, editedMessage, inlineQuery } from './events/index.mjs';
import {
  addParticipantAction,
  cancelAction,
  removeParticipantAction,
  rescheduleAction,
  rsvpAction,
} from './actions/index.mjs';
import {
  addParticipantWizard,
  cancelEventWizard,
  createEventWizard,
  removeParticipantWizard,
  rescheduleEventWizard,
} from './wizards/index.mjs';
import { redisSessionStore } from './db.mjs';
import { availableLocales, i18nMiddleware } from './i18n/middleware.mjs';

// TODO clean up cron endpoint

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: ENVIRONMENT !== 'production' },
});

const stage = new Scenes.Stage();

bot.use(i18nMiddleware());
bot.use(session({ store: redisSessionStore }));
bot.use(stage.middleware());

bot.command('start', startCommand());
bot.command('help', startCommand());
bot.command('create', createCommand());

const commands = ['create'];
bot.settings(async () => {
  await Promise.all(Object.keys(availableLocales).map((locale) => bot.telegram.setMyCommands(commands.map(command => ({
    command,
    description: availableLocales[locale].command[command].description,
  })), {
    language_code: locale,
  })));
});

bot.on('edited_message', editedMessage());
bot.on('inline_query', inlineQuery());
bot.on('chosen_inline_result', chosenInlineResult());

bot.action(/rsvp:(?<authorId>.+):(?<eventId>.+):(?<response>[01])/, rsvpAction());
bot.action(/add:(?<authorId>.+):(?<eventId>.+):(?<messageId>.+)/, addParticipantAction());
bot.action(/remove:(?<authorId>.+):(?<eventId>.+):(?<messageId>.+)/, removeParticipantAction());
bot.action(/cancel:(?<authorId>.+):(?<eventId>.+):(?<messageId>.+)/, cancelAction());
bot.action(/reschedule:(?<authorId>.+):(?<eventId>.+):(?<messageId>.+)/, rescheduleAction());

stage.register(createEventWizard(bot));
stage.register(addParticipantWizard());
stage.register(removeParticipantWizard());
stage.register(rescheduleEventWizard(bot));
stage.register(cancelEventWizard());

//prod mode (Vercel)
export const startVercel = async (req, res) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot);
