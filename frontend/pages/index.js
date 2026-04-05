import React from 'react';
import Link from 'next/link';
import fetch from 'node-fetch';
import Faq from '../components/Faq';
import Footer from '../components/Footer';
import { withIntl } from '../lib/i18n';
import Card from '../components/Card';
import NumberFormat from 'react-number-format';
import Head from 'next/head';
import { useState, useEffect } from 'react';

function Homepage({ t, letters, stats, error }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handler = (event) => setIsDarkMode(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const fillColor = isDarkMode ? 'white' : 'black';

  if (error) {
    return (
      <>
        <Head>
          <title>Open Letter</title>
          <link rel="shortcut icon" href="/icon.png" />
        </Head>
        <div className="max-w-2xl mx-auto p-6 text-center mt-12">
          <h2 className="text-lg font-semibold">Service temporarily unavailable</h2>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Open Letter — Create and sign open letters together</title>
        <meta name="description" content="Create open letters and sign them together. Public or invitation-only. No cookies, no trackers. A civic tool for collective action." />
        <meta property="og:title" content="Open Letter" />
        <meta property="og:description" content="Create open letters and sign them together. Public or invitation-only." />
        <meta property="og:image" content="/icon.png" />
        <link rel="shortcut icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </Head>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-12 pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <svg width="56" viewBox="0 0 781 913" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M379.867 0.699707C356.133 3.63304 344.133 10.8331 306.8 43.8997C300.133 49.8997 286.267 61.8997 275.867 70.6997C265.6 79.3664 248.667 93.8997 238.267 102.833L219.333 119.233H163.333H107.333V160.3V201.233L93.0667 212.7C85.0667 218.966 69.3333 231.1 58 239.633C46.6667 248.166 35.2 257.1 32.4 259.5C19.4667 271.233 8.4 289.5 3.06667 308.166L0 318.566V533.233C0 739.5 0.133333 748.166 2.53333 755.233C12.4 784.433 33.8667 805.233 62.6667 813.5C70.1333 815.633 86.6667 815.9 287.6 816.566L504.533 817.233L545.467 853.233C568 872.966 588.4 890.966 590.933 893.1C601.467 901.9 615.6 899.233 619.333 887.766C621.467 881.366 619.2 875.233 612.267 869.1C609.2 866.3 601.6 859.5 595.333 853.766C578.133 838.3 548.267 811.9 533.067 798.833C518.4 786.3 517.2 784.166 518.4 774.166C521.2 752.433 532.267 739.9 549.867 738.3C557.733 737.5 557.867 737.633 566.267 744.033C570.8 747.633 581.333 756.3 589.333 763.233C597.467 770.3 609.467 780.433 616 785.9C632 799.233 670.4 832.033 693.067 851.9C728.267 882.566 725.6 880.566 731.867 880.566C738.4 880.566 743.6 877.233 746.667 871.233C751.2 862.3 748.267 856.7 731.067 842.3C724.267 836.566 715.2 828.566 710.933 824.566L703.2 817.366L714.267 814.966C744.667 808.433 768.133 785.9 777.6 754.3C779.867 747.1 780 732.166 780.4 543.233C780.667 401.766 780.4 336.033 779.333 326.966C777.6 311.766 772.933 296.566 766.4 284.833C757.333 268.433 748.267 259.766 709.333 230.433L672.667 202.7V160.966V119.233H616.8H560.933L556.4 115.633C554 113.633 542.667 103.766 531.333 93.8997C512.8 77.6331 483.067 52.033 451.067 24.833C444.8 19.3663 437.6 13.633 435.2 12.033C428 7.23302 413.733 2.03303 405.2 1.23303C390.267 -0.233634 388 -0.36696 379.867 0.699707ZM412 38.5663C418.533 41.7663 428.667 49.633 445.467 64.2997C458.667 75.7663 478.667 92.9663 489.867 102.566L510.267 119.9L450 120.3C416.933 120.433 363.067 120.433 330.4 120.3L270.933 119.9L290.8 102.966C301.733 93.633 317.867 79.6331 326.667 71.8997C347.2 53.6331 362.8 40.9663 367.867 38.2997C381.6 31.0997 397.467 31.233 412 38.5663Z" fill={fillColor} />
              <path d="M229.533 244.9C220.467 248.9 217.267 258.233 221.933 267.967C226.067 276.767 217.4 276.367 383.667 276.367C546.067 276.367 540.6 276.633 545.533 269.567C546.867 267.7 547.667 263.7 547.667 259.567C547.667 252.1 544.2 246.9 537.667 244.367C535.4 243.567 479.933 243.033 383.933 243.033C261.133 243.167 232.867 243.433 229.533 244.9Z" fill={fillColor} />
              <path d="M228.867 307.833C220.067 311.433 217.134 322.1 222.334 330.767C227.667 339.433 219.134 339.033 383.534 339.033C516.734 339.033 533.534 338.767 538.2 336.9C544.867 334.233 547.667 330.1 547.667 322.767C547.667 314.767 543.8 308.9 537.4 307.167C533.934 306.233 483.934 305.7 383 305.833C254.467 305.833 233 306.1 228.867 307.833Z" fill={fillColor} />
              <path d="M231.667 369.3C223.4 371.967 219.667 377.167 219.667 386.233C219.667 392.233 224.867 398.5 231.4 400.367C234.6 401.167 287.8 401.7 385.4 401.7C546.6 401.7 540.6 401.967 545.4 394.633C548.2 390.233 548.334 381.567 545.534 376.233C541.4 367.967 548.734 368.367 384.067 368.5C301.4 368.5 232.734 368.9 231.667 369.3Z" fill={fillColor} />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            {t('home.hero.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            {t('home.hero.subtitle')}
          </p>

          {/* Stats */}
          {stats && (
            <div className="flex justify-center gap-12 mb-10">
              <div>
                <div className="text-3xl font-bold">
                  <NumberFormat value={stats.letters} displayType={'text'} thousandSeparator={true} />
                </div>
                <div className="text-sm text-gray-500">{t('home.stats.openletters')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  <NumberFormat value={stats.signatures} displayType={'text'} thousandSeparator={true} />
                </div>
                <div className="text-sm text-gray-500">{t('home.stats.signatures')}</div>
              </div>
            </div>
          )}

          {/* Dual CTA */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
            <Link href="/create">
              <a className="flex-1 py-3 px-6 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black font-medium text-center hover:opacity-90 transition-opacity">
                📢 {t('home.cta.public')}
              </a>
            </Link>
            <Link href="/create">
              <a className="flex-1 py-3 px-6 rounded-lg border-2 border-gray-900 dark:border-white font-medium text-center hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                🔒 {t('home.cta.invite')}
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Why invitation-only — new feature highlight */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-full mb-4">NEW</span>
            <h2 className="text-3xl font-bold mb-3">{t('home.invite.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              {t('home.invite.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="text-2xl mb-3">🤖</div>
              <h3 className="font-semibold mb-1">{t('home.invite.bot.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.invite.bot.desc')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="text-2xl mb-3">🕸️</div>
              <h3 className="font-semibold mb-1">{t('home.invite.trust.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.invite.trust.desc')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="text-2xl mb-3">🏋️</div>
              <h3 className="font-semibold mb-1">{t('home.invite.weight.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.invite.weight.desc')}</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing">
              <a className="text-sm font-medium underline">{t('home.invite.learn_more')}</a>
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Featured letters */}
        {letters && letters.featured && letters.featured.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">{t('home.featured')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {letters.featured.map((letter, i) => <Card key={`featured-${i}`} letter={letter} />)}
            </div>
          </section>
        )}

        {/* Latest letters */}
        {letters && letters.latest && letters.latest.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">{t('home.latest')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {letters.latest.map((letter, i) => <Card key={`latest-${i}`} letter={letter} />)}
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">{t('home.howitworks')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="text-3xl font-bold text-gray-200 dark:text-gray-700">1</div>
              <div>
                <h3 className="font-semibold">{t('home.step1.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.step1.desc')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl font-bold text-gray-200 dark:text-gray-700">2</div>
              <div>
                <h3 className="font-semibold">{t('home.step2.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.step2.desc')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl font-bold text-gray-200 dark:text-gray-700">3</div>
              <div>
                <h3 className="font-semibold">{t('home.step3.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.step3.desc')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl font-bold text-gray-200 dark:text-gray-700">4</div>
              <div>
                <h3 className="font-semibold">{t('home.step4.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.step4.desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">{t('home.values.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span>🔅</span><span className="text-sm">{t('home.values.1')}</span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span>📧</span><span className="text-sm">{t('home.values.2')}</span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span>🍪</span><span className="text-sm">{t('home.values.3')}</span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span>🌍</span><span className="text-sm">{t('home.values.4')}</span>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <Faq />
        </section>
      </main>
      <Footer />
    </>
  );
}

async function fetchFromAPI(path, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await fetch(`${process.env.API_URL}${path}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return await result.json();
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      return { error: 'Request to the API server timed out. Please try again later.' };
    }
    return { error: 'Unable to fetch from the API server. Please try again later.' };
  }
}

export async function getStaticProps({ locale }) {
  const homepageData = await fetchFromAPI(`/homepage?locale=${locale}`);
  const props = { ...homepageData };
  return { props, revalidate: 180 };
}

export default withIntl(Homepage);
