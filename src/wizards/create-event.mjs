import { v4 } from 'uuid';
import { Scenes } from 'telegraf';
// import db from '../db.mjs'; // TODO db
import createEventMessage from '../helpers/message-formater.mjs';
import createReplyMarkup from '../helpers/createReplyMarkup.mjs';
import Calendar from '../helpers/calendar.mjs';

// TODO add debug

export function createEventWizard(bot) {
  const calendar = new Calendar(bot);

  calendar.setDateListener(async (ctx, date) => {
    ctx.scene.session.date = new Date(date);
    await ctx.editMessageReplyMarkup();
    await ctx.replyWithHTML(ctx.i18n.t('create.date.reply', { date: ctx.scene.session.date.toLocaleDateString(ctx.i18n.locale()) }));
    await ctx.reply(ctx.i18n.t('create.description.question'));
    return ctx.wizard.next();
  });

  return new Scenes.WizardScene
  (
    'create-event',
    async (ctx) => {
      calendar.setMinDate(new Date());
      await ctx.reply(ctx.i18n.t('create.date.question'), calendar.getCalendar(null, ctx.i18n.locale()));
      return ctx.wizard.next();
    },
    calendar.composer,
    async (ctx) => {
      await ctx.reply(ctx.i18n.t('create.description.reply'));

      const event = {
        id: v4(),
        date: ctx.scene.session.date,
        creator: ctx.message.from,
        description:
          {
            id: ctx.message.message_id,
            text: ctx.message.text,
            entities: ctx.message.entities,
          },
        subscribers: [],
        participants: [],
      };

      db.data.events.push(event);
      await db.write();

      const eventMessage = await ctx.reply(createEventMessage(event), {
        parse_mode: 'HTML',
        ...createReplyMarkup(event, true),
      });

      event.subscribers.push({
        chatId: eventMessage.chat.id,
        messageId: eventMessage.message_id,
      });
      await db.write();

      return await ctx.scene.leave();
    },
  );
}
