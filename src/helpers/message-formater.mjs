import { i18n } from '../bot.mjs';
import { calendarEmoji, forbiddenEmoji } from './emoji.mjs';

function getParticipantName(participant)
{
  if (participant.first_name?.length > 1 || !participant.username)
  {
    return participant.first_name + (participant.last_name ? ` ${participant.last_name}` : '');
  }

  return participant.username;
}

function createParticipant(participant)
{
  return (participant.id ? `<a href="tg://user?id=${participant.id}">${getParticipantName(participant)}</a>` : `@${participant.username}`) +
    (participant.escort ? ` +${participant.escort}` : '');
}

function createParticipantsList({ participants, limit = Infinity, creator, canceled })
{
  const locale = creator.language_code;
  const list = [];

  if (canceled)
  {
    return `${forbiddenEmoji} ${i18n.t(locale, 'event.canceled')}`;
  }

  if (participants.length)
  {
    const attending = [];
    const waiting = [];
    let attendingCount = 0;
    let waitingCount = 0;

    participants.forEach(participant =>
    {
      if (attendingCount < limit)
      {
        attending.push(participant);
        attendingCount += participant.escort + 1;
      }
      else
      {
        waiting.push(participant);
        waitingCount += participant.escort + 1;
      }
    });

    list.push(
      `${i18n.t(locale, 'event.participants')} (${attendingCount}${limit === Infinity ? '' : `/${limit}`}):`,
      ...attending.map(createParticipant)
    );

    if (waiting.length)
    {
      list.push(
        '',
        `${i18n.t(locale, 'event.participants-waiting')} (${waitingCount}):`,
        ...waiting.map(createParticipant)
      );
    }

    return list.join('\n');
  }
  else if (limit !== Infinity)
  {
    return i18n.t(locale, 'event.participants-available', { limit });
  }

  return '';
}

function createDescription(description)
{
  // TODO apply message entities
}

export default function createEventMessage(event)
{
  const locale = event.creator.language_code;
  const date = event.date.toLocaleDateString(locale);
  const canceledPrefix = event.canceled ? i18n.t(locale, 'event.canceled-prefix') : '';

  return [
    `${calendarEmoji} <b>${canceledPrefix}${date}</b>`,
    '',
    // createDescription(event.description),
    event.description.text,
    '',
    createParticipantsList(event),
  ].join('\n');
}