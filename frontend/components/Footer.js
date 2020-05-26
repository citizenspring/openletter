import Link from 'next/link';
import styled from 'styled-components';
import { withIntl } from '../lib/i18n';

const FooterText = styled.div`
  font-size: 11pt;
`;

export default withIntl(({ t }) => (
  <div>
    <center>
      <div>
        <img src="/images/openletter-logo.png" width="64" />
      </div>
      <FooterText>
        <Link href={`/create`}>
          <a>{t('footer.create')}</a>
        </Link>
        <br />
        {t('footer.andsignit')}
      </FooterText>
    </center>
  </div>
));
