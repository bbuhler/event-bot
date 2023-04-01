import bot from '../bot.mjs';
import db from '../db.mjs';
import { addParticipant, removeParticipant } from '../helpers/participants.mjs';
import updateSubscribers from '../helpers/updateSubscribers.mjs';
import { bulbEmoji } from '../helpers/emoji.mjs';

bot.action(/rsvp:(?<eventId>.+):(?<response>[01])/, async ctx =>
{
  const { eventId, response } = ctx.match.groups;
  const { from } = ctx.update.callback_query;

  const event = db.data.events.find(it => it.id === eventId);

  let showTip;

  if (response === '1')
  {
    showTip = addParticipant(event, from);
  }
  else if (response === '0')
  {
    const done = removeParticipant(event, from);

    if (!done) // not a participant
    {
      return ctx.answerCbQuery();
    }
  }

  await db.write();
  await updateSubscribers(ctx.telegram, event);

  return ctx.answerCbQuery(showTip ? `${bulbEmoji} ${ctx.i18n.t('rsvp.plus-one-tip')}` : undefined);
});