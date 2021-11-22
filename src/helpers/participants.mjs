function findParticipant(event, user)
{
  const participantIndex = event.participants.findIndex(it =>
    (user.id && it.id === user.id) || (user.username && it.username === user.username));

  return {
    participant: event.participants[participantIndex],
    participantIndex,
  };
}

export function addParticipant(event, user)
{
  const { participant } = findParticipant(event, user);

  if (participant)
  {
    participant.escort++;

    if (!participant.id && user.id)
    {
      participant.id = user.id;
      participant.first_name = user.first_name;
      participant.last_name = user.last_name;
    }

    return false;
  }

  event.participants.push({
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    escort: 0,
  });

  return true;
}

export function removeParticipant(event, user)
{
  const { participant, participantIndex } = findParticipant(event, user);

  if (participant)
  {
    if (participant.escort)
    {
      participant.escort--;
    }
    else
    {
      event.participants.splice(participantIndex, 1);
    }

    return true;
  }
}