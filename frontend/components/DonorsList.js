import React, { useState } from 'react';
import useSWR from 'swr';
import { withIntl } from '../lib/i18n';

const fetcher = (url) => fetch(url).then((res) => res.json());

function DonorItem({ donor, rank }) {
  const link =
    donor.source === 'opencollective' && donor.ocSlug
      ? `https://opencollective.com/${donor.ocSlug}`
      : null;

  const name = link ? (
    <a href={link} title={donor.name}>{donor.name}</a>
  ) : (
    <span>{donor.name}</span>
  );

  return (
    <li className="flex items-center justify-between py-2 px-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-2">
        {rank && <span className="text-gray-400 text-sm w-6 text-right">{rank}.</span>}
        <span className="font-medium">{name}</span>
      </div>
      {donor.amount && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {donor.amount.toFixed(0)}€
        </span>
      )}
    </li>
  );
}

function DonorsList({ t, compact }) {
  const [showAll, setShowAll] = useState(false);
  const { data, error } = useSWR('/data/donors.json', fetcher);

  if (error) return null;
  if (!data) return <div className="text-center">Loading...</div>;

  const allDonors = (data.donors || []).filter((d) => d.name !== 'Guest');
  if (allDonors.length === 0) return null;

  // Compact mode: just names inline (for post-signature confirmation)
  if (compact) {
    return (
      <div className="text-center my-4">
        <h2 className="text-xl mt-4 text-center">Thank you to all our contributors 🙏</h2>
        <ul className="p-2 flex overflow-hidden flex-wrap justify-center list-none">
          {allDonors.slice(0, 20).map((donor, i) => (
            <li key={`${donor.name}-${i}`} className="mx-2">
              <span>{donor.name}</span>
            </li>
          ))}
          {allDonors.length > 20 && (
            <li className="mx-2 text-gray-500">and {allDonors.length - 20} more</li>
          )}
        </ul>
      </div>
    );
  }

  // Full mode: top 10 by amount, then all by date DESC
  const top10 = [...allDonors]
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 10);

  const byDate = [...allDonors]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const visibleDonors = showAll ? byDate : byDate.slice(0, 10);

  return (
    <div className="my-8">
      {/* Top contributors */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4 text-center">🏆 Top contributors</h2>
        <ul className="list-none p-0">
          {top10.map((donor, i) => (
            <DonorItem key={`top-${donor.name}-${i}`} donor={donor} rank={i + 1} />
          ))}
        </ul>
      </div>

      {/* All contributors by date */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-center">
          All contributors 🙏
          <span className="text-sm font-normal text-gray-500 ml-2">({allDonors.length})</span>
        </h2>
        <ul className="list-none p-0">
          {visibleDonors.map((donor, i) => (
            <DonorItem key={`all-${donor.name}-${donor.date}-${i}`} donor={donor} />
          ))}
        </ul>
        {!showAll && byDate.length > 10 && (
          <div className="text-center mt-4">
            <button
              onClick={() => setShowAll(true)}
              className="text-sm text-gray-600 dark:text-gray-400 underline hover:text-gray-900 dark:hover:text-white"
            >
              Show all {byDate.length} contributors
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default withIntl(DonorsList);
