import bot from './bot.mjs';

import './wizards/create-event-wizard.mjs';
import './wizards/limit-participants-wizard.mjs';
import './wizards/manage-participant-wizard.mjs';
import './wizards/reschedule-event-wizard.mjs';
import './wizards/cancel-event-wizard.mjs';

import './commands/start-command.mjs';
import './commands/create-command.mjs';
import './commands/limit-command.mjs';
import './commands/add-command.mjs';
import './commands/remove-command.mjs';
import './commands/reschedule-command.mjs';
import './commands/cancel-command.mjs';
import './commands/edited-message.mjs';
import './queries/event-query.mjs';
import './actions/rsvp-action.mjs';

import cleanUpJob from './jobs/clean-up-job.mjs';

bot.launch().then(() =>
{
  cleanUpJob.start();
  console.log('Bot is running.');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));