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

function Homepage({ t, letters, stats }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handler = (event) => setIsDarkMode(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const fillColor = isDarkMode ? 'white' : 'black';
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
        <center>
          <div>
            <svg width="64" viewBox="0 0 781 913" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M379.867 0.699707C356.133 3.63304 344.133 10.8331 306.8 43.8997C300.133 49.8997 286.267 61.8997 275.867 70.6997C265.6 79.3664 248.667 93.8997 238.267 102.833L219.333 119.233H163.333H107.333V160.3V201.233L93.0667 212.7C85.0667 218.966 69.3333 231.1 58 239.633C46.6667 248.166 35.2 257.1 32.4 259.5C19.4667 271.233 8.4 289.5 3.06667 308.166L0 318.566V533.233C0 739.5 0.133333 748.166 2.53333 755.233C12.4 784.433 33.8667 805.233 62.6667 813.5C70.1333 815.633 86.6667 815.9 287.6 816.566L504.533 817.233L545.467 853.233C568 872.966 588.4 890.966 590.933 893.1C601.467 901.9 615.6 899.233 619.333 887.766C621.467 881.366 619.2 875.233 612.267 869.1C609.2 866.3 601.6 859.5 595.333 853.766C578.133 838.3 548.267 811.9 533.067 798.833C518.4 786.3 517.2 784.166 518.4 774.166C521.2 752.433 532.267 739.9 549.867 738.3C557.733 737.5 557.867 737.633 566.267 744.033C570.8 747.633 581.333 756.3 589.333 763.233C597.467 770.3 609.467 780.433 616 785.9C632 799.233 670.4 832.033 693.067 851.9C728.267 882.566 725.6 880.566 731.867 880.566C738.4 880.566 743.6 877.233 746.667 871.233C751.2 862.3 748.267 856.7 731.067 842.3C724.267 836.566 715.2 828.566 710.933 824.566L703.2 817.366L714.267 814.966C744.667 808.433 768.133 785.9 777.6 754.3C779.867 747.1 780 732.166 780.4 543.233C780.667 401.766 780.4 336.033 779.333 326.966C777.6 311.766 772.933 296.566 766.4 284.833C757.333 268.433 748.267 259.766 709.333 230.433L672.667 202.7V160.966V119.233H616.8H560.933L556.4 115.633C554 113.633 542.667 103.766 531.333 93.8997C512.8 77.6331 483.067 52.033 451.067 24.833C444.8 19.3663 437.6 13.633 435.2 12.033C428 7.23302 413.733 2.03303 405.2 1.23303C390.267 -0.233634 388 -0.36696 379.867 0.699707ZM412 38.5663C418.533 41.7663 428.667 49.633 445.467 64.2997C458.667 75.7663 478.667 92.9663 489.867 102.566L510.267 119.9L450 120.3C416.933 120.433 363.067 120.433 330.4 120.3L270.933 119.9L290.8 102.966C301.733 93.633 317.867 79.6331 326.667 71.8997C347.2 53.6331 362.8 40.9663 367.867 38.2997C381.6 31.0997 397.467 31.233 412 38.5663ZM608.933 152.566C623.467 152.566 623.467 152.566 638 152.566L637.667 187.1L637.333 221.633L637.733 293.633L638 365.633L629.067 372.833C624 376.966 613.733 384.833 606 390.3C598.267 395.9 582.667 407.766 571.333 416.566C551.733 431.766 467.467 495.5 466 496.166C465.6 496.433 461.067 492.566 455.867 487.5C444.533 476.833 434.933 470.833 422.133 466.433C388.267 454.7 350.933 462.7 325.6 487.233L315.067 497.5L306.267 490.166C301.333 486.166 286.8 474.966 274 465.366C250 447.5 163.867 382.166 149.067 370.566L140.667 364.166V259.233C140.667 201.5 141.067 153.9 141.6 153.5C142 152.966 239.467 152.566 358 152.566H573.6H591.267H608.933ZM107.333 292.566V339.233L97.7333 331.766C81.8667 319.5 65.7333 312.833 49.0667 311.633C43.2 311.1 39.3333 310.3 39.3333 309.366C39.3333 305.233 48.4 293.233 57.6 284.7C65.4667 277.5 104.933 246.566 107.067 246.033C107.2 245.9 107.333 266.833 107.333 292.566ZM699.867 266.033C713.467 276.433 726.8 287.5 729.333 290.7C734.533 297.1 740.667 307.1 740.667 309.366C740.667 310.3 736.667 311.233 730.933 311.766C711.333 313.5 695.733 320.166 680.133 333.5C676.533 336.7 673.067 339.233 672.4 339.233C671.867 339.233 671.333 318.166 671.333 292.433C671.333 252.566 671.6 245.766 673.2 246.3C674.267 246.7 686.267 255.633 699.867 266.033ZM54.4 346.7C66 349.633 69.7333 351.9 92 369.1C126.4 395.633 219.6 466.566 258.667 495.633C279.2 511.1 296.8 524.3 297.733 525.233C299.067 526.433 299.067 528.3 297.333 535.366C296.267 540.033 295.333 547.633 295.333 552.033C295.333 562.7 300.667 557.766 228 614.033C212.667 625.9 190.133 643.5 178 653.233C165.867 662.833 142.8 681.233 126.667 693.9C110.533 706.7 85.7333 726.433 71.4667 737.766C57.3333 749.233 44.8 759.1 43.8667 759.9C41.3333 761.633 40.2667 759.766 36.2667 748.566L33.3333 739.9L32.9333 542.166L32.5333 344.566H39.4667C43.2 344.566 49.8667 345.5 54.4 346.7ZM746.133 498.166C746.267 745.9 746.267 740.833 743.2 750.3C741.867 754.833 740.133 759.366 739.467 760.433C738.533 761.9 733.6 758.433 717.867 745.5C706.533 736.3 691.6 724.3 684.667 718.966C670.4 707.766 604.667 655.766 571.333 629.233C559.2 619.633 537.067 602.166 522 590.566C484.533 561.633 486 563.1 486 553.633C486 549.233 485.067 541.5 483.867 536.433C482.667 531.233 482 526.833 482.267 526.7C482.4 526.433 495.867 516.433 512 504.433C556.933 470.833 587.2 447.766 644.533 403.366C673.333 380.833 699.467 360.7 702.533 358.566C716.533 348.166 725.067 344.833 738.4 344.7L746 344.566L746.133 498.166ZM410.667 497.9C426.133 503.1 438.4 514.3 445.733 529.633C450 538.433 450.667 541.366 451.067 551.9C451.733 566.566 449.2 578.033 442.933 588.433C430.667 608.833 404.8 620.7 381.2 616.833C356.8 612.833 335.6 592.966 331.333 570.033C327.333 548.833 332.133 528.566 344.267 515.1C360.667 496.833 387.6 489.9 410.667 497.9ZM310.667 606.033C317.2 616.7 332.267 631.366 343.2 637.9C367.2 652.033 394.133 654.7 421.867 645.633C440.267 639.633 460.667 622.433 472.533 602.966L475.6 597.9L480.4 601.5C492.4 610.433 526.4 636.566 537.333 645.233C548.667 654.3 576.667 676.433 623.333 713.366C677.867 756.566 706.8 779.633 707.867 780.7C708.667 781.366 699.467 781.9 684.533 781.9L660 781.766L637.867 762.166C603.067 731.366 585.6 716.966 578.533 713.366C570.4 709.366 478.8 675.233 448.933 665.1C442.267 662.7 438.4 663.633 436.4 667.9C435.333 670.433 436.4 674.966 442.533 693.5C446.533 705.766 454.667 730.566 460.533 748.566L471.2 781.233L371.2 781.633C316.267 781.766 226.267 781.766 171.2 781.633L71.0667 781.233L92.8 763.9C232.4 653.366 302.133 598.966 305.467 597.9C305.6 597.9 307.867 601.5 310.667 606.033ZM503.333 715.633C507.333 717.1 510.8 718.566 511.067 718.7C511.333 718.833 508.8 722.433 505.6 726.833C502.4 731.1 498.133 737.1 496.133 740.166C494.267 743.366 492.267 745.9 492 745.9C491.2 745.9 489.733 742.3 485.2 729.9L482.133 721.233L487.067 716.166C490.133 712.966 492.667 711.5 494 712.033C495.067 712.433 499.333 714.033 503.333 715.633Z"
                fill={fillColor}
              />
              <path
                d="M229.533 244.9C220.467 248.9 217.267 258.233 221.933 267.967C226.067 276.767 217.4 276.367 383.667 276.367C546.067 276.367 540.6 276.633 545.533 269.567C546.867 267.7 547.667 263.7 547.667 259.567C547.667 252.1 544.2 246.9 537.667 244.367C535.4 243.567 479.933 243.033 383.933 243.033C261.133 243.167 232.867 243.433 229.533 244.9Z"
                fill={fillColor}
              />
              <path
                d="M228.867 307.833C220.067 311.433 217.134 322.1 222.334 330.767C227.667 339.433 219.134 339.033 383.534 339.033C516.734 339.033 533.534 338.767 538.2 336.9C544.867 334.233 547.667 330.1 547.667 322.767C547.667 314.767 543.8 308.9 537.4 307.167C533.934 306.233 483.934 305.7 383 305.833C254.467 305.833 233 306.1 228.867 307.833Z"
                fill={fillColor}
              />
              <path
                d="M231.667 369.3C223.4 371.967 219.667 377.167 219.667 386.233C219.667 392.233 224.867 398.5 231.4 400.367C234.6 401.167 287.8 401.7 385.4 401.7C546.6 401.7 540.6 401.967 545.4 394.633C548.2 390.233 548.334 381.567 545.534 376.233C541.4 367.967 548.734 368.367 384.067 368.5C301.4 368.5 232.734 368.9 231.667 369.3Z"
                fill={fillColor}
              />
              <path
                d="M648.467 854.233C644.067 858.367 643.667 859.3 643.667 866.5V874.367L661.134 891.3C670.734 900.633 680.6 909.167 683 910.233C696.067 916.5 709.934 907.167 707.934 893.567C707.4 890.367 703.8 886.367 690.467 874.767C658.334 846.633 657.134 845.967 648.467 854.233Z"
                fill={fillColor}
              />
            </svg>
          </div>
          <div className="text-base leading-6 mt-2">
            <Link href={`/create`}>{t('footer.create')}</Link>
            <br />
            {t('footer.andsignit')}
          </div>
        </center>
        <div className="flex content-center justify-center"></div>
      </div>
      <main className="container mx-auto px-6 py-12">
        {stats && (
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 text-center">
              <div>
                <h3 className="text-5xl font-bold">
                  <NumberFormat value={stats && stats.letters} displayType={'text'} thousandSeparator={true} />
                </h3>
                <p className="text-lg text-gray-500">{t('home.stats.openletters')}</p>
              </div>
              <div>
                <h3 className="text-5xl font-bold">
                  <NumberFormat value={stats && stats.signatures} displayType={'text'} thousandSeparator={true} />
                </h3>
                <p className="text-lg text-gray-500">{t('home.stats.signatures')}</p>
              </div>
            </div>
          </section>
        )}
        {letters && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-8">{t('home.featured')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {letters.featured && letters.featured.map((letter, i) => <Card key={`card-${i}`} letter={letter} />)}
            </div>
          </section>
        )}
        {letters && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-8">{t('home.latest')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {letters.latest && letters.latest.map((letter, i) => <Card key={`card-${i}`} letter={letter} />)}
            </div>
          </section>
        )}
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
