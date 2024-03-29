import { Scenes } from 'telegraf';
import { stage } from '../bot.mjs';
import db from '../db.mjs';
import updateSubscribers from '../helpers/updateSubscribers.mjs';

function getLimitFromMessage({ text, entities })
{
  if (entities?.length === 1 && entities[0].type === 'bot_command')
  {
    return parseInt(text.substr(entities[0].length));
  }

  return parseInt(text);
}

stage.register(new Scenes.WizardScene
(
  'limit-participants',
  async ctx =>
  {
    const limit = getLimitFromMessage(ctx.message);

    if (Number.isInteger(limit))
    {
      const { event } = ctx.wizard.state;

      if (event.limit !== (limit || undefined))
      {
        event.limit = limit || undefined;
        await db.write();
        await updateSubscribers(ctx.telegram, event);
      }

      if (limit)
      {
        await ctx.reply(ctx.i18n.t('limit.reply'));
      }
      else
      {
        await ctx.reply(ctx.i18n.t('limit.removed'));
      }

      return await ctx.scene.leave();
    }

    await ctx.reply(ctx.i18n.t('limit.question'));
  }
));