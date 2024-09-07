import '../src/sentry.mjs';

import { Telegraf } from 'telegraf';
import * as Sentry from '@sentry/node';

import * as db from '../src/db.mjs';
import { updateSubscribers } from '../src/helpers/updateSubscribers.mjs';

export default async function handle(req, res) {
  try {
    const ENVIRONMENT = process.env.NODE_ENV || '';
    const BOT_TOKEN = process.env.BOT_TOKEN || '';
    const bot = new Telegraf(BOT_TOKEN, {
      telegram: { webhookReply: ENVIRONMENT !== 'production' },
    });

    const users = await db.getAllUserKeys();
    const expiredEvents = await db.getExpiredEvents(users);
    const canceledEventAndAuthorIds = await db.getCanceledEventIds(users);

    for (const event of expiredEvents) {
      await updateSubscribers(bot.telegram, event);
    }

    const eventsToDelete = new Map();

    for (const eventAndAuthorId of expiredEvents.map(event => event.id).concat(canceledEventAndAuthorIds)) {
      const [userId, eventId] = eventAndAuthorId.split(':');

      if (eventsToDelete.has(userId)) {
        eventsToDelete.get(userId).add(eventId);
      } else {
        eventsToDelete.set(userId, new Set([eventId]));
      }
    }

    await Promise.all(Array.from(eventsToDelete, ([userId, eventIds]) => db.deleteEvents(userId, Array.from(eventIds))));

    res.status(204).send();
  } catch (err) {
    Sentry.captureException(err);
    console.error(err.message);
    res.status(500).send();
  }
}