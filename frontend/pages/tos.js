import React from 'react';
import Head from 'next/head';
import Footer from '../components/Footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';

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
    revalidate: 86400,
  };
}

const Container = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px 24px;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  color: #1a1a1a;
  line-height: 1.7;

  @media (prefers-color-scheme: dark) {
    color: #e5e5e5;
  }
`;

const Prose = styled.div`
  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.5em;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  h2 {
    font-size: 1.35rem;
    font-weight: 600;
    margin: 2em 0 0.75em;
    line-height: 1.3;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #e5e5e5;

    @media (prefers-color-scheme: dark) {
      border-bottom-color: #333;
    }
  }

  p {
    margin: 0 0 1.25em;
    font-size: 1rem;
  }

  ul,
  ol {
    margin: 0 0 1.25em;
    padding-left: 1.5em;
  }

  li {
    margin-bottom: 0.5em;
  }

  strong {
    font-weight: 600;
  }

  a {
    color: #2563eb;
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      color: #1d4ed8;
    }

    @media (prefers-color-scheme: dark) {
      color: #60a5fa;
      &:hover {
        color: #93bbfd;
      }
    }
  }

  hr {
    border: none;
    border-top: 1px solid #e5e5e5;
    margin: 2em 0;

    @media (prefers-color-scheme: dark) {
      border-top-color: #333;
    }
  }
`;

export default function TermsOfService({ content }) {
  return (
    <div>
      <Head>
        <title>Terms of Service - OpenLetter.Earth</title>
        <link rel="shortcut icon" href="/icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </Head>
      <Container>
        <Prose>
          <ReactMarkdown plugins={[remarkGfm]}>{content}</ReactMarkdown>
        </Prose>
      </Container>
      <Footer />
    </div>
  );
}
