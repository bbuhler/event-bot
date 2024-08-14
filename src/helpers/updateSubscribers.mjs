import * as db from '../db.mjs';
import createReplyMarkup from './createReplyMarkup.mjs';
import createEventMessage from './message-formater.mjs';
import { availableLocales } from '../i18n/middleware.mjs';

export async function updateSubscribersById(ctx, authorAndEventId) {
  const event = await db.getEvent(authorAndEventId);
  return updateSubscribers(ctx.telegram, event);
}

export async function updateSubscribers(telegram, event) {
  const i18n = availableLocales[event.locale];
  const changes = event.subscribers.map(({ chatId, messageId, inlineMessageId }) =>
    telegram.editMessageText(chatId, messageId, inlineMessageId, createEventMessage(i18n, event),
      {
        ...createReplyMarkup(i18n, event, messageId),
      }));

  await Promise.allSettled(changes);

  return event.subscribers.find(subscriber => !!subscriber.messageId);
}