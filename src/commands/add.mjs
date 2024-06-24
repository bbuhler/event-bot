import replyCommandScene from '../helpers/replyCommandScene.mjs';

// TODO add debug

export function add() {
  return replyCommandScene('manage-participant', { add: true });
}
