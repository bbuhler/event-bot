import { Composer, Scenes, Markup } from 'telegraf';
import { stage } from '../bot.mjs';
import db from '../db.mjs';
import updateSubscribers from '../helpers/updateSubscribers.mjs';

// TODO reduce duplicate code with create-event.wizard.mjs

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
  'reschedule-event',
  async (ctx) =>
  {
    await ctx.replyWithHTML(ctx.i18n.t('reschedule.question'), {
      ...chooseYearButtons,
    });

    return ctx.wizard.next();
  },
  yearHandler,
  monthHandler,
  async (ctx) =>
  {
    const newDate = new Date(ctx.scene.session.date.year, ctx.scene.session.date.month, parseInt(ctx.update.callback_query.data));
    const { event } = ctx.wizard.state;

    await ctx.editMessageReplyMarkup();

    if (event.date !== newDate)
    {
      event.date = newDate;

      await db.write();
      await updateSubscribers(ctx.telegram, event);
    }

    await ctx.reply(ctx.i18n.t('reschedule.reply', { date: newDate.toLocaleDateString(ctx.i18n.locale()) }));
    return await ctx.scene.leave();
  },
));