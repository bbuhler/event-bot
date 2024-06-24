import { Scenes } from 'telegraf';
// import db from '../db.mjs'; // TODO db
import updateSubscribers from '../helpers/updateSubscribers.mjs';
import Calendar from '../helpers/calendar.mjs';

// TODO add debug

export function rescheduleEventWizard(bot) {
  const calendar = new Calendar(bot);

  // FIXME to work calling it only once - maybe duplicated listener with create?
  calendar.setDateListener(async (ctx, date) => {
    ctx.scene.session.date = new Date(date);
    return ctx.wizard.next();
  });

  return new Scenes.WizardScene
  (
    'reschedule-event',
    async (ctx) => {
      calendar.setMinDate(new Date());
      await ctx.reply(ctx.i18n.t('reschedule.question'), calendar.getCalendar(null, ctx.i18n.locale()));
      return ctx.wizard.next();
    },
    calendar.composer,
    async (ctx) => {
      const newDate = ctx.scene.session.date;
      const { event } = ctx.wizard.state;

      await ctx.editMessageReplyMarkup();

      if (event.date !== newDate) {
        event.date = newDate;

        await db.write();
        await updateSubscribers(ctx.telegram, event);
      }

      await ctx.replyWithHTML(ctx.i18n.t('reschedule.reply', { date: newDate.toLocaleDateString(ctx.i18n.locale()) }));
      return await ctx.scene.leave();
    },
  );
}
