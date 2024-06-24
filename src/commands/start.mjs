import createDebug from 'debug';

const debug = createDebug('bot:start_command');

export function start() {
  return async (ctx) => {
    const user = ctx.update.message.from;
    debug(`Triggered "start" command for user ${user.first_name} (${user.id})`);

    await ctx.reply(ctx.i18n.t('start', {
      name: user.first_name,
      botInfo: ctx.botInfo,
    }));

    if (ctx.update.message.text === '/start create') {
      debug(`Continue with create event scene`);

      return ctx.scene.enter('create-event');
    }
  };
}