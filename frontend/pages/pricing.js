import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Footer from '../components/Footer';
import { withIntl } from '../lib/i18n';

function PricingPage({ t }) {
  return (
    <div>
      <Head>
        <title>Pricing - OpenLetter.Earth</title>
        <link rel="shortcut icon" href="/icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </Head>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('pricing.title')}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Public */}
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-8">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">📢</div>
              <h2 className="text-2xl font-bold">{t('pricing.public.title')}</h2>
              <div className="mt-2">
                <span className="text-4xl font-bold">{t('pricing.public.price')}</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('pricing.public.feature1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('pricing.public.feature2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('pricing.public.feature3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('pricing.public.feature4')}</span>
              </li>
            </ul>
            <Link href="/create">
              <a className="block w-full text-center py-3 px-6 rounded-lg border-2 border-gray-900 dark:border-white font-medium hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                {t('pricing.public.cta')}
              </a>
            </Link>
          </div>

          {/* Invitation-only */}
          <div className="border-2 border-gray-900 dark:border-white rounded-xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold px-3 py-1 rounded-full">
              {t('pricing.invite.badge')}
            </div>
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">🔒</div>
              <h2 className="text-2xl font-bold">{t('pricing.invite.title')}</h2>
              <div className="mt-2">
                <span className="text-4xl font-bold">€10</span>
                <span className="text-gray-500 ml-1">{t('pricing.invite.per_letter')}</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('pricing.invite.feature1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('pricing.invite.feature2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('pricing.invite.feature3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('pricing.invite.feature4')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('pricing.invite.feature5')}</span>
              </li>
            </ul>
            <Link href="/create">
              <a className="block w-full text-center py-3 px-6 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black font-medium hover:opacity-90 transition-opacity">
                {t('pricing.invite.cta')}
              </a>
            </Link>
          </div>
        </div>

        {/* Why invitation-only */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('pricing.why.title')}</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="text-2xl">🤖</div>
              <div>
                <h3 className="font-semibold">{t('pricing.why.bots.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('pricing.why.bots.desc')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">✅</div>
              <div>
                <h3 className="font-semibold">{t('pricing.why.genuine.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('pricing.why.genuine.desc')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">🏋️</div>
              <div>
                <h3 className="font-semibold">{t('pricing.why.weight.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('pricing.why.weight.desc')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">🕸️</div>
              <div>
                <h3 className="font-semibold">{t('pricing.why.trust.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('pricing.why.trust.desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default withIntl(PricingPage);
