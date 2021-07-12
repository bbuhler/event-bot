import { CronJob } from 'cron';
import bot from '../bot.mjs';
import db from '../db.mjs';
import updateSubscribers from '../helpers/updateSubscribers.mjs';

export default new CronJob('00 00 00 * * *', async () =>
{
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiredEvents = db.data.events.filter(event => event.date < today);

  if (expiredEvents.length > 0)
  {
    console.log('Clear Database from %d expired events', expiredEvents.length);

    // Close event subscriptions
    await Promise.all(expiredEvents.map(event => updateSubscribers(bot.telegram, event)));

    db.data.events = db.data.events.filter(event => event.date >= today);
    await db.write();

    console.log('Database clean up done.')
  }
});