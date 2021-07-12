import { v4 } from 'uuid';
import { Composer, Scenes, Markup } from 'telegraf';
import { stage } from '../bot.mjs';
import db from '../db.mjs';
import createEventMessage from '../helpers/message-formater.mjs';
import createReplyMarkup from '../helpers/createReplyMarkup.mjs';

const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

const today = new Date();
const years = [today.getFullYear(), today.getFullYear() + 1];
const chooseYearButtons = Markup.inlineKeyboard(years.map(year =>
  Markup.button.callback(year.toString(), year.toString())));
const yearHandler = new Composer();
for (let year of years)
{
  yearHandler.action(year.toString(), async ctx =>
  {
    ctx.scene.session.date = { year };
    await ctx.editMessageReplyMarkup(chooseMonthButtons.reply_markup);
    return ctx.wizard.next();
  })
}

const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const monthButtons = Array.from(Array(12)).map((v, month) =>
  Markup.button.callback(months[month], (month + 1).toString()));
const chooseMonthButtons = Markup.inlineKeyboard(chunk(monthButtons, 4));
const monthHandler = new Composer();
for (let month = 0; month < 12; month++)
{
  // TODO don't show past months
  monthHandler.action((month + 1).toString(), async ctx =>
  {
    ctx.scene.session.date.month = month;
    await ctx.editMessageReplyMarkup(getChooseDayButtons(ctx.scene.session.date));
    return ctx.wizard.next();
  })
}

function getChooseDayButtons({ year, month })
{
  // TODO don't show past days
  const days = new Date(year, month + 1, 0).getDate();
  const dayButtons = [];

  for (let day = 1; day <= days; day++)
  {
    dayButtons.push(Markup.button.callback(day.toString(), day.toString()));
  }

  const inlineKeyBoard = Markup.inlineKeyboard(chunk(dayButtons, 7));
  return inlineKeyBoard.reply_markup;
}

stage.register(new Scenes.WizardScene
(
  'create-event',
  async (ctx) =>
  {
    await ctx.replyWithHTML(ctx.i18n.t('create.date.question'), {
      ...chooseYearButtons,
    });

    return ctx.wizard.next();
  },
  yearHandler,
  monthHandler,
  async (ctx) =>
  {
    ctx.scene.session.date = new Date(ctx.scene.session.date.year, ctx.scene.session.date.month, parseInt(ctx.update.callback_query.data));
    await ctx.editMessageReplyMarkup();
    await ctx.reply(ctx.i18n.t('create.date.reply', { date: ctx.scene.session.date.toLocaleDateString(ctx.i18n.locale()) }));
    await ctx.reply(ctx.i18n.t('create.description.question'));
    return ctx.wizard.next();
  },
  async (ctx) =>
  {
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

    return await ctx.scene.leave()
  }
));