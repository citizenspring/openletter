import React, { Component } from 'react';
import fetch from 'node-fetch';
import Footer from '../../components/Footer';
import { Flex, Box } from 'reflexbox/styled-components';
import NumberFormat from 'react-number-format';
import SignatureForm from '../../components/SignatureForm';
import Notification from '../../components/Notification';
import SignatureEmailSent from '../../components/SignatureEmailSent';
import Signatures from '../../components/Signatures';
import SignaturesCount from '../../components/SignaturesCount';
import Updates from '../../components/Updates';
import LocaleSelector from '../../components/LocaleSelector';
import { withIntl } from '../../lib/i18n';
import { replaceURLsWithMarkdownAnchors } from '../../lib/utils';
import moment from 'moment';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import url from 'url';
import Link from 'next/link';
import Image from 'next/image';

const Page = ({ children, className }) => <div className={`max-w-4xl mx-auto ${className}`}>{children}</div>;
const Title = ({ children, className }) => (
  <div className={`text-3xl md:text-4xl mt-0 mb-3 leading-tight ${className}`}>{children}</div>
);
const Text = ({ children }) => <div className=" font-sans max-w-2xl dark:text-gray-300">{children}</div>;
const ViewMore = ({ children }) => <div className="text-center">{children}</div>;

class Letter extends Component {
  constructor(props) {
    super(props);
    this.state = { status: null };

    this.submitSignature = this.submitSignature.bind(this);
  }

  componentDidMount() {
    if (document.referrer.match(/\/confirm_signature\?token=/)) {
      this.setState({ status: 'confirmed' });
    }
    if (document.referrer.match(/\/create/)) {
      this.setState({ status: 'created' });
    }
  }

  async submitSignature(signature) {
    console.log('>>> submitting ', signature, 'headers', this.props.headers);
    const apiCall = `${process.env.API_URL}/letters/${this.props.letter.slug}/${this.props.letter.locale}/sign`;

    try {
      const res = await fetch(apiCall, {
        method: 'post',
        body: JSON.stringify(signature),
        headers: { 'Content-Type': 'application/json', 'accept-language': this.props.headers['accept-language'] },
      });
      const json = await res.json();
      if (json.error) {
        this.setState({ status: 'error', error: json.error });
      } else {
        this.setState({ status: 'signature_sent' });
      }
    } catch (e) {
      console.error('>>> API error', e);
      this.setState({ status: 'error', error: { message: this.props.t('error.server') } });
      setTimeout(() => {
        this.setState({ status: null, error: null });
      }, 5000);
    }
  }

  render() {
    const { letter, error, t, locale } = this.props;
    const { status } = this.state;

    if (error) {
      return (
        <Page>
          <Notification title="No letter found" />
        </Page>
      );
    } else if (!letter) {
      return (
        <Page>
          <Notification title="Loading..." />
        </Page>
      );
    }

    const text = replaceURLsWithMarkdownAnchors(letter.text.replace(/<br ?\/> ?/g, '\n'));

    return (
      <div>
        <Head>
          <title>{letter.title}</title>
          <link rel="shortcut icon" href="/icon.png" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
          {letter.image && <meta name="twitter:image" content={letter.image.src} />}
          {letter.image && <meta name="og:image" content={letter.image.src} />}
        </Head>
        <Page className="letter">
          {status === 'created' && (
            <Notification
              icon="signed"
              title={t('notification.published')}
              message={t('notification.published.info')}
            />
          )}
          {status === 'confirmed' && (
            <Notification icon="signed" title={t('notification.signed')} message={t('notification.signed.info')} />
          )}
          <Flex flexWrap="wrap">
            <Box width={[1, 2 / 3]} p={3}>
              <LocaleSelector slug={letter.slug} locales={letter.locales} currentLocale={letter.locale} />
              <strong>{moment(letter.created_at).format('D MMMM YYYY')}</strong>
              <Title>{letter.title}</Title>
              {letter.image && letter.image.src && (
                <div className="w-full">
                  <img
                    width={letter.image.width}
                    height={letter.image.height}
                    src={`/api/image?imageUrl=${encodeURIComponent(letter.image.src)}`}
                  />
                </div>
              )}
              <Text>
                <ReactMarkdown plugins={[gfm]} allowedElements={['a', 'br', 'p', 'b', 'i', 'strong', 'em', 'img']}>
                  {text}
                </ReactMarkdown>
              </Text>
              <Updates updates={letter.updates} />
            </Box>
            {letter.type === 'letter' && (
              <Box width={[1, 1 / 3]} p={3}>
                <SignaturesCount signatures={letter.signatures} stats={letter.signatures_stats} />
                {[null, 'created', 'error'].includes(status) && (
                  <SignatureForm
                    letter={letter}
                    error={this.state.error}
                    signature={this.props.signature}
                    onSubmit={(signature) => this.submitSignature(signature)}
                  />
                )}
                {status === 'signature_sent' && <SignatureEmailSent />}
                {(letter.signatures_stats.verified <= 100 || !letter.first_verified_signatures) && (
                  <Signatures signatures={letter.signatures} total={letter.signatures_stats.verified} />
                )}
                {letter.signatures_stats.verified > 100 && letter.first_verified_signatures && (
                  <>
                    <Signatures
                      signatures={letter.first_verified_signatures}
                      latest={letter.latest_verified_signatures}
                      total={letter.signatures_stats.verified}
                    />
                    <ViewMore className="my-4">
                      <div>
                        ...
                        <br />
                        <NumberFormat
                          value={
                            letter.signatures_stats.verified -
                            letter.first_verified_signatures.length -
                            letter.latest_verified_signatures.length
                          }
                          displayType={'text'}
                          thousandSeparator={true}
                        />{' '}
                        more <br />
                        verified signatures
                      </div>
                      <div>
                        <Link href={`/${letter.slug}?limit=0`} locale={locale}>
                          view all
                        </Link>
                      </div>
                    </ViewMore>
                    <Signatures
                      start={letter.signatures_stats.verified - letter.latest_verified_signatures.length + 1}
                      signatures={letter.latest_verified_signatures}
                      total={letter.signatures_stats.verified}
                    />
                  </>
                )}
              </Box>
            )}
          </Flex>
          <Footer />
        </Page>
      </div>
    );
  }
}

export async function getServerSideProps({ params, req, res, locale }) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');

  const props = { headers: req.headers };
  const parsedUrl = url.parse(req.url, true);
  const limit = parsedUrl.query.limit || 100;
  const signatureId = parsedUrl.query.signatureId || null;
  const token = parsedUrl.query.token || null;
  const apiCall = `${process.env.API_URL}/letters/${params.slug}?locale=${locale}&limit=${limit}`;
  console.log('>>> apiCall', apiCall);
  const result = await fetch(apiCall);

  if (signatureId && token) {
    const signatureApiCall = `${process.env.API_URL}/signatures/${signatureId}/${token}`;
    const signatureResult = await fetch(signatureApiCall);
    const signature = await signatureResult.json();
    props.signature = signature;
  }

  try {
    const response = await result.json();
    if (response.error) {
      props.error = response.error;
    } else {
      props.letter = response;
    }
    return { props };
  } catch (e) {
    console.error('Unable to parse JSON returned by the API', e);
  }
}

export default withIntl(Letter);
