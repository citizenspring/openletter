import React from 'react';
import Link from 'next/link';
import fetch from 'node-fetch';
import Faq from '../components/Faq';
import Footer from '../components/Footer';
import styled from 'styled-components';
import { Flex, Box } from 'reflexbox/styled-components';
import { withIntl } from '../lib/i18n';

const Page = styled.div`
  max-width: 960px;
  padding: 16px;
  margin: 0 auto;
`;

export class Index extends React.Component {
  render() {
    const { t, locale, featuredLetters } = this.props;
    return (
      <Page>
        <Footer />
        <Box width={1}>
          <h2>{t('home.featured')}</h2>
          <ul>
            {featuredLetters.map((letter) => (
              <li>
                <Link href={`/${letter.slug}`}>
                  <a>{letter.title}</a>
                </Link>
              </li>
            ))}
          </ul>
        </Box>

        <Flex flexWrap="wrap">
          <Box width={[1, 1 / 2, 1 / 2]}>
            <h2>{t('home.howitworks')}</h2>
            <ol>
              <li>
                <Link href="/create">
                  <a>{t('home.howitworks.1')}</a>
                </Link>
              </li>
              <li>{t('home.howitworks.2')}</li>
              <li>{t('home.howitworks.3')}</li>
              <li>{t('home.howitworks.4')}</li>
            </ol>
          </Box>
          <Box width={[1, 1 / 2, 1 / 2]}>
            <h2>{t('home.privacy')}</h2>
            <ul>
              <li>{t('home.privacy.1')}</li>
              <li>{t('home.privacy.2')}</li>
              <li>{t('home.privacy.3')}</li>
            </ul>
          </Box>
        </Flex>
        <h2>{t('home.demo')}</h2>
        <img src="/images/openletter-demo.gif" style={{ width: '100%', maxWidth: '600px' }} />
        <Faq />
      </Page>
    );
  }
}

export async function getServerSideProps({ params, req, res }) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.setHeader('Vary', 'Accept-Language');

  const props = { headers: req.headers };
  const apiCall = `${process.env.API_URL}/letters/featured`;
  const result = await fetch(apiCall, { headers: { 'accept-language': req.headers['accept-language'] } });

  try {
    const response = await result.json();
    if (response.error) {
      props.error = response.error;
    } else {
      props.featuredLetters = response;
    }
    return { props };
  } catch (e) {
    console.error('Unable to parse JSON returned by the API', e);
  }
}

export default withIntl(Index);
