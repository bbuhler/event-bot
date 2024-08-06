import createDebug from 'debug';

const debug = createDebug('bot:cancel_action');

export function cancelAction() {
  return async ctx => {
    const { authorId, eventId, messageId } = ctx.match.groups;
    const { from } = ctx.update.callback_query;
    const authorAndEventId = `${authorId}:${eventId}`;

    debug(`authorId=${authorId}, eventId=${eventId}, messageId=${messageId}, from=${from.first_name} (${from.id})`);

    await ctx.scene.enter('cancel-event', {
      eventMessageId: messageId,
      authorAndEventId,
    });
    return ctx.answerCbQuery();
  };
}
