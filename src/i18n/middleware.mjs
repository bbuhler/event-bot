import en from './en.mjs';
import de from './de.mjs';

function isObject(item) {
  return (item && typeof item === 'object');
}

function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

export const availableLocales = { en, de };

export function i18nMiddleware() {
  return (ctx, next) => {
    const locale = ctx.from?.language_code || 'en';

    if (locale !== 'en' && locale in availableLocales) {
      ctx.i18n = mergeDeep({}, en, availableLocales[locale]);
    } else {
      ctx.i18n = en;
    }

    return next();
  };
}