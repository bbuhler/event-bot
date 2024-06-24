import replyCommandScene from '../helpers/replyCommandScene.mjs';

// TODO add debug

export function remove() {
  return replyCommandScene('manage-participant', { remove: true });
}

