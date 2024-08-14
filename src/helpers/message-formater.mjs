import { fmt, FmtString, join, mention } from 'telegraf/format';

export function getParticipantName(participant) {
  if (participant.first_name?.length > 1 || !participant.username) {
    return participant.first_name + (participant.last_name ? ` ${participant.last_name}` : '');
  }

  return participant.username;
}

function createParticipant(participant) {
  const escort = (participant.escort ? ` +${participant.escort}` : '');

  if (participant.id) {
    return fmt`${mention(getParticipantName(participant), parseInt(participant.id))}${escort}`;
  }

  return fmt`@${participant.username}${escort}`;
}

function createParticipantsList(i18n, { participants, limit = Infinity, canceled }) {
  const list = [];

  if (canceled) {
    return i18n.message.event.canceled();
  }

  const attending = [];
  const waiting = [];
  let attendingCount = 0;
  let waitingCount = 0;

  const participantsList = Object.entries(participants)
    .map(([id, participant]) => ({
      id,
      ...participant,
      added: Date.parse(participant.added),
    }))
    .sort((a, b) => a.added - b.added);

  for (const participant of participantsList) {
    if (attendingCount < limit) {
      attending.push(participant);
      attendingCount += participant.escort + 1;
    } else {
      waiting.push(participant);
      waitingCount += participant.escort + 1;
    }
  }

  list.push(
    i18n.message.event.commitments(attendingCount),
    ...attending.map(createParticipant),
  );

  if (waiting.length) {
    list.push(
      '',
      i18n.message.event.participants.waiting(waitingCount),
      ...waiting.map(createParticipant),
    );
  }

  if (attendingCount > 0) {
    return join(list, '\n');
  }

  if (attendingCount === 0 && limit !== Infinity) {
    return i18n.message.event.participants.available(limit);
  }

  return '';
}

function createDescription(description) {
  return new FmtString(description.text, description.entities);
}

export default function createEventMessage(i18n, event) {
  return join([
    i18n.message.event.title(event.date, event.canceled),
    '',
    createDescription(event.description),
    '',
    createParticipantsList(i18n, event),
  ], '\n');
}