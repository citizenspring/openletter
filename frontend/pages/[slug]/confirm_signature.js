import React, { Component } from 'react';
import Link from 'next/link';
import fetch from 'node-fetch';
import Notification from '../../components/Notification';
import styled from 'styled-components';
import Router, { withRouter } from 'next/router';
import { withIntl } from '../../lib/i18n';

const Page = styled.div`
  max-width: 960px;
  margin: 0 auto;
`;

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
    if (Router.router && this.props.letter) {
      Router.replace(`/${this.props.letter.slug}`);
    }
  }

  componentDidMount() {
    this.confirmSignature();
  }

  render() {
    const { letter, t } = this.props;
    const { status } = this.state;
    if (!letter) {
      return (
        <Page>
          <Notification title={t('error.letter.notfound')} />
        </Page>
      );
    }

    return (
      <Page>
        {status === 'signature_confirmed' && (
          <Notification icon="signed" title={t('notification.signed')} message={t('notification.signed.info')} />
        )}
        {!status && (
          <Notification title={`${t('notification.signing')} ${letter.title}`} message={t('notification.pleasewait')} />
        )}
      </Page>
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
