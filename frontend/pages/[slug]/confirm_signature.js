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
    this.state = { status: null };
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
    this.setState({ status: 'signature_confirmed' });
    // if (Router.router && this.props.letter) {
    //   Router.replace(`/${this.props.letter.slug}`);
    // }
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
      <div className="w-full pt-4">
        {status === 'signature_confirmed' && (
          <>
            <div className="text-center mt-4 text-lg">
              <a href={`/${letter.slug}`} className="underline">
                {letter.title}
              </a>
            </div>
            <Notification icon="signed" title={t('notification.signed')} message={t('notification.signed.info')} />
            <p>
              Looking to modify your signature?{' '}
              <a href={`/${letter.slug}?token=${token}`} className="underline">
                Click here
              </a>
              .
            </p>
            <div className="flex justify-center flex-col text-center my-4">
              <h2 className="text-2xl">{t('notification.signed.donate.title')}</h2>
              <a
                className="my-4 mx-4 text-white text-base font-sans border-white bg-gray-900 p-3 rounded-lg disabled:bg-gray-500 dark:bg-black dark:text-white dark:border-white border-2 font-bold"
                href="https://opencollective.com/openletter/donate"
              >
                {t('notification.signed.donate.button')}
              </a>
            </div>
            <OpenCollectiveData collectiveSlug="openletter" />
          </>
        )}
        {!status && (
          <Notification title={`${t('notification.signing')} ${letter.title}`} message={t('notification.pleasewait')} />
        )}
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
