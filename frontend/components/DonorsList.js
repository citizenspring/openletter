import React, { useState } from 'react';
import useSWR from 'swr';
import { withIntl } from '../lib/i18n';

const fetcher = (url) => fetch(url).then((res) => res.json());

function relativeDate(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

function DonorItem({ donor, rank, showDate }) {
  return (
    <li className="flex items-center justify-between py-2 px-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-2">
        {rank && <span className="text-gray-400 text-sm w-6 text-right">{rank}.</span>}
        <span className="font-medium">{donor.name}</span>
      </div>
      <div className="flex items-center gap-3">
        {donor.amount && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {donor.amount.toFixed(0)}€
          </span>
        )}
        {showDate && donor.date && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {relativeDate(donor.date)}
          </span>
        )}
      </div>
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
    const latest20 = [...allDonors]
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 20);
    return (
      <div className="text-center my-4">
        <h2 className="text-xl mt-4 text-center">Thank you to all our contributors 🙏</h2>
        <ul className="p-2 flex overflow-hidden flex-wrap justify-center list-none">
          {latest20.map((donor, i) => (
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

  const expenses = data.expenses || [];

  // Full mode: top 10 by amount, then all by date DESC
  const top10 = [...allDonors]
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 10);

  const byDate = [...allDonors]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const visibleDonors = showAll ? byDate : byDate.slice(0, 10);

  return (
    <div className="my-8">
      {/* Latest expenses */}
      {expenses.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4 text-center">Latest expenses</h2>
          <ul className="list-none p-0">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="flex items-center justify-between py-2 px-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <span>{expense.description}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {expense.amount.toFixed(0)}€
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {relativeDate(expense.date)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

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
            <DonorItem key={`all-${donor.name}-${donor.date}-${i}`} donor={donor} showDate />
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
