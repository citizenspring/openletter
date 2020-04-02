import React from 'react'
import Link from 'next/link'
import fetch from 'node-fetch'

function Index({ letters }) {
  return (
    <div>
      <p>OpenLetter currently holds {letters.length} open letters</p>
      {letters.map(letter => (
        <li>
          <Link href={letter.slug}>
            <a>{letter.title}</a>
          </Link>
        </li>
      ))}
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