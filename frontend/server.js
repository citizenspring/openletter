/**
 * Custom server whose only job is to keep malformed headers away from Next.
 *
 * Next 10's i18n layer parses Accept-Language with @hapi/accept inside
 * Server.handleRequest — before any page code runs. A garbage header (bots
 * send them daily) throws there, nothing catches it, and on Node >= 15 the
 * unhandled rejection kills the whole process. Captured in production:
 *
 *   Error: Invalid accept-language header
 *       at Object.internals.parse (@hapi/accept/lib/header.js:117)
 *       at Server.handleRequest (next/dist/next-server/server/next-server.js:17)
 *
 * The header is validated with the exact same parser Next uses, so anything
 * that would crash Next gets stripped and the request proceeds in the
 * default locale. Upstream fixed this in later Next majors; this is the
 * containment until that upgrade happens.
 */

const http = require('http');
const next = require('next');
const accept = require('@hapi/accept'); // Next 10's own dependency

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

function sanitizeAcceptLanguage(req) {
  const header = req.headers['accept-language'];
  if (header === undefined) return;
  try {
    accept.language(header);
  } catch (e) {
    console.warn(
      `[server] stripped invalid accept-language ${JSON.stringify(String(header).slice(0, 100))} from ${req.url}`,
    );
    delete req.headers['accept-language'];
  }
}

// Last resort: a future framework-level throw should become a loud log line,
// not a dead process. Page-level errors are already handled in lib/api.js.
process.on('unhandledRejection', (reason) => {
  console.error('[server] unhandled rejection (process kept alive):', reason);
});

app.prepare().then(() => {
  http
    .createServer((req, res) => {
      sanitizeAcceptLanguage(req);
      handle(req, res);
    })
    .listen(port, '0.0.0.0', () => {
      console.log(`ready - started server on 0.0.0.0:${port}, url: http://localhost:${port}`);
    });
});
