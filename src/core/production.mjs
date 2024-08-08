import createDebug from 'debug';

const debug = createDebug('bot:dev');

const PORT = (process.env.PORT && parseInt(process.env.PORT, 10)) || 3000;
const VERCEL_URL = `${process.env.VERCEL_URL}`;

const production = async (req, res, bot) => {
  const webhookUrl = `https://${VERCEL_URL}/api/webhook`;

  debug('Bot runs in production mode');

  if (!VERCEL_URL) {
    throw new Error('VERCEL_URL is not set.');
  }

  const getWebhookInfo = await bot.telegram.getWebhookInfo();
  if (getWebhookInfo.url !== webhookUrl) {
    debug(`deleting webhook ${getWebhookInfo.url}`);
    await bot.telegram.deleteWebhook();
    debug(`setting webhook: ${webhookUrl}`);
    const result = await bot.telegram.setWebhook(webhookUrl, {
      secret_token: bot.secretPathComponent(),
      allowed_updates: [
        'message',
        'edited_message',
        'inline_query',
        'chosen_inline_result',
        'callback_query',
      ],
    });
    debug(`setting webhook success=${result}`);
  }

  if (req.method === 'POST') {
    await bot.handleUpdate(req.body, res);
  } else {
    res.status(200).json('Listening to bot events...');
  }
  debug(`starting webhook on port: ${PORT}`);
};
export { production };
