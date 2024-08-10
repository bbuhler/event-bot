import { Scenes } from 'telegraf';
import * as db from '../db.mjs';
import createEventMessage from '../helpers/message-formater.mjs';
import createReplyMarkup from '../helpers/createReplyMarkup.mjs';
import Calendar from '../helpers/calendar.mjs';
import createDebug from '../helpers/debug.mjs';
import * as Sentry from '@sentry/node';

const debug = createDebug('bot:create_wizard');

export function createEventWizard(bot) {
  const calendar = new Calendar(bot);

  calendar.setDateListener(async (ctx, date) => {
    debug(`Received date ${date}`);

    ctx.scene.session.date = new Date(date);

    await ctx.editMessageReplyMarkup();
    await ctx.reply(ctx.i18n.wizard.create.date.reply(ctx.scene.session.date));
    await ctx.reply(ctx.i18n.wizard.create.description.message);

    ctx.wizard.next();
  });

  return new Scenes.WizardScene
  (
    'create-event',
    async (ctx) => {
      debug('Start');

      calendar.setMinDate(new Date());

      ctx.wizard.next();

      await ctx.reply(ctx.i18n.wizard.create.date.message, calendar.getCalendar(null, ctx.from?.language_code));
    },
    calendar.composer,
    async (ctx) => {
      if (ctx.message.text) {
        if (ctx.message.text === '/create') {
          debug('Received /create command again, restart wizard');
          ctx.wizard.selectStep(0);
          return ctx.scene.reenter();
        }

        debug('Received description');

        const event = {
          id: `${ctx.message.from.id}:${db.nanoid()}`,
          date: new Date(ctx.scene.session.date),
          locale: ctx.message.from.language_code,
          descriptionMessageId: ctx.message.message_id,
          description: {
            text: ctx.message.text,
            entities: ctx.message.entities,
          },
          subscribers: [],
          participants: {},
        };

        Sentry.setContext('Event', { id: event.id });

        debug('Create event');
        await db.createUser(ctx.message.from);
        await db.createEvent(event);

        debug('Send event');
        const eventMessage = await ctx.reply(createEventMessage(ctx, event), {
          protect_content: true,
        });

        await ctx.telegram.editMessageReplyMarkup(eventMessage.chat.id, eventMessage.message_id, undefined, createReplyMarkup(ctx, event, eventMessage.message_id).reply_markup);

        debug('Add subscriber');
        await db.addEventSubscriber(event.id, {
          chatId: eventMessage.chat.id,
          messageId: eventMessage.message_id,
        });

        await ctx.pinChatMessage(eventMessage.message_id, {
          disable_notification: true,
        });

        await ctx.reply(ctx.i18n.wizard.create.description.reply, {
          reply_parameters: { message_id: ctx.update.message.message_id },
        });

        debug('Done');
        return await ctx.scene.leave();
      } else {
        Sentry.captureMessage('Unsupported message type', 'warning');
      }
    },
  );
}
