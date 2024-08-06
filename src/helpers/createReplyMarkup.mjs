import { Markup } from 'telegraf';

export default function createReplyMarkup(ctx, event, creatorMessageId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (event.canceled || event.date < today) {
    return;
  }

  if (creatorMessageId) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback(ctx.i18n.action.add.button, `add:${event.id}:${creatorMessageId}`),
        Markup.button.callback(ctx.i18n.action.remove.button, `remove:${event.id}:${creatorMessageId}`),
      ],
      [
        Markup.button.callback(ctx.i18n.action.reschedule.button, `reschedule:${event.id}:${creatorMessageId}`),
        Markup.button.callback(ctx.i18n.action.cancel.button, `cancel:${event.id}:${creatorMessageId}`),
      ],
      [Markup.button.switchToChat(ctx.i18n.action.share.button, event.id)],
    ]);
  }

  return Markup.inlineKeyboard([
    Markup.button.callback(ctx.i18n.action.rsvp.participate.button, `rsvp:${event.id}:1`),
    Markup.button.callback(ctx.i18n.action.rsvp.withdraw.button, `rsvp:${event.id}:0`),
  ]);
}