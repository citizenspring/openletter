import { withIntl } from '../lib/i18n';

const Q = ({ children }) => (
  <summary className="text-lg text-gray-800 dark:text-gray-300 cursor-pointer font-medium mt-4">{children}</summary>
);
const A = (props) => (
  <p className="pt-1 text-base text-gray-500 dark:text-gray-400" {...props}>
    {props.children}
  </p>
);

export default withIntl(({ t }) => (
  <div>
    <h2 className="text-2xl font-bold mb-8">{t('faq')}</h2>
    <div className="space-y-8">
      <details>
        <Q>{t('faq.q1')}</Q>
        <A>{t('faq.q1.response')}</A>
      </details>
      <details>
        <Q>{t('faq.q2')}</Q>
        <A>{t('faq.q2.response')}</A>
      </details>
      <details>
        <Q>{t('faq.q3')}</Q>
        <A>{t('faq.q3.response')}</A>
      </details>
      <details>
        <Q>{t('faq.q4')}</Q>
        <A>{t('faq.q4.response')}</A>
      </details>
      <details>
        <Q>{t('faq.q5')}</Q>
        <A>{t('faq.q5.response')}</A>
      </details>
      <details>
        <Q>{t('faq.q6')}</Q>
        <A>
          <a href="https://opencollective.com/openletter/conversations">{t('faq.q6.response')}</a>
        </A>
      </details>
      <details>
        <Q>{t('faq.q7')}</Q>
        <A dangerouslySetInnerHTML={{ __html: t('faq.q7.response') }} />
      </details>
    </div>
  </div>
));
