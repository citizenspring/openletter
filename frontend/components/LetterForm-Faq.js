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
    <h2>{t('faq')}</h2>
    <Q>{t('create.faq.q1')}</Q>
    <A>{t('create.faq.q1.response')}</A>

    <Q>{t('create.faq.q2')}</Q>
    <A>{t('create.faq.q2.response')}</A>

    <Q>{t('create.faq.q3')}</Q>
    <A>{t('create.faq.q3.response')}</A>
  </div>
));
