import React from 'react';
import Link from 'next/link';
import fetch from 'node-fetch';
import Footer from '../components/Footer';
import NumberFormat from 'react-number-format';
import moment from 'moment';
const Badge = ({ children }) => (
  <span className="ml-2 inline-flex flex-nowrap items-center rounded-full border px-2.5 py-0.5 w-fit text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gray-900 text-white hover:bg-primary/80 mr-1">
    {children}
  </span>
);
function Index({ letters }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl my-4">Latest open letters</h1>
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
  const res = await fetch(apiCall);
  try {
    const letters = await res.json();
    return {
      props: {
        letters: letters,
      },
    };
  } catch (e) {
    console.error('Unable to parse JSON returned by the API', e);
  }
}

export default Index;
