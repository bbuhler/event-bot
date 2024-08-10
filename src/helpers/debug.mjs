import createDebug from 'debug';
import * as Sentry from '@sentry/node';

export default function (namespace) {
  const debug = createDebug(namespace);

  return function (message, ...args) {
    debug(message, ...args);

    Sentry.addBreadcrumb({
      category: namespace,
      type: 'debug',
      level: 'debug',
      timestamp: Date.now() / 1000,
      message,
      data: Object.fromEntries(args.entries()),
    }, Object.fromEntries(args.entries()));
  }
}