import path from 'path';
import { Scenes, session, Telegraf } from 'telegraf';
import TelegrafI18n from 'telegraf-i18n';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bot = new Telegraf(process.env.BOT_TOKEN);

export const stage = new Scenes.Stage();
export const i18n = new TelegrafI18n({
  defaultLanguage: 'en',
  defaultLanguageOnMissing: true,
  directory: path.resolve(__dirname, 'locales'),
});

bot.use(session());
bot.use(i18n.middleware());
bot.use(stage.middleware());

export default bot;
