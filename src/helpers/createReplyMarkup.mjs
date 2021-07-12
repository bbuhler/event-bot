import { Markup } from 'telegraf';
import { i18n } from '../bot.mjs';
import { thumbsDownEmoji, thumbsUpEmoji } from './emoji.mjs';

export default function createReplyMarkup(event, creator = false)
{
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (event.canceled || event.date < today)
  {
    return;
  }

  if (creator)
  {
    return Markup.inlineKeyboard([
      [Markup.button.switchToChat(i18n.t(event.creator.language_code, 'event.share'), '')], // TODO set event.id as value, when query filter is implemented
    ])
  }

  return Markup.inlineKeyboard([
    Markup.button.callback(`${thumbsUpEmoji} ${i18n.t(event.creator.language_code, 'rsvp.yes')}`, `rsvp:${event.id}:1`),
    Markup.button.callback(`${thumbsDownEmoji} ${i18n.t(event.creator.language_code, 'rsvp.no')}`, `rsvp:${event.id}:0`),
  ]);
}