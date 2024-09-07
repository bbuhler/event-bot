import '../src/sentry.mjs';
import * as Sentry from '@sentry/node';

import { startVercel } from '../src/index.mjs';

export default async function handle(req, res) {
  try {
    await startVercel(req, res);
  } catch (err) {
    Sentry.captureException(err);
    console.error(err.message);
    res.status(500).send();
  }
}
