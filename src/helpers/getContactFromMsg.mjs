export default function({ contact, text, entities })
{
  if (contact)
  {
    contact.id = contact.user_id || contact.id;
    return contact;
  }

  const mention = entities?.find(it => it.type === 'mention' || it.type === 'text_mention');

  if (mention)
  {
    if (mention.user)
    {
      return mention.user;
    }
    else
    {
      const username = text.substr(mention.offset + 1, mention.length);
      return { username };
    }
  }
}