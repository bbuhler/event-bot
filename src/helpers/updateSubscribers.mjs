import * as db from '../db.mjs';
import createReplyMarkup from './createReplyMarkup.mjs';
import createEventMessage from './message-formater.mjs';

export default async function updateSubscribers(ctx, authorAndEventId) {
  const event = await db.getEvent(authorAndEventId);
  const changes = event.subscribers.map(({ chatId, messageId, inlineMessageId }) =>
    ctx.telegram.editMessageText(chatId, messageId, inlineMessageId, createEventMessage(ctx, event),
      {
        ...createReplyMarkup(ctx, event, messageId),
      }));

  await Promise.allSettled(changes);

  return event.subscribers.find(subscriber => !!subscriber.messageId);
}