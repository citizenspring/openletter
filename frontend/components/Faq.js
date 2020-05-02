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

export default withIntl(({t}) => (
  <div>
    <h2>{t('faq')}</h2>
    <Q>{t('faq.q1')}</Q>
    <A>{t('faq.q1.response')}</A>

    <Q>{t('faq.q2')}</Q>
    <A>{t('faq.q2.response')}</A>

    <Q>{t('faq.q3')}</Q>
    <A>{t('faq.q3.response')}</A>

    <Q>{t('faq.q4')}</Q>
    <A>{t('faq.q4.response')}</A>

    <Q>{t('faq.q5')}</Q>
    <A>{t('faq.q5.response')}</A>

    <Q>{t('faq.q6')}</Q>
    <A><a href="https://opencollective.com/openletter/conversations">{t('faq.q6.response')}</a></A>

    <Q>{t('faq.q7')}</Q>
    <A>{t('faq.q7.response')}. <a href="https://opencollective.com/openletter">{t('makedonation')}</a></A>

  </div>
));