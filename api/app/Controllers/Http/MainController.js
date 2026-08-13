'use strict';
const Letter = use('App/Models/Letter');
const Signature = use('App/Models/Signature');

const stats = {};
const letters = {
  latest: [],
  featured: {
    en: [],
    fr: [],
    nl: [],
    ar: [],
    tr: [],
  },
};

async function computeStats() {
  const totalLetters = await Letter.query().whereNull('parent_letter_id').groupBy('slug').count('* as total');
  const totalSignatures = await Signature.query().count('* as total');
  stats.letters = totalLetters.length;
  stats.signatures = parseInt(totalSignatures[0].total, 10);
}

async function updateLatestLetters() {
  if (!letters.featured) {
    letters.featured.en = await Letter.list({ locale: 'en', featured: true });
  }
  letters.latest = await Letter.list({ locale: 'en', limit: 9 });
}

function updateData() {
  // Both of these are async, and their promises are not awaited. Without a
  // catch, a single failed query (a connection blip, a pool timeout) becomes an
  // unhandled rejection — which terminates the process on Node >= 15 and takes
  // the API down with every request in flight. Stale stats for five minutes is
  // the better failure mode.
  computeStats().catch((e) => console.error('>>> failed to compute stats:', e.message));
  updateLatestLetters().catch((e) => console.error('>>> failed to update latest letters:', e.message));
}
updateData();
setInterval(updateData, 1000 * 60 * 5); // we recompute stats and latest letters every 5 minutes

class MainController {
  async stats({ request, response }) {
    console.log('GET', '/stats');

    response.header('Cache-Control', 'public, max-age=300');

    return stats;
  }

  async homepage(ctx) {
    console.log('GET', '/homepage');

    ctx.response.header('Cache-Control', 'public, max-age=300');
    const request = ctx.request.only(['locale']);
    const locale = request.locale || 'en';
    letters.featured[locale] =
      letters.featured[locale] && letters.featured[locale].length > 0
        ? letters.featured[locale]
        : await Letter.list({ locale, featured: true });

    return {
      stats,
      letters: {
        latest: letters.latest,
        featured: letters.featured[locale],
      },
    };
  }
}

module.exports = MainController;
