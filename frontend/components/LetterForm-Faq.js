import { withIntl } from '../lib/i18n';

const Q = ({ children }) => <summary className='text-lg text-gray-800 cursor-pointer font-medium mt-4'>{children}</summary>;
const A = ({ children }) => <p className='pt-1 text-base text-gray-500 dark:text-gray-400'>{children}</p>;

export default withIntl(({ t }) => (
  <div>
    <h2>{t('faq')}</h2>
    <details>
      <Q>{t('create.faq.q1')}</Q>
      <A>{t('create.faq.q1.response')}</A>
    </details>

    <details>
      <Q>{t('create.faq.q2')}</Q>
      <A>{t('create.faq.q2.response')}</A>
    </details>

    <details>
      <Q>{t('create.faq.q3')}</Q>
      <A>{t('create.faq.q3.response')}</A>
    </details>
  </div>
));
