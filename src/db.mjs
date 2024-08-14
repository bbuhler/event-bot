import { Redis } from '@upstash/redis';
import { customAlphabet } from 'nanoid';
import createDebug from './helpers/debug.mjs';
import { dbNamespace } from './config.mjs';

export const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const debug = createDebug('bot:db');

const sessionPrefix = `${dbNamespace}:session:`;
const sessionDebug = createDebug('bot:db:session');
export const redisSessionStore = {
  async get(key) {
    const [value] = await redis.json.get(sessionPrefix + key, '$') ?? [];
    sessionDebug(`GET key=${key} value=%j`, value);
    return value;
  },
  async set(key, session) {
    sessionDebug(`SET key=${key} value=%j`, session);
    await redis.json.set(sessionPrefix + key, '$', session);
    await redis.expire(sessionPrefix + key, 30 * 24 * 60 * 60);
  },
  async delete(key) {
    sessionDebug(`DEL key=${key}`);
    await redis.del(sessionPrefix + key);
  },
};

export async function createUser(author) {
  const { id, ...user } = author;
  const key = `${dbNamespace}:user:${id}`;
  user.events = {};

  await redis.json.set(key, '$', user, { nx: true });
}

export async function createEvent(event) {
  const [authorId, eventId] = event.id.split(':');
  const key = `${dbNamespace}:user:${authorId}`;
  const path = `$.events.${eventId}`;

  await redis.json.set(key, path, event);
}

export async function addEventSubscriber(authorAndEventId, subscriber) {
  const [authorId, eventId] = authorAndEventId.split(':');
  const key = `${dbNamespace}:user:${authorId}`;
  const path = `$.events.${eventId}.subscribers`;

  await redis.json.arrappend(key, path, subscriber);
}

export async function addEventParticipant(authorAndEventId, { id, ...participant }) {
  const [authorId, eventId] = authorAndEventId.split(':');
  const key = `${dbNamespace}:user:${authorId}`;
  const path = `$.events.${eventId}.participants.${id}`;

  const result = await redis.json.set(key, path, {
    first_name: participant.first_name,
    last_name: participant.last_name,
    username: participant.username,
    escort: 0,
    added: new Date(),
  }, { nx: true });

  if (result === null) {
    await redis.json.numincrby(key, `${path}.escort`, 1);
    return false;
  }

  return true;
}

export async function removeEventParticipant(authorAndEventId, participantId) {
  const [authorId, eventId] = authorAndEventId.split(':');
  const key = `${dbNamespace}:user:${authorId}`;
  const path = `$.events.${eventId}.participants.${participantId}`;

  const [escort] = await redis.json.numincrby(key, `${path}.escort`, -1);

  if (escort < 0) {
    await redis.json.del(key, path);
    return true;
  }

  return false;
}

export async function getAuthorEvents(authorId) {
  const key = `${dbNamespace}:user:${authorId}`;
  const path = '$.events.*';

  const events = await redis.json.get(key, path);

  return events.map(event => ({
    ...event,
    date: new Date(event.date),
  })).sort((a, b) => a.date.getTime() - b.date.getTime());
}

export async function getEvent(authorAndEventId) {
  const [authorId, eventId] = authorAndEventId.split(':');
  const key = `${dbNamespace}:user:${authorId}`;
  const path = `$.events.${eventId}`;

  const [event] = await redis.json.get(key, path);
  event.date = new Date(event.date);

  return event;
}

export async function getAuthorAndEventIdByDescriptionMessageId(authorId, messageId) {
  const key = `${dbNamespace}:user:${authorId}`;
  const path = `$.events[?(@.descriptionMessageId==${messageId})].id`;

  const [id] = await redis.json.get(key, path);

  return id;
}

export async function updateEventDescription(authorAndEventId, message) {
  const [authorId, eventId] = authorAndEventId.split(':');
  const key = `${dbNamespace}:user:${authorId}`;
  const path = `$.events.${eventId}.description`;

  await redis.json.set(key, path, {
    text: message.text,
    entities: message.entities,
  });
}

export async function updateEventDate(authorAndEventId, date) {
  const [authorId, eventId] = authorAndEventId.split(':');
  const key = `${dbNamespace}:user:${authorId}`;
  const path = `$.events.${eventId}.date`;

  await redis.json.set(key, path, JSON.stringify(Date.parse(date)));
}

export async function cancelEvent(authorAndEventId) {
  const [authorId, eventId] = authorAndEventId.split(':');
  const key = `${dbNamespace}:user:${authorId}`;
  const path = `$.events.${eventId}.canceled`;

  await redis.json.set(key, path, true);
}

export async function getAllUserKeys() {
  const keys = [];
  let cursor = 0;

  debug(`scan match ${dbNamespace}:user:*`);

  do {
    let results;
    [cursor, ...results] = await redis.scan(cursor, { match: `${dbNamespace}:user:*` });
    keys.push(...results.flat());
  } while (cursor > 0);

  return keys;
}

export async function getExpiredEvents(users) {
  const yesterday = Date.now() - (24 * 60 * 60 * 1000);

  if (!users.length) {
    return [];
  }

  const results = await redis.json.mget(users, `$.events[?(@.date<${yesterday})]`);
  return results.flat().filter(it => !!it);
}

export async function getCanceledEventIds(users) {
  if (!users.length) {
    return [];
  }

  const results = await redis.json.mget(users, `$.events[?(@.canceled==true)].id`);
  return results.flat().filter(it => !!it);
}

export async function deleteEvents(userId, eventIds) {
  await Promise.all(eventIds.map(eventId => {
    const key = `${dbNamespace}:user:${userId}`;
    const path = `$.events.${eventId}`;

    return redis.json.del(key, path);
  }));
}