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

export class Index extends React.Component {
  render() {
    const { t, locale, featuredLetters, latestLetters, stats } = this.props;

    return (
      <>
        <header className="flex items-center justify-between px-6 py-4">
          <Link href="#">
            <h1 className="text-3xl font-bold">openletter.earth</h1>
          </Link>
          <div className="flex items-center">
            <Button variant="link">
              <Link href="/create">Create an Open Letter</Link>
            </Button>
            {/* <Button className="ml-4" variant="outline">
              Switch to Dark Mode
            </Button> */}
          </div>
        </header>
        <main className="container mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-8">{t('home.featured')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredLetters.map((letter, i) => (
              <Card key={`card-${i}`} letter={letter} />
            ))}
          </div>
          {/* <section className="mt-20">
            <h2 className="text-2xl font-bold mb-8">Our Impact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 text-center">
              <div>
                <h3 className="text-5xl font-bold">
                  <NumberFormat value={stats.totalLetters} displayType={'text'} thousandSeparator={true} />
                </h3>
                <p className="text-lg text-gray-500">open letters</p>
              </div>
              <div>
                <h3 className="text-5xl font-bold">
                  <NumberFormat value={stats.totalSignatures} displayType={'text'} thousandSeparator={true} />
                </h3>
                <p className="text-lg text-gray-500">signatures</p>
              </div>
            </div>
          </section> */}
          <section className="mt-20">
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
          <section className="mt-20">
            <Faq />
          </section>
        </main>
        <Footer />
      </>
    );

    // return (
    //   <Page>
    //     <Footer />
    //     <Box width={1}>
    //       <h2></h2>
    //       <ul>
    //         {featuredLetters.map((letter) => (
    //           <li>
    //             <Link href={`/${letter.slug}`}>
    //               <a>{letter.title}</a>
    //             </Link>
    //           </li>
    //         ))}
    //       </ul>
    //     </Box>

    //     <Box width={1}>
    //       <h2>{t('home.latest')}</h2>
    //       <ul>

    //       </ul>
    //     </Box>
    //     <Faq />
    //   </Page>
    // );
  }
}

async function fetchFromAPI(path) {
  let result, response;
  try {
    result = await fetch(`${process.env.API_URL}${path}`);
  } catch (e) {
    console.error('Unable to fetch', e);
  }
  try {
    response = await result.json();
  } catch (e) {
    console.error('Unable to parse JSON returned by the API', e);
  }
  return response;
}

export async function getServerSideProps({ params, req, res }) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.setHeader('Vary', 'Accept-Language');

  const props = { headers: req.headers };
  props.latestLetters = await fetchFromAPI('/letters/');
  props.featuredLetters = await fetchFromAPI('/letters/featured');
  // props.stats = await fetchFromAPI('/stats');

  console.log('>>> props', props);

  return { props };
}

export default withIntl(Index);
