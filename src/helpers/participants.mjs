export function addParticipant(event, user)
{
  const participantIndex = event.participants.findIndex(it => it.id === user.id || it.username === user.username);
  const participant = event.participants[participantIndex];

  if (participant)
  {
    participant.escort++;

    if (!participant.id && user.id)
    {
      participant.id = user.id;
      participant.first_name = user.first_name;
      participant.last_name = user.last_name;
    }
  }
  else
  {
    event.participants.push({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      escort: 0,
    });
  }
}

export function removeParticipant(event, user)
{
  const participantIndex = event.participants.findIndex(it => it.id === user.id || it.username === user.username);
  const participant = event.participants[participantIndex];

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