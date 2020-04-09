import React from 'react'
import Link from 'next/link'
import fetch from 'node-fetch'
import Faq from '../components/Faq'
import Footer from '../components/Footer'
import styled from 'styled-components';

const Page = styled.div`
  max-width: 960px;
  margin: 0 auto;
`;

function Index({ letters }) {
  return (
    <Page>
      <Footer />
      <h2>How it works</h2>
      <ol>
        <li><a href="/create">Create a letter</a></li>
        <li>Sign it</li>
        <li>Share the URL</li>
        <li>Other people can sign it</li>
      </ol>
      <h2>Demo</h2>
      <img src="/images/openletter-demo.gif" style={{width: '100%', maxWidth: '600px'}}/>
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