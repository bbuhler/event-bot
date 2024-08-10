import createDebug from '../helpers/debug.mjs';

const debug = createDebug('bot:start_command');

export function startCommand() {
  return async (ctx) => {
    const user = ctx.update.message.from;
    debug(`Triggered "start" command for user ${user.first_name} (${user.id})`);

    await ctx.reply(ctx.i18n.command.start.reply(user.first_name, ctx.botInfo));

    if (ctx.update.message.text === '/start create') {
      debug(`Continue with create event scene`);

      return ctx.scene.enter('create-event');
    }
  };
}