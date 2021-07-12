import bot from '../bot.mjs';

bot.command('start', async ctx =>
{
  await ctx.reply(ctx.i18n.t('start', {
    name: ctx.update.message.from.first_name,
    botInfo: ctx.botInfo,
  }));

  if (ctx.update.message.text === '/start create')
  {
    return ctx.scene.enter('create-event');
  }
});