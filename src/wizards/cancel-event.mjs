import { Scenes } from 'telegraf';
// import db from '../db.mjs'; // TODO db
import updateSubscribers from '../helpers/updateSubscribers.mjs';

// TODO add debug

export function cancelEventWizard() {
  return new Scenes.WizardScene
  (
    'cancel-event',
    async ctx => {
      if (ctx.message.text.toLowerCase() === 'yes') {
        const { event } = ctx.wizard.state;

        event.canceled = true;
        await updateSubscribers(ctx.telegram, event);

        db.data.events = db.data.events.filter(it => it.id !== event.id);
        await db.write();

        await ctx.reply(ctx.i18n.t('cancel.reply'));

        return await ctx.scene.leave();
      }

      if (ctx.message.text.toLowerCase() === 'no') {
        return await ctx.scene.leave();
      }

      await ctx.reply(ctx.i18n.t('cancel.question'));
    },
  );
}