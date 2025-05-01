import React, { Component } from 'react';
import Link from 'next/link';
import fetch from 'node-fetch';
import Notification from '../../components/Notification';
import Router, { withRouter } from 'next/router';
import { withIntl } from '../../lib/i18n';
import OpenCollectiveData from '../../components/OpenCollectiveData';
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class ConfirmSignaturePage extends Component {
  constructor(props) {
    super(props);
    const { status } = this.props.router.query;
    this.state = { status: status || null };
    this.confirmSignature = this.confirmSignature.bind(this);
  }

  async confirmSignature() {
    const { token } = this.props.router.query;
    if (!token) {
      console.error('>>> no token found in query string, aborting');
      return;
    }
    console.log('>>> confirming signature with token', token, 'letter to sign', this.props.letter);
    await sleep(500);
    const apiCall = `${process.env.API_URL}/signatures/confirm`;
    const resAction = await fetch(apiCall, {
      method: 'POST',
      body: JSON.stringify({ token }),
      headers: { 'Content-Type': 'application/json' },
    });
    const resActionJSON = await resAction.json();
    if (Router.router && this.props.letter) {
      Router.replace(`/${this.props.letter.slug}/confirm_signature?status=signature_confirmed`);
    }
    this.setState({ status: 'signature_confirmed' });
  }

  componentDidMount() {
    this.confirmSignature();
  }

  render() {
    const { letter, t } = this.props;
    const { status } = this.state;
    const { token } = this.props.router.query;
    if (!letter) {
      return (
        <div>
          <Notification title={t('error.letter.notfound')} />
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto w-full pt-4">
        <div className="px-4">
          {status === 'signature_confirmed' && (
            <>
              <Notification icon="signed" title={t('notification.signed')} message={t('notification.signed.info')} />
              <div className="text-center mt--4 mb-4 text-lg">
                <a href={`/${letter.slug}`} className="underline">
                  {letter.title}
                </a>
              </div>
              <p className="text-center text-sm">
                Looking to modify your signature?{' '}
                <a href={`/${letter.slug}?token=${token}`} className="underline">
                  Click here
                </a>
                .
              </p>
              <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-800 rounded-xl p-6 my-8 shadow-md">
                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent dark:text-white">
                  {t('notification.signed.donate.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{t('notification.signed.donate.description')}</p>
                <a
                  className="inline-block w-full text-center transition-all duration-200 text-white text-lg font-medium bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:text-white"
                  href="https://opencollective.com/openletter/donate"
                >
                  {t('notification.signed.donate.button')}
                </a>
              </div>
              <OpenCollectiveData collectiveSlug="openletter" />
            </>
          )}
          {!status && (
            <Notification
              title={`${t('notification.signing')} ${letter.title}`}
              message={t('notification.pleasewait')}
            />
          )}
        </div>
      </div>
    );
  }
}

export async function getServerSideProps({ params, req }) {
  const apiCall = `${process.env.API_URL}/letters/${params.slug}`;
  console.log('>>> apiCall', apiCall);
  const res = await fetch(apiCall);

  try {
    const letter = await res.json();
    return { props: { letter } };
  } catch (e) {
    console.error('Unable to parse JSON returned by the API', e);
  }
}

export default withIntl(withRouter(ConfirmSignaturePage));
