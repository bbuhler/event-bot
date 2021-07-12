import bot from '../bot.mjs';
import replyCommandScene from '../helpers/replyCommandScene.mjs';

bot.command('limit', replyCommandScene('limit-participants'));