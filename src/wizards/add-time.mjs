import { Scenes } from 'telegraf';
import * as db from '../db.mjs';
import updateSubscribers from '../helpers/updateSubscribers.mjs';
import Calendar from '../helpers/calendar.mjs';
import createDebug from 'debug';

const debug = createDebug('bot:add_time_wizard');

export function addTimeWizard() {
  return new Scenes.WizardScene
  (
    'add-time',
    async (ctx) => {
      const { authorAndEventId, eventMessageId } = ctx.wizard.state;

      debug(`[${authorAndEventId}] Start`);

      const message = await ctx.reply(ctx.i18n.wizard.reschedule.message, {
        reply_parameters: {
          message_id: eventMessageId,
          allow_sending_without_reply: false,
        },
        ...calendar.getCalendar(null, ctx.from?.language_code), // TODO time selector
      });
      debug(`[${authorAndEventId}] Sent date request message`);

      ctx.scene.session.timerMessageId = message.message_id;

      ctx.wizard.next();
    },
    async (ctx) => {
      const { authorAndEventId, eventMessageId } = ctx.wizard.state;
      const { timerMessageId, date } = ctx.scene.session;

      if (timerMessageId) {
        await ctx.deleteMessage(timerMessageId);
        debug(`[${authorAndEventId}] Delete date request message id=${timerMessageId}`);
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
