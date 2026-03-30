import React from 'react';
import Head from 'next/head';
import Footer from '../components/Footer';
import OpenCollectiveData from '../components/OpenCollectiveData';
import { withIntl } from '../lib/i18n';

function DonatePage({ t }) {
  return (
    <div>
      <Head>
        <title>Donate - OpenLetter.Earth</title>
        <link rel="shortcut icon" href="/icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </Head>
      <div className="max-w-2xl mx-auto w-full pt-8">
        <div className="px-4">
          <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-800 rounded-xl p-6 my-8 shadow-md">
            <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent dark:text-white">
              {t('notification.signed.donate.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('notification.signed.donate.description')}
            </p>
            <a
              className="inline-block w-full text-center transition-all duration-200 text-white text-lg font-medium bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:text-white"
              href="https://donate.stripe.com/28EcN52CwaOIb2X8e5eUU0k"
            >
              {t('notification.signed.donate.button')}
            </a>
          </div>
          <OpenCollectiveData collectiveSlug="openletter" />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default withIntl(DonatePage);
