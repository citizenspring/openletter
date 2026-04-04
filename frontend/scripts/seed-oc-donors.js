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
const fetch = require('node-fetch');

const OUTPUT_PATH = path.join(__dirname, '../public/data/donors.json');

const query = `
  query getCollectiveTransactions($offset: Int) {
    Collective(slug: "openletter") {
      currency
      stats {
        balance
        totalAmountReceived
        totalAmountSpent
        backers {
          all
        }
      }
      expenses(limit: 5) {
        id
        createdAt
        description
        amount
        status
      }
      transactions(type: "CREDIT", limit: 1000, offset: $offset) {
        id
        createdAt
        amount
        currency
        fromCollective {
          slug
          name
        }
      }
    }
  }
`;

async function main() {
  const apiUrl = process.env.OC_GRAPHQL_API || 'https://api.opencollective.com/graphql/v1';

  console.log(`Fetching OC transactions from ${apiUrl}...`);

  let allTransactions = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { offset } }),
    });

    const json = await res.json();
    const transactions = json.data.Collective.transactions;

    if (transactions.length === 0) {
      hasMore = false;
    } else {
      allTransactions = allTransactions.concat(transactions);
      offset += transactions.length;
      console.log(`  Fetched ${allTransactions.length} transactions so far...`);
      // Safety: OC caps at 1000 per query
      if (transactions.length < 1000) hasMore = false;
    }

    // Store stats + expenses from first response
    if (offset === transactions.length) {
      var stats = json.data.Collective.stats;
      var currency = json.data.Collective.currency;
      var expenses = json.data.Collective.expenses;
    }
  }

  console.log(`Found ${allTransactions.length} CREDIT transactions total`);

  // Aggregate by donor: sum amounts, keep earliest date
  const donorMap = new Map();
  for (const tx of allTransactions) {
    const name = tx.fromCollective?.name;
    if (!name || name === 'Guest' || name === 'Citizen Spring') continue;

    const slug = tx.fromCollective.slug;
    const key = slug || name.toLowerCase();

    if (donorMap.has(key)) {
      const existing = donorMap.get(key);
      existing.amount += tx.amount / 100;
      // Keep earliest date
      if (tx.createdAt < existing.date) existing.date = tx.createdAt.split('T')[0];
    } else {
      donorMap.set(key, {
        name,
        amount: tx.amount / 100,
        currency: tx.currency || 'USD',
        date: tx.createdAt.split('T')[0],
        source: 'opencollective',
        ocSlug: slug,
      });
    }
  }

  const ocDonors = Array.from(donorMap.values());
  console.log(`Found ${ocDonors.length} unique OC donors`);

  // Load existing file if any (keep non-OC donors)
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
      currency,
      balance: stats.balance,
      totalReceived: stats.totalAmountReceived,
      totalSpent: stats.totalAmountSpent,
    },
    expenses: (expenses || []).map((e) => ({
      id: e.id,
      description: e.description,
      amount: e.amount / 100,
      status: e.status,
      date: e.createdAt.split('T')[0],
    })),
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
