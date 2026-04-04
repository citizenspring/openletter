import useSWR from 'swr';
import { withIntl } from '../lib/i18n';

const fetcher = (url) => fetch(url).then((res) => res.json());

function DonorsList({ t }) {
  const { data, error } = useSWR('/data/donors.json', fetcher);

  if (error) return null;
  if (!data) return <div className="text-center">Loading...</div>;

  const donors = data.donors || [];
  if (donors.length === 0) return null;

  return (
    <div className="text-center my-4">
      <h2 className="text-xl mt-4 ml-4 text-center">Thank you to all our contributors 🙏</h2>
      <ul className="p-2 flex overflow-hidden flex-wrap justify-center list-none">
        {donors
          .filter((d) => d.name !== 'Guest')
          .map((donor, i) => {
            const link =
              donor.source === 'opencollective' && donor.ocSlug
                ? `https://opencollective.com/${donor.ocSlug}`
                : null;

            return (
              <li key={`${donor.name}-${donor.source}-${i}`} className="mx-2">
                {link ? (
                  <a href={link} title={donor.name} className="display-inline-block">
                    {donor.name}
                  </a>
                ) : (
                  <span title={donor.name}>{donor.name}</span>
                )}
              </li>
            );
          })}
      </ul>
      {data.stats && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {data.stats.total} contributors
        </p>
      )}
    </div>
  );
}

export default withIntl(DonorsList);
