import path from 'path';
import { fileURLToPath } from 'url';
import { Scenes, session, Telegraf } from 'telegraf';
import TelegrafI18n from 'telegraf-i18n';

import { add, cancel, create, limit, remove, reschedule, start } from './commands/index.mjs';
import { development, production } from './core/index.mjs';
import { chosenInlineResult, editedMessage, inlineQuery } from './events/index.mjs';
import { rsvp } from './actions/index.mjs';
import {
  cancelEventWizard,
  createEventWizard,
  limitParticipantsWizard,
  manageParticipant,
  rescheduleEventWizard,
} from './wizards/index.mjs';
import Calendar from './helpers/calendar.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

const stage = new Scenes.Stage();
const i18n = new TelegrafI18n({
  defaultLanguage: 'en',
  defaultLanguageOnMissing: true,
  directory: path.resolve(__dirname, 'locales'),
});

bot.use(session()); // TODO different storage per environment
bot.use(i18n.middleware());
bot.use(stage.middleware());

bot.command('start', start());
bot.command('create', create());
bot.command('limit', limit());
bot.command('add', add());
bot.command('remove', remove());
bot.command('reschedule', reschedule());
bot.command('cancel', cancel());

bot.on('edited_message', editedMessage());
bot.on('inline_query', inlineQuery());
bot.on('chosen_inline_result', chosenInlineResult());

bot.action(/rsvp:(?<eventId>.+):(?<response>[01])/, rsvp());

stage.register(createEventWizard(bot));
stage.register(limitParticipantsWizard());
stage.register(manageParticipant());
stage.register(rescheduleEventWizard(bot));
stage.register(cancelEventWizard());

//prod mode (Vercel)
export const startVercel = async (req, res) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot);
