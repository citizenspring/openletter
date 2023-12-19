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
    letters.featured.en = await Letter.list('en', true);
  }
  letters.latest = await Letter.list();
}

function updateData() {
  computeStats();
  updateLatestLetters();
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
        : await Letter.list(locale, true);

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
