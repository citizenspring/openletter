import React from 'react';
import Head from 'next/head';
import Footer from '../components/Footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TOS_DOCUMENT_ID = '1aXaMYJD1YR-wyVF37wCQVX2_HfSnG6D0vvxxeJ6khB8';

export async function getStaticProps() {
  let content = '';
  try {
    const res = await fetch(
      `https://docs.google.com/document/d/${TOS_DOCUMENT_ID}/export?format=markdown`
    );
    if (res.ok) {
      content = await res.text();
    }
  } catch (e) {
    console.error('Failed to fetch TOS from Google Docs', e);
  }

  return {
    props: { content },
    revalidate: 86400, // re-fetch once a day
  };
}

export default function TermsOfService({ content }) {
  return (
    <div>
      <Head>
        <title>Terms of Service - OpenLetter.Earth</title>
        <link rel="shortcut icon" href="/icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </Head>
      <div className="max-w-3xl mx-auto p-6">
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown plugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
      <Footer />
    </div>
  );
}
