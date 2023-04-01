import bot from '../bot.mjs';
import db from '../db.mjs';
import createReplyMarkup from '../helpers/createReplyMarkup.mjs';
import createEventMessage from '../helpers/message-formater.mjs';

bot.on('inline_query', async (ctx) =>
{
  const now = Date.now();
  const events = db.data.events
    .filter(event => event.creator.id === ctx.update.inline_query.from.id && event.date.getTime() > now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(event => ({
      type: 'article',
      id: event.id,
      title: event.description.text,
      description: event.date.toLocaleDateString(event.creator.language_code),
      input_message_content:
        {
          message_text: createEventMessage(event),
          parse_mode: 'HTML',
        },
      ...createReplyMarkup(event),
    }));

  return await ctx.answerInlineQuery(events, {
    is_personal: true,
    cache_time: 0,
    switch_pm_text: ctx.i18n.t('create.button'),
    switch_pm_parameter: 'create',
  });
});

bot.on('chosen_inline_result', async ({ update }) =>
{
  const event = db.data.events.find(it => it.id === update.chosen_inline_result.result_id);
  if (event)
  {
    event.subscribers.push({
      inlineMessageId: update.chosen_inline_result.inline_message_id,
    });
    await db.write();
  }
});