import bot from '../bot.mjs';
import db from '../db.mjs';
import { addParticipant, removeParticipant } from '../helpers/participants.mjs';
import updateSubscribers from '../helpers/updateSubscribers.mjs';

bot.action(/rsvp:(?<eventId>.+):(?<response>[01])/, async ctx =>
{
  const { eventId, response } = ctx.match.groups;
  const { from } = ctx.update.callback_query;

  const event = db.data.events.find(it => it.id === eventId);

  if (response === '1')
  {
    addParticipant(event, from);
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
  await updateSubscribers(ctx.tg, event);

  return ctx.answerCbQuery();
});