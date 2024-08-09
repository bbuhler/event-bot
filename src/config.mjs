export const dbNamespace = process.env.BOT_DB_NAMESPACE || 'eventBot';

export const allowedUpdates = [
  'message',
  'edited_message',
  'inline_query',
  'chosen_inline_result',
  'callback_query',
];

export const availableCommands = [
  'create',
  'help',
];