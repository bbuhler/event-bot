import { Scenes } from 'telegraf';
import * as db from '../db.mjs';
import updateSubscribers from '../helpers/updateSubscribers.mjs';
import Calendar from '../helpers/calendar.mjs';
import createDebug from '../helpers/debug.mjs';

const debug = createDebug('bot:reschedule_wizard');

export function rescheduleEventWizard(bot) {
  const calendar = new Calendar(bot);

  calendar.setDateListener(async (ctx, date) => {
    debug(`Received date ${date}`);

    ctx.scene.session.date = date;

    // FIXME to work on first click
    ctx.wizard.next();
  });

  return new Scenes.WizardScene
  (
    'reschedule-event',
    async (ctx) => {
      const { authorAndEventId, eventMessageId } = ctx.wizard.state;

      debug(`[${authorAndEventId}] Start`);

      calendar.setMinDate(new Date());

      const message = await ctx.reply(ctx.i18n.wizard.reschedule.message, {
        reply_parameters: {
          message_id: eventMessageId,
          allow_sending_without_reply: false,
        },
        ...calendar.getCalendar(null, ctx.from?.language_code),
      });
      debug(`[${authorAndEventId}] Sent date request message`);

      ctx.scene.session.calendarMessageId = message.message_id;

      ctx.wizard.next();
    },
    calendar.composer,
    async (ctx) => {
      const { authorAndEventId, eventMessageId } = ctx.wizard.state;
      const { calendarMessageId, date } = ctx.scene.session;

      if (calendarMessageId) {
        await ctx.deleteMessage(calendarMessageId);
        debug(`[${authorAndEventId}] Delete date request message id=${calendarMessageId}`);
      }

      if (date) {
        await db.updateEventDate(authorAndEventId, date);
        debug(`[${authorAndEventId}] Updated event date`);

        await updateSubscribers(ctx, authorAndEventId);
        debug(`[${authorAndEventId}] Updated subscribers`);

        await ctx.reply(ctx.i18n.wizard.reschedule.reply(date), {
          reply_parameters: {
            message_id: eventMessageId,
            allow_sending_without_reply: false,
          },
        });
        debug(`[${authorAndEventId}] Sent success reply`);
      }

      return await ctx.scene.leave();
    },
  );
}
