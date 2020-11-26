import React, { Component } from 'react';
import Link from 'next/link';
import fetch from 'node-fetch';
import styled from 'styled-components';
import Footer from '../components/Footer';
import { Flex, Box } from 'reflexbox/styled-components';
import { typography, space } from 'styled-system';
import LetterForm from '../components/LetterForm';
import Faq from '../components/LetterForm-Faq';
import Notification from '../components/Notification';
import Router from 'next/router';
import { withIntl } from '../lib/i18n';

const Page = styled.div`
  max-width: 960px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 50px;
  color: ${({ theme }) => theme.colors.primary};
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

    this.createLetter = this.createLetter.bind(this);
  }

  componentDidMount() {
    if (document.referrer.match(/\/confirm_signature\?token=/)) {
      this.setState({ status: 'confirmed' });
    }
  }

  async createLetter(letters) {
    const formData = { letters };
    console.log('>>> submitting ', formData);

    const apiCall = `${process.env.API_URL}/letters/create`;

    const res = await fetch(apiCall, {
      method: 'post',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' },
    });
    try {
      const json = await res.json();
      console.log('>>> json', json);
      Router.push(`/${json.slug}`);
    } catch (e) {
      console.error('>>> unable to parse JSON', e);
    }
  }

  render() {
    const { status } = this.state;
    const { t } = this.props;

    return (
      <Page>
        {status === 'confirmed' && <Notification icon="signed" title={t('signed')} message={t('signed.share')} />}
        <Flex flexWrap="wrap">
          <Box width={[1, 2 / 3]} p={3}>
            {status === null && <LetterForm onSubmit={this.createLetter} />}
          </Box>
          <Box width={[1, 1 / 3]} p={3}>
            <Faq />
          </Box>
        </Flex>
        <Footer />
      </Page>
    );
  }
}

export default withIntl(CreateLetterPage);
