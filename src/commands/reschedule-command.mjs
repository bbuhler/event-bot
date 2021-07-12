import bot from '../bot.mjs';
import replyCommandScene from '../helpers/replyCommandScene.mjs';

bot.command('reschedule', replyCommandScene('reschedule-event'));