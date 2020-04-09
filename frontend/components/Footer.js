import Link from 'next/link';
import styled from 'styled-components';

const FooterText = styled.div`
  font-size: 11pt;
`;

export default () => (
  <div>
    <center>
      <div>
        <img src="/images/openletter-logo.png" width="64" />
      </div>
      <FooterText>
        <Link href={`/create`}><a>Create an open letter</a></Link><br />and co-sign it
      </FooterText>
    </center>
  </div>
);