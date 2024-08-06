import * as db from '../db.mjs';
import updateSubscribers from '../helpers/updateSubscribers.mjs';
import { bulbEmoji } from '../helpers/emoji.mjs';
import createDebug from 'debug';
import { getParticipantName } from '../helpers/message-formater.mjs';

const debug = createDebug('bot:rsvp_action');

export function rsvpAction() {
  return async ctx => {
    const { authorId, eventId, response } = ctx.match.groups;
    const { from } = ctx.update.callback_query;
    const authorAndEventId = `${authorId}:${eventId}`;

    debug(`authorId=${authorId}, eventId=${eventId}, response=${response}, from=${from.first_name} (${from.id})`);

    let addedNewly, removedCompletely;

    if (response === '1') {
      addedNewly = await db.addEventParticipant(authorAndEventId, from);
      debug(`added participant: ${from.first_name} (${from.id})`);
    } else if (response === '0') {
      removedCompletely = await db.removeEventParticipant(authorAndEventId, from.id);
      debug(`removed participant: ${from.first_name} (${from.id})`);
    }

    const authorSubscriber = await updateSubscribers(ctx, authorAndEventId);

    await ctx.telegram.sendMessage(authorSubscriber.chatId, ctx.i18n.action.rsvp[addedNewly ? 'participate' : 'withdraw'].notify(getParticipantName(from), from), {
      reply_parameters: {
        message_id: authorSubscriber.messageId,
        allow_sending_without_reply: false,
      },
    });

    return ctx.answerCbQuery(addedNewly ? `${bulbEmoji} ${ctx.i18n.action.rsvp.plusOneTip}` : undefined);
  };
}
