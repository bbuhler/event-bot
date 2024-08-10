import createDebug from '../helpers/debug.mjs';
import * as Sentry from '@sentry/node';

export function addParticipantAction() {
  const debug = createDebug('bot:add_participant_action');

  return async ctx => {
    const { authorId, eventId, messageId } = ctx.match.groups;
    const { from } = ctx.update.callback_query;
    const authorAndEventId = `${authorId}:${eventId}`;

    Sentry.setContext('Event', { id: authorAndEventId });
    debug(`authorId=${authorId}, eventId=${eventId}, messageId=${messageId}, from=${from.first_name} (${from.id})`);

    await ctx.answerCbQuery();
    await ctx.scene.enter('add-participant', {
      eventMessageId: messageId,
      authorAndEventId,
    });
  };
}

export function removeParticipantAction() {
  const debug = createDebug('bot:remove_participant_action');

  return async ctx => {
    const { authorId, eventId, messageId } = ctx.match.groups;
    const { from } = ctx.update.callback_query;
    const authorAndEventId = `${authorId}:${eventId}`;

    Sentry.setContext('Event', { id: authorAndEventId });
    debug(`authorId=${authorId}, eventId=${eventId}, messageId=${messageId}, from=${from.first_name} (${from.id})`);

    await ctx.answerCbQuery();
    await ctx.scene.enter('remove-participant', {
      eventMessageId: messageId,
      authorAndEventId,
    });
  };
}
