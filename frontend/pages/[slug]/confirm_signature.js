import React, { Component } from 'react';
import Link from 'next/link';
import fetch from 'node-fetch';
import Notification from '../../components/Notification';
import styled from 'styled-components';
import Router, { withRouter } from 'next/router';

const Page = styled.div`
  max-width: 960px;
  margin: 0 auto;
`;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class ConfirmSignaturePage extends Component {

  constructor(props) {
    super(props);
    console.log(">>> constructor", props.router.query);
    this.state = { status: null };

    this.confirmSignature = this.confirmSignature.bind(this);
  }

  static async getInitialProps({query}) {
    const apiCall = `${process.env.API_URL}/letters/${query.slug}`;
    console.log(">>> apiCall", apiCall)
    const res = await fetch(apiCall);
    console.log(">>> query", query);

    try {
      const letter = await res.json();
      return { letter };
    } catch (e) {
      console.error("Unable to parse JSON returned by the API", e);
    }
  }
  
  async confirmSignature() {
    const { token } = this.props.router.query;
    console.log(">>> confirming signature with token", token);
    await sleep(500);
    const apiCall = `${process.env.API_URL}/signatures/confirm`;
    const resAction = await fetch(apiCall, {
      method: 'POST',
      body: JSON.stringify({ token }),
      headers: { 'Content-Type': 'application/json' },
    });
    const resActionJSON = await resAction.json();
    this.setState({ status: 'signature_confirmed' });
    if (Router.router) {
      Router.replace(`/${this.props.letter.slug}`);
    }
  }
  
  redirect() {
  }

  componentWillMount() {
    console.log(">>> kicking confirmSignature()");
    this.confirmSignature();
  }

  render() {
    const { letter } = this.props;
    const { status } = this.state;
    if (!letter) {
      return (<Page><Notification title="No letter found" /></Page>);
    }

    return (
      <Page>
        {status === 'signature_confirmed' && (
          <Notification icon="signed" title="Signed!" message="Share this open letter and get more people to sign it." />
        )}
        {!status && (
          <Notification title={`Signing ${letter.title}`} message="Please wait" />          
        )}
      </Page>
    )
  };
}


export default withRouter(ConfirmSignaturePage);