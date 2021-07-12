import bot from '../bot.mjs';
import replyCommandScene from '../helpers/replyCommandScene.mjs';

bot.command('add', replyCommandScene('manage-participant', { add: true }));