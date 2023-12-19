import React from 'react';
import Link from 'next/link';
import fetch from 'node-fetch';
import Faq from '../components/Faq';
import Footer from '../components/Footer';
import styled from 'styled-components';
import { Flex, Box } from 'reflexbox/styled-components';
import { withIntl } from '../lib/i18n';
import Card from '../components/Card';
import NumberFormat from 'react-number-format';
import { useRouter } from 'next/router';

// const Page = styled.div`
//   max-width: 960px;
//   padding: 16px;
//   margin: 0 auto;
// `;

const Button = ({ children }) => (
  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 underline-offset-4 hover:underline h-10 px-4 py-2 dark:text-white">
    {children}
  </button>
);

function Homepage({ t, letters, stats }) {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-center py-4">
        <Footer />
        <div className="flex content-center justify-center">
          {/* <Button variant="link">
              <Link href="/create">Create an Open Letter</Link>
            </Button>
            <Button className="ml-4" variant="outline">
              Switch to Dark Mode
            </Button> */}
        </div>
      </div>
      <main className="container mx-auto px-6 py-12">
        <section>
          <h2 className="text-2xl font-bold mb-8">{t('home.stats')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 text-center">
            <div>
              <h3 className="text-5xl font-bold">
                <NumberFormat value={stats.letters} displayType={'text'} thousandSeparator={true} />
              </h3>
              <p className="text-lg text-gray-500">open letters</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold">
                <NumberFormat value={stats.signatures} displayType={'text'} thousandSeparator={true} />
              </h3>
              <p className="text-lg text-gray-500">signatures</p>
            </div>
          </div>
        </section>
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-8">{t('home.featured')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {letters.featured && letters.featured.map((letter, i) => <Card key={`card-${i}`} letter={letter} />)}
          </div>
        </section>
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-8">{t('home.latest')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {letters.latest && letters.latest.map((letter, i) => <Card key={`card-${i}`} letter={letter} />)}
          </div>
        </section>
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-8">{t('home.howitworks')}</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <Link href="/create">
                <a>{t('home.howitworks.1')}</a>
              </Link>
            </li>
            <li>{t('home.howitworks.2')}</li>
            <li>{t('home.howitworks.3')}</li>
            <li>{t('home.howitworks.4')}</li>
          </ol>
          <h2 className="text-2xl font-bold mt-8 mb-4">{t('home.privacy')}</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>{t('home.privacy.1')}</li>
            <li>{t('home.privacy.2')}</li>
            <li>{t('home.privacy.3')}</li>{' '}
          </ul>
          <h2 className="text-2xl font-bold mt-8 mb-4">{t('home.demo')}</h2>
          <img src="/images/openletter-demo.gif" style={{ width: '100%', maxWidth: '600px' }} />
        </section>
        <section className="mt-16">
          <Faq />
        </section>
      </main>
      <Footer />
    </>
  );
}

async function fetchFromAPI(path) {
  let result, response;
  // console.log('>>> fetchFromAPI', process.env.API_URL, path);
  try {
    result = await fetch(`${process.env.API_URL}${path}`);
  } catch (e) {
    console.error('Unable to fetch', e);
  }
  try {
    response = await result.json();
  } catch (e) {
    console.error('Unable to parse JSON returned by the API', e);
    return null;
  }
  return response;
}

export async function getStaticProps({ locale }) {
  const homepageData = await fetchFromAPI(`/homepage?locale=${locale}`);
  const props = { ...homepageData };
  return { props, revalidate: 180 };
}

export default withIntl(Homepage);
