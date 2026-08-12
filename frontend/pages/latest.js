import React from 'react';
import Link from 'next/link';
import { fetchJson } from '../lib/api';
import Footer from '../components/Footer';
import NumberFormat from 'react-number-format';
import moment from 'moment';
const Badge = ({ children }) => (
  <span className="ml-2 inline-flex flex-nowrap items-center rounded-full border px-2.5 py-0.5 w-fit text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gray-900 text-white hover:bg-primary/80 mr-1">
    {children}
  </span>
);
function Index({ letters, error }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl my-4">Latest open letters</h1>
      {error && (
        <p className="my-4 text-gray-600 dark:text-gray-400">
          The list of letters could not be loaded right now. Please try again in a moment.
        </p>
      )}
      {!error && letters.length === 0 && <p className="my-4 text-gray-600 dark:text-gray-400">No open letters yet.</p>}
      <ul>
        {letters.map((letter) => (
          <li className="my-2">
            <div className="text-sm text-gray-500">{moment(letter.created_at).format('D MMMM YYYY')}</div>
            <Link href={letter.slug}>
              <a>{letter.title}</a>
            </Link>
            <Badge>
              <NumberFormat value={letter.total_signatures} displayType={'text'} thousandSeparator={true} />
              &nbsp;signatures
            </Badge>
          </li>
        ))}
      </ul>
      <Footer />
    </div>
  );
}

export async function getServerSideProps() {
  const apiCall = `${process.env.API_URL}/letters?limit=100&minSignatures=2`;
  const { data: letters, error } = await fetchJson(apiCall);

  return {
    props: {
      // The API can answer 200 with something that is not a list; never hand
      // the component anything it cannot map over.
      letters: Array.isArray(letters) ? letters : [],
      error: error || null,
    },
  };
}

export default Index;
