import React from 'react';
import Link from 'next/link';
import fetch from 'node-fetch';
import Faq from '../components/Faq';
import Footer from '../components/Footer';
import { withIntl } from '../lib/i18n';
import Card from '../components/Card';
import NumberFormat from 'react-number-format';
import { useRouter } from 'next/router';
import Head from 'next/head';

function Homepage({ t, letters, stats }) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Open Letter</title>
        <meta name="description" content="Open Letter is a platform for writing and signing open letters." />
        <meta property="og:title" content="Open Letter" />
        <meta property="og:description" content="Open Letter is a platform for writing and signing open letters." />
        <meta property="og:image" content="/icon.png" />
        <link rel="shortcut icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </Head>
      <div className="flex items-center justify-center py-4">
        <Footer />
        <div className="flex content-center justify-center"></div>
      </div>
      <main className="container mx-auto px-6 py-12">
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 text-center">
            <div>
              <h3 className="text-5xl font-bold">
                <NumberFormat value={stats.letters} displayType={'text'} thousandSeparator={true} />
              </h3>
              <p className="text-lg text-gray-500">{t('home.stats.openletters')}</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold">
                <NumberFormat value={stats.signatures} displayType={'text'} thousandSeparator={true} />
              </h3>
              <p className="text-lg text-gray-500">{t('home.stats.signatures')}</p>
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
          </ol>
          <h2 className="text-2xl font-bold mt-8 mb-4">{t('home.values.title')}</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>{t('home.values.1')}</li>
            <li>{t('home.values.2')}</li>
            <li>{t('home.values.3')}</li>
            <li>{t('home.values.4')}</li>{' '}
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
