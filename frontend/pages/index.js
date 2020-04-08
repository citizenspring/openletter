import React from 'react'
import Link from 'next/link'
import fetch from 'node-fetch'
import Faq from '../components/Faq'
import Footer from '../components/Footer'

function Index({ letters }) {
  return (
    <div>
      <Footer />
      <Faq />
    </div>
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