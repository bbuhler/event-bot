import createDebug from '../helpers/debug.mjs';
import * as Sentry from '@sentry/node';

const debug = createDebug('bot:reschedule_action');

export function rescheduleAction() {
  return async ctx => {
    const { authorId, eventId, messageId } = ctx.match.groups;
    const { from } = ctx.update.callback_query;
    const authorAndEventId = `${authorId}:${eventId}`;

    Sentry.setContext('Event', { id: authorAndEventId });
    debug(`authorId=${authorId}, eventId=${eventId}, messageId=${messageId}, from=${from.first_name} (${from.id})`);

    await ctx.scene.enter('reschedule-event', {
      eventMessageId: messageId,
      authorAndEventId,
    });
    return ctx.answerCbQuery();
  };
}
