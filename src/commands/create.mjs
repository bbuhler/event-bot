import createDebug from '../helpers/debug.mjs';

const debug = createDebug('bot:create_command');

export function createCommand() {
  return ({ scene }) => {
    debug(`Triggered "create" command. Continue with create event scene`);
    return scene.enter('create-event');
  };
}