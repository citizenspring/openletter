import Link from 'next/link';
import styled from 'styled-components';
import { withIntl } from '../lib/i18n';

const Q = styled.div`
  font-size: 12pt;
  font-weight: bold;
  margin-top: 14px;
`;

const A = styled.div`
  font-size: 11pt;
  color: #555;
`;

export default withIntl(({ t }) => (
  <div>
    <h2 className="text-2xl font-bold mb-8">{t('faq')}</h2>
    <div className="space-y-8">
      <details>
        <summary className="cursor-pointer text-lg font-medium">{t('faq.q1')}</summary>
        <p className="pt-2">{t('faq.q1.response')}</p>
      </details>
      <details>
        <summary className="cursor-pointer text-lg font-medium">{t('faq.q2')}</summary>
        <p className="pt-2">{t('faq.q2.response')}</p>
      </details>
      <details>
        <summary className="cursor-pointer text-lg font-medium">{t('faq.q3')}</summary>
        <p className="pt-2">{t('faq.q3.response')}</p>
      </details>
      <details>
        <summary className="cursor-pointer text-lg font-medium">{t('faq.q4')}</summary>
        <p className="pt-2">{t('faq.q4.response')}</p>
      </details>
      <details>
        <summary className="cursor-pointer text-lg font-medium">{t('faq.q5')}</summary>
        <p className="pt-2">{t('faq.q5.response')}</p>
      </details>
      <details>
        <summary className="cursor-pointer text-lg font-medium">{t('faq.q6')}</summary>
        <p className="pt-2">
          <a href="https://opencollective.com/openletter/conversations">{t('faq.q6.response')}</a>
        </p>
      </details>
      <details>
        <summary className="cursor-pointer text-lg font-medium">{t('faq.q7')}</summary>
        <p className="pt-2" dangerouslySetInnerHTML={{ __html: t('faq.q7.response') }} />
      </details>
    </div>
  </div>
));
