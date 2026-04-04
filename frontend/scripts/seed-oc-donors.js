#!/usr/bin/env node

/**
 * seed-oc-donors.js
 *
 * One-time script to fetch current OpenCollective backers and seed donors.json.
 * Run once before sunsetting the OC GraphQL integration.
 *
 * Usage: OC_GRAPHQL_API=https://api.opencollective.com/graphql/v1 node scripts/seed-oc-donors.js
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, '../public/data/donors.json');

const query = `
  query getCollectiveBackers {
    Collective(slug: "openletter") {
      members(role: "BACKER") {
        publicMessage
        member {
          slug
          name
        }
      }
      currency
      stats {
        balance
        totalAmountReceived
        totalAmountSpent
        backers {
          all
        }
      }
    }
  }
`;

async function main() {
  const apiUrl = process.env.OC_GRAPHQL_API || 'https://api.opencollective.com/graphql/v1';

  console.log(`Fetching OC backers from ${apiUrl}...`);

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const json = await res.json();
  const members = json.data.Collective.members;
  const stats = json.data.Collective.stats;

  const ocDonors = members
    .filter((m) => m.member.name !== 'Guest')
    .map((m) => ({
      name: m.member.name,
      source: 'opencollective',
      ocSlug: m.member.slug,
    }));

  console.log(`Found ${ocDonors.length} OC backers`);

  // Load existing file if any
  let existing = [];
  try {
    const data = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
    existing = (data.donors || []).filter((d) => d.source !== 'opencollective');
  } catch {}

  const allDonors = [...existing, ...ocDonors];

  const output = {
    donors: allDonors,
    stats: {
      total: allDonors.length,
      stripe: allDonors.filter((d) => d.source === 'stripe').length,
      opencollective: allDonors.filter((d) => d.source === 'opencollective').length,
    },
    ocLegacy: {
      currency: json.data.Collective.currency,
      balance: stats.balance,
      totalReceived: stats.totalAmountReceived,
      totalSpent: stats.totalAmountSpent,
    },
    lastUpdated: new Date().toISOString(),
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  console.log(`Wrote ${allDonors.length} donors to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('seed-oc-donors failed:', err);
  process.exit(1);
});
