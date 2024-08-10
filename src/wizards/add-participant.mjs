import { Markup, Scenes } from 'telegraf';
import getContactsFromMsg from '../helpers/getContactFromMsg.mjs';
import * as db from '../db.mjs';
import updateSubscribers from '../helpers/updateSubscribers.mjs';
import { getParticipantName } from '../helpers/message-formater.mjs';
import createDebug from '../helpers/debug.mjs';

const debug = createDebug('bot:add_participant_wizard');

export function addParticipantWizard() {
  return new Scenes.WizardScene
  (
    'add-participant',
    async ctx => {
      const { authorAndEventId, eventMessageId } = ctx.wizard.state;

      debug(`[${authorAndEventId}] Start`);

      const view = new DataView(new ArrayBuffer(16));
      view.setInt32(1, Date.now());

      const message = await ctx.reply(ctx.i18n.wizard.addParticipant.message, {
        reply_parameters: {
          message_id: eventMessageId,
          allow_sending_without_reply: false,
        },
        ...Markup.keyboard([
          [Markup.button.userRequest(ctx.i18n.wizard.addParticipant.button, view.getInt32(1), {
            request_name: true,
            request_username: true,
            user_is_bot: false,
          })],
        ]).resize(true),
      });
      debug(`[${authorAndEventId}] Sent contact request message`);

      ctx.scene.session.requestUserMessageId = message.message_id;

      ctx.wizard.next();
    },
    async ctx => {
      const { authorAndEventId, eventMessageId } = ctx.wizard.state;
      const { requestUserMessageId } = ctx.scene.session;
      const contact = getContactsFromMsg(ctx.update.message);

      debug(`[${authorAndEventId}] Received contact ${getParticipantName(contact)} (${contact.id})`);

      if (requestUserMessageId) {
        await ctx.deleteMessage(requestUserMessageId);
        debug(`[${authorAndEventId}] Deleted contact request message id=${requestUserMessageId}`);
      }

      await ctx.deleteMessage(ctx.update.message.message_id);
      debug(`[${authorAndEventId}] Deleted received contact message id=${ctx.update.message.message_id}`);

      if (contact) {
        await db.addEventParticipant(authorAndEventId, contact);
        debug(`[${authorAndEventId}] Added contact to event`);

        await updateSubscribers(ctx, authorAndEventId);
        debug(`[${authorAndEventId}] Updated subscribers`);

        await ctx.reply(ctx.i18n.wizard.addParticipant.reply(getParticipantName(contact), parseInt(contact.id)), {
          reply_parameters: { message_id: eventMessageId },
        });
        debug(`[${authorAndEventId}] Sent success reply`);
      }

      return ctx.scene.leave();
    },
  );
}