import createDebug from 'debug';

const debug = createDebug('bot:create_command');

export function create() {
  return ({ scene }) => {
    debug(`Triggered "create" command. Continue with create event scene`);
    scene.enter('create-event');
  };
}