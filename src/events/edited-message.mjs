// import db from '../db.mjs'; // TODO db
import updateSubscribers from '../helpers/updateSubscribers.mjs';
import createDebug from 'debug';

const debug = createDebug('bot:edited_message');

export function editedMessage() {
  return async ctx =>
  {
    const user = ctx.update.edited_message.from;
    debug(`User ${user.first_name} (${user.id})`);

    const event = db.data.events.find(it =>
      it.creator.id === ctx.update.edited_message.from.id && it.description.id === ctx.update.edited_message.message_id);
    event.description.text = ctx.update.edited_message.text;
    await db.write();
    await updateSubscribers(ctx.telegram, event);
  };
}
