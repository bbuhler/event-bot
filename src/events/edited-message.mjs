import * as db from '../db.mjs';
import updateSubscribers from '../helpers/updateSubscribers.mjs';
import createDebug from '../helpers/debug.mjs';
import { getAuthorAndEventIdByDescriptionMessageId } from '../db.mjs';

const debug = createDebug('bot:edited_message');

export function editedMessage() {
  return async ctx =>
  {
    const user = ctx.update.edited_message.from;
    debug(`User ${user.first_name} (${user.id})`);

    const authorAndEventId = await getAuthorAndEventIdByDescriptionMessageId(user.id, ctx.update.edited_message.message_id);

    await db.updateEventDescription(authorAndEventId, ctx.update.edited_message);

    await updateSubscribers(ctx, authorAndEventId);
  };
}
