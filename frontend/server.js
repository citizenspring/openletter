/**
 * Custom server for the openletter frontend (`npm start` -> `node server.js`).
 *
 * History: on Next 10 this file stripped unparseable Accept-Language headers,
 * because Next's i18n layer parsed them with @hapi/accept outside any
 * try/catch and a garbage header (bots send them daily) killed the process
 * (crash of 2026-08-20, PR #63). Next 15 wraps that parse in a try/catch
 * (next/dist/shared/lib/i18n/get-locale-redirect.js) and falls back to the
 * default locale, so the guard was removed with the Next 15 upgrade; verified
 * with `curl -H 'Accept-Language: ;;;garbage=='`.
 */

const http = require('http');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
// Production unless explicitly asked otherwise: `npm start` runs this file
// without NODE_ENV, and `next start` (which this replaced) always meant prod.
// Defaulting to dev put the on-demand dev compiler in production, where a
// failed compile left the server hung (outage of 2026-10-12).
const dev = process.env.NODE_ENV === 'development';
const app = next({ dev, hostname: '0.0.0.0', port });
const handle = app.getRequestHandler();

// Last resort: a future framework-level throw should become a loud log line,
// not a dead process. Page-level errors are already handled in lib/api.js.
process.on('unhandledRejection', (reason) => {
  console.error('[server] unhandled rejection (process kept alive):', reason);
});

app.prepare().then(() => {
  http
    .createServer((req, res) => {
      handle(req, res);
    })
    .listen(port, '0.0.0.0', () => {
      console.log(`ready - started server on 0.0.0.0:${port}, url: http://localhost:${port}`);
    });
});
