import bot from '../bot.mjs';

bot.command('create', ({ scene }) =>
{
  scene.enter('create-event');
});