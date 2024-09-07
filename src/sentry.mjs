import * as Sentry from '@sentry/node';

// Ensure to call this before importing any other modules!
if (!Sentry.isInitialized()) {
  Sentry.init({
    dsn: 'https://5a7ce7aa76c2809f84b43f411a9af3be@o226409.ingest.us.sentry.io/4507751695581184',
    environment: process.env.VERCEL_ENV ?? 'development',
  });
}
