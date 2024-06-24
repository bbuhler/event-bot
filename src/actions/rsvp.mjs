// import db from '../db.mjs'; // TODO db
import { addParticipant, removeParticipant } from '../helpers/participants.mjs';
import updateSubscribers from '../helpers/updateSubscribers.mjs';
import { bulbEmoji } from '../helpers/emoji.mjs';
import createDebug from 'debug';

const debug = createDebug('bot:rsvp_action');

export function rsvp() {
  return async ctx => {
    const { eventId, response } = ctx.match.groups;
    const { from } = ctx.update.callback_query;

    debug(`eventId=${eventId}, response=${response}, from=${from.first_name} (${from.id})`);

    const event = db.data.events.find(it => it.id === eventId);

    let showTip;

    if (response === '1') {
      showTip = addParticipant(event, from);
    } else if (response === '0') {
      const done = removeParticipant(event, from);

      if (!done) // not a participant
      {
        return ctx.answerCbQuery();
      }
    }

    await db.write();
    await updateSubscribers(ctx.telegram, event);

    return ctx.answerCbQuery(showTip ? `${bulbEmoji} ${ctx.i18n.t('rsvp.plus-one-tip')}` : undefined);
  };
}
