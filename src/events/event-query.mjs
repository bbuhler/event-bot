import * as db from '../db.mjs';
import createReplyMarkup from '../helpers/createReplyMarkup.mjs';
import createEventMessage from '../helpers/message-formater.mjs';
import { calendarEmoji } from '../helpers/emoji.mjs';
import createDebug from '../helpers/debug.mjs';

const debug = createDebug('bot:event_query');

async function getEventsFromInlineQuery(inlineQuery) {
  if (inlineQuery.query) {
    const event = await db.getEvent(inlineQuery.query);
    return [event];
  }

  return db.getAuthorEvents(inlineQuery.from.id);
}

export function inlineQuery() {
  return async (ctx) => {
    debug(`Query: ${ctx.update.inline_query.query}`);

    const events = (await getEventsFromInlineQuery(ctx.update.inline_query))
      .map(event => {
        const message = createEventMessage(ctx, event);

        return {
          type: 'article',
          id: event.id,
          title: `${calendarEmoji} ${event.date.toLocaleDateString(event.locale)}`,
          description: event.description.text.replace(/\n+/g, ' '),
          input_message_content: {
            message_text: message.text,
            entities: message.entities,
            link_preview_options: { is_disabled: true },
          },
          ...createReplyMarkup(ctx, event),
        };
      });

    return await ctx.answerInlineQuery(events, {
      is_personal: true,
      cache_time: 30,
      switch_pm_text: ctx.i18n.inlineQuery.create.button,
      switch_pm_parameter: 'create',
    });
  };
}

export function chosenInlineResult() {
  return async ({ update }) => {
    debug(`Chosen result: ${update.chosen_inline_result.result_id}`);
    await db.addEventSubscriber(update.chosen_inline_result.result_id, {
      inlineMessageId: update.chosen_inline_result.inline_message_id,
    });
    debug(`Added inline message id: ${update.chosen_inline_result.inline_message_id} as subscriber to event ${update.chosen_inline_result.result_id}`);
  };
}