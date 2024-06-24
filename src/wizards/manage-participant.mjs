import { Scenes } from 'telegraf';
// import db from '../db.mjs'; // TODO db
import getContactFromMsg from '../helpers/getContactFromMsg.mjs';
import { addParticipant, removeParticipant } from '../helpers/participants.mjs';
import updateSubscribers from '../helpers/updateSubscribers.mjs';

// TODO add debug

export function manageParticipant() {
  return new Scenes.WizardScene
  (
    'manage-participant',
    async ctx => {
      const { event, add, remove } = ctx.wizard.state;
      const contact = getContactFromMsg(ctx.update.message);

      if (contact) {
        if (add) {
          addParticipant(event, contact);
        } else if (remove) {
          removeParticipant(event, contact);
        }

        await db.write();

        await updateSubscribers(ctx.telegram, event);

        await ctx.reply(ctx.i18n.t('manage-participants.reply', { add, name: contact.first_name || contact.username }));
        return await ctx.scene.leave();
      }

      await ctx.reply(ctx.i18n.t('manage-participants.question', { add }));
    },
  );
}