import createDebug from 'debug';

const debug = createDebug('bot:dev');

const development = async bot => {
  const botInfo = (await bot.telegram.getMe()).username;

  debug('Bot runs in development mode');
  debug(`${botInfo} deleting webhook`);
  await bot.telegram.deleteWebhook();
  debug(`${botInfo} starting polling`);

  await bot.launch({
    allowedUpdates:  [
      'message',
      'edited_message',
      'inline_query',
      'chosen_inline_result',
      'callback_query',
    ],
  });

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
};

export { development };
