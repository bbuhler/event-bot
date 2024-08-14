import { Markup, Scenes } from 'telegraf';
import * as db from '../db.mjs';
import { updateSubscribersById } from '../helpers/updateSubscribers.mjs';
import { getParticipantName } from '../helpers/message-formater.mjs';
import createDebug from '../helpers/debug.mjs';

const debug = createDebug('bot:remove_participant_wizard');

export function removeParticipantWizard() {
  return new Scenes.WizardScene
  (
    'remove-participant',
    async ctx => {
      const { authorAndEventId, eventMessageId } = ctx.wizard.state;

      debug(`[${authorAndEventId}] Start`);

      const event = await db.getEvent(authorAndEventId);

      const message = await ctx.reply(ctx.i18n.wizard.removeParticipant.message, {
        reply_parameters: {
          message_id: eventMessageId,
          allow_sending_without_reply: false,
        },
        ...Markup.inlineKeyboard(Object.entries(event.participants).map(([id, participant]) => [
          Markup.button.callback(getParticipantName(participant), JSON.stringify({ id, name: getParticipantName(participant) })),
        ])),
      });
      debug(`[${authorAndEventId}] Sent participant request message`);

      ctx.scene.session.removeParticipantMessageId = message.message_id;

      ctx.wizard.next();
    },
    async ctx => {
      const { authorAndEventId, eventMessageId } = ctx.wizard.state;
      const { removeParticipantMessageId } = ctx.scene.session;
      const participant = JSON.parse(ctx.update.callback_query.data);

      debug(`[${authorAndEventId}] Received participant to remove: ${participant}`);

      if (removeParticipantMessageId) {
        await ctx.deleteMessage(removeParticipantMessageId);
        debug(`[${authorAndEventId}] Deleted participant request message id=${removeParticipantMessageId}`);
      }

      if (participant) {
        const result = await db.removeEventParticipant(authorAndEventId, participant.id);
        debug(`[${authorAndEventId}] Removed participant (completely=${result})`);

        await updateSubscribersById(ctx, authorAndEventId);
        debug(`[${authorAndEventId}] Updated subscribers`);

        await ctx.reply(ctx.i18n.wizard.removeParticipant.reply(participant.name, parseInt(participant.id)), {
          reply_parameters: { message_id: eventMessageId },
        });
        debug(`[${authorAndEventId}] Sent success reply`);
      }

      return ctx.scene.leave();
    },
  );
}