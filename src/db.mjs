import { JSONFile, Low } from 'lowdb';

class EventsJSON extends JSONFile
{
  write(obj)
  {
    const clone = { ...obj };

    clone.events = obj.events.map(event =>
    {
      if (event.date instanceof Date)
      {
        return {
          ...event,
          date: event.date.getTime(),
        };
      }

      return event;
    });

    return super.write(clone);
  }

  async read()
  {
    const obj = await super.read();

    obj.events = obj.events.map(event =>
    {
      if (Number.isInteger(event.date))
      {
        return {
          ...event,
          date: new Date(event.date),
        };
      }

      return event;
    });

    return obj;
  }
}

const file = process.env.DB_FILE || 'db/db.json';
const adapter = new EventsJSON(file);
const db = new Low(adapter);

await db.read()
db.data ||= { events: [] };

export default db;