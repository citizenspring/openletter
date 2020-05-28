import React, { Component } from 'react';
import Link from 'next/link';
import fetch from 'node-fetch';
import styled from 'styled-components';
import Footer from '../../components/Footer';
import { Flex, Box } from 'reflexbox/styled-components';
import { typography, space } from 'styled-system';
import LetterForm from '../../components/LetterForm';
import Faq from '../../components/LetterForm-Faq';
import Notification from '../../components/Notification';
import Router from 'next/router';
import { withIntl } from '../../lib/i18n';

const Page = styled.div`
  max-width: 960px;
  margin: 0 auto;
`;

const TopBanner = styled.div`
  font-size: 16px;
  background: black;
  color: white;
  padding: 10px;
  margin: -10px -10px 10px -10px;
  & a {
    color: white;
  }
`;

const Text = styled.div`
  max-width: 80ex;
`;

const BigNumber = styled.div`
  font-size: 64pt;
  ${typography}
`;

// BigNumber.defaultProps = {
//   fontSize: '64pt'
// };

const BigNumberLabel = styled.div`
  font-size: 32pt;
  margin-top: -14px;
  ${space}
  ${typography}
`;

class CreateLetterPage extends Component {
  constructor(props) {
    super(props);
    this.state = { status: null };

    this.createUpdate = this.createUpdate.bind(this);
  }

  componentDidMount() {
    if (document.referrer.match(/\/confirm_signature\?token=/)) {
      this.setState({ status: 'confirmed' });
    }
  }

  async createUpdate(formData) {
    formData.parent_letter_id = this.props.parentLetter.id;
    if (this.props.token) {
      formData.token = this.props.token;
    }
    console.log('>>> submitting ', formData);
    const apiCall = `${process.env.API_URL}/letters/update`;

    const res = await fetch(apiCall, {
      method: 'post',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' },
    });
    try {
      const json = await res.json();
      console.log('>>> json', json);
      Router.push(`/${this.props.parentLetter.slug}`);
    } catch (e) {
      console.error('>>> unable to parse JSON', e);
    }
  }

  render() {
    const { status } = this.state;
    const { t, parentLetter } = this.props;

    return (
      <>
        <TopBanner>
          Posting an update to{' '}
          <Link href={`/${parentLetter.slug}`}>
            <a>{parentLetter.title}</a>
          </Link>
        </TopBanner>
        <Page>
          <Flex flexWrap="wrap">
            <Box width={[1, 2 / 3]} p={3}>
              {status === null && (
                <LetterForm parentLetter={parentLetter} onSubmit={(letters) => this.createUpdate({ letters })} />
              )}
            </Box>
            <Box width={[1, 1 / 3]} p={3}>
              <Faq />
            </Box>
          </Flex>
          <Footer />
        </Page>
      </>
    );
  }
}

export async function getServerSideProps({ params, req, query }) {
  const props = { headers: req.headers };
  const apiCall = `${process.env.API_URL}/letters/${params.slug}`;
  const res = await fetch(apiCall);
  try {
    const response = await res.json();
    if (response.error) {
      props.error = response.error;
    } else {
      props.parentLetter = response;
      props.token = query.token;
    }
    return { props };
  } catch (e) {
    console.error('Unable to parse JSON returned by the API', e);
  }
}

export default withIntl(CreateLetterPage);
