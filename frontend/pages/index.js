import React from 'react'
import Link from 'next/link'
import fetch from 'node-fetch'
import Faq from '../components/Faq'
import Footer from '../components/Footer'
import styled from 'styled-components';
import { Flex, Box } from 'reflexbox/styled-components'

const Page = styled.div`
  max-width: 960px;
  padding: 16px;
  margin: 0 auto;
`;

function Index({ letters }) {
  return (
    <Page>
      <Footer />
      <Flex flexWrap="wrap">
        <Box width={[1, 1/2, 1/2]}>
          <h2>How it works</h2>
          <ol>
            <li><Link href="/create"><a>Create a letter</a></Link></li>
            <li>Sign it</li>
            <li>Share the URL</li>
            <li>Other people can sign it</li>
          </ol>
        </Box>
        <Box width={[1, 1/2, 1/2]}>
          <h2>Privacy minded</h2>
          <ul>
            <li>Sign with your name or anonymously</li>
            <li>We don't record any email address in our database</li>
            <li>No cookies, no tracking of any kind</li>
          </ul>
        </Box>

      </Flex>
      <h2>Demo</h2>
      <img src="/images/openletter-demo.gif" style={{ width: '100%', maxWidth: '600px' }} />
      <Faq />
    </Page>
  )
}

export async function getServerSideProps() {
  const apiCall = `${process.env.API_URL}/letters`;
  const res = await fetch(apiCall);
  try {
    const letters = await res.json();
    return {
      props: {
        letters: letters,
      },
    }
  } catch (e) {
    console.error("Unable to parse JSON returned by the API", e);
  }
}

export default Index