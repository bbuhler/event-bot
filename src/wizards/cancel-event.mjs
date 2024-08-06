import { Markup, Scenes } from 'telegraf';
import * as db from '../db.mjs';
import updateSubscribers from '../helpers/updateSubscribers.mjs';
import createDebug from 'debug';

const debug = createDebug('bot:cancel_wizard');

export function cancelEventWizard() {
  return new Scenes.WizardScene
  (
    'cancel-event',
    async ctx => {
      const { authorAndEventId, eventMessageId } = ctx.wizard.state;

      debug(`[${authorAndEventId}] Start`);

      const message = await ctx.reply(ctx.i18n.wizard.cancel.message, {
        reply_parameters: {
          message_id: eventMessageId,
          allow_sending_without_reply: false,
        },
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(ctx.i18n.wizard.cancel.yes, 'yes'),
          ],
          [
            Markup.button.callback(ctx.i18n.wizard.cancel.no, 'no'),
          ],
        ]).resize(true).persistent(true),
      });
      debug(`[${authorAndEventId}] Sent confirmation message`);

      ctx.scene.session.confirmationMessageId = message.message_id;

      ctx.wizard.next();
    },
    async ctx => {
      const { authorAndEventId, eventMessageId } = ctx.wizard.state;
      const { confirmationMessageId } = ctx.scene.session;
      const result = ctx.update.callback_query.data;

      debug(`[${authorAndEventId}] Received confirmation: ${result}`);


      if (confirmationMessageId) {
        await ctx.deleteMessage(confirmationMessageId);
        debug(`[${authorAndEventId}] Deleted confirmation message id=${confirmationMessageId}`);
      }

      if (result === 'yes') {
        await db.cancelEvent(authorAndEventId);
        debug(`[${authorAndEventId}] Canceled event`);

        await updateSubscribers(ctx, authorAndEventId);
        debug(`[${authorAndEventId}] Updated subscribers`);

        await ctx.unpinChatMessage(eventMessageId);
        debug(`[${authorAndEventId}] Unpin event message`);

        await ctx.reply(ctx.i18n.wizard.cancel.reply, {
          reply_parameters: {
            message_id: eventMessageId,
            allow_sending_without_reply: false,
          },
        });
        debug(`[${authorAndEventId}] Sent success reply`);
      }

      return ctx.scene.leave();
    },
  );
}