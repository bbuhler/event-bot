import bot from '../bot.mjs';
import db from '../db.mjs';
import updateSubscribers from '../helpers/updateSubscribers.mjs';

bot.on('edited_message', async ctx =>
{
  const event = db.data.events.find(it =>
    it.creator.id === ctx.update.edited_message.from.id && it.description.id === ctx.update.edited_message.message_id);
  event.description.text = ctx.update.edited_message.text;
  await db.write();
  await updateSubscribers(ctx.telegram, event);
});