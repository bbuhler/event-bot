import '../src/sentry.mjs';

import { startVercel } from '../src/index.mjs';

export default async function handle(req, res) {
  try {
    await startVercel(req, res);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1>Server Error</h1><p>Sorry, there was a problem</p>');
    console.error(err.message);
  }
}
