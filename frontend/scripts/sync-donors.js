#!/usr/bin/env node

/**
 * sync-donors.js
 *
 * Fetches donors from Stripe (payment link checkout sessions) and merges
 * with existing OpenCollective donors into a single donors.json file.
 *
 * Usage: STRIPE_SECRET_KEY=rk_xxx node scripts/sync-donors.js
 * Or:    npm run cron
 *
 * Output: ../frontend/public/data/donors.json
 */

const fs = require('fs');
const path = require('path');

const PAYMENT_LINK_ID = 'plink_1TGev1FAhaWeDyowQqEek3mT';
const OUTPUT_PATH = path.join(__dirname, '../public/data/donors.json');

async function fetchStripeDonors() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('Missing STRIPE_SECRET_KEY env var');
    process.exit(1);
  }

  const Stripe = require('stripe');
  const stripe = new Stripe(secretKey);

  const donors = [];
  let hasMore = true;
  let startingAfter = null;

  console.log(`Fetching checkout sessions for payment link ${PAYMENT_LINK_ID}...`);

  while (hasMore) {
    const params = {
      payment_link: PAYMENT_LINK_ID,
      limit: 100,
      expand: ['data.customer_details'],
    };
    if (startingAfter) params.starting_after = startingAfter;

    const sessions = await stripe.checkout.sessions.list(params);

    for (const session of sessions.data) {
      if (session.payment_status !== 'paid') continue;

      // Use the optional custom field "display name for the donors list"
      // If empty/missing, the donor chose to remain anonymous
      const customField = (session.custom_fields || []).find(
        (f) => f.key === 'displaynameforthedonorslist'
      );
      const name = customField?.text?.value || null;

      if (!name) continue;

      donors.push({
        name,
        amount: session.amount_total ? session.amount_total / 100 : null,
        currency: session.currency || 'eur',
        date: new Date(session.created * 1000).toISOString().split('T')[0],
        source: 'stripe',
      });
    }

    hasMore = sessions.has_more;
    if (sessions.data.length > 0) {
      startingAfter = sessions.data[sessions.data.length - 1].id;
    }
  }

  console.log(`Found ${donors.length} Stripe donors`);
  return donors;
}

function loadExisting() {
  try {
    return JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function deduplicateDonors(donors) {
  const seen = new Map();
  for (const donor of donors) {
    const key = `${donor.name.toLowerCase()}:${donor.source}:${donor.date || ''}`;
    if (!seen.has(key)) {
      seen.set(key, donor);
    }
  }
  return Array.from(seen.values());
}

async function main() {
  const stripeDonors = await fetchStripeDonors();

  // Keep existing data from the file (OC donors, expenses, ocLegacy)
  const existing = loadExisting();
  const ocDonors = (existing.donors || []).filter((d) => d.source === 'opencollective');

  const allDonors = deduplicateDonors([...stripeDonors, ...ocDonors]);

  // Sort by date (newest first)
  allDonors.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const output = {
    donors: allDonors,
    stats: {
      total: allDonors.length,
      stripe: allDonors.filter((d) => d.source === 'stripe').length,
      opencollective: allDonors.filter((d) => d.source === 'opencollective').length,
    },
    // Preserve OC legacy data (expenses, balance, etc.) from seed-oc-donors.js
    ...(existing.ocLegacy ? { ocLegacy: existing.ocLegacy } : {}),
    ...(existing.expenses ? { expenses: existing.expenses } : {}),
    lastUpdated: new Date().toISOString(),
  };

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  console.log(`Wrote ${allDonors.length} donors to ${OUTPUT_PATH}`);
  console.log(`  Stripe: ${output.stats.stripe}, OpenCollective: ${output.stats.opencollective}`);
}

main().catch((err) => {
  console.error('sync-donors failed:', err);
  process.exit(1);
});
