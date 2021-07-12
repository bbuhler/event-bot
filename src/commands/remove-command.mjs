import bot from '../bot.mjs';
import replyCommandScene from '../helpers/replyCommandScene.mjs';

bot.command('remove', replyCommandScene('manage-participant', { remove: true }));