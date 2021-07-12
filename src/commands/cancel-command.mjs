import bot from '../bot.mjs';
import replyCommandScene from '../helpers/replyCommandScene.mjs';

bot.command('cancel', replyCommandScene('cancel-event'));