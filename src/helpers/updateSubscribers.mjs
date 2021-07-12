import createReplyMarkup from './createReplyMarkup.mjs';
import createEventMessage from './message-formater.mjs';

export default async function updateSubscribers(telegram, event)
{
  const changes = event.subscribers.map(({ chatId, messageId, inlineMessageId }) =>
    telegram.editMessageText(chatId, messageId, inlineMessageId, createEventMessage(event),
      {
        parse_mode: 'HTML',
        ...createReplyMarkup(event, !!chatId),
      }));

  await Promise.all(changes);
}