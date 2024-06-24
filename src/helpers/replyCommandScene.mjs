// import db from '../db.mjs'; // TODO db
import { warningEmoji } from './emoji.mjs';

function findEventFromReplyMsg(replyToMsg) {
  if (replyToMsg) {
    return db.data.events.find(it => it.subscribers.some(s =>
      replyToMsg.message_id === s.messageId && replyToMsg.chat.id === s.chatId));
  }
}

export default function (sceneId, options) {
  return (ctx) => {
    const event = findEventFromReplyMsg(ctx.update.message?.reply_to_message);

    if (!event) {
      ctx.reply(`${warningEmoji} ${ctx.i18n.t('error.event-reference')}`);
    } else {
      ctx.scene.enter(sceneId, { event, ...options });
    }
  };
}