import React, { Component } from 'react';
import Link from 'next/link';
import fetch from 'node-fetch';
import styled from 'styled-components';
import pluralize from 'pluralize';
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

class DeleteLetterPage extends Component {
  constructor(props) {
    super(props);
    this.state = { status: null };

    this.delete = this.delete.bind(this);
  }

  async delete(e) {
    e.preventDefault();
    const formData = {};
    formData.parent_letter_id = this.props.parentLetter.id;
    if (this.props.token) {
      formData.token = this.props.token;
    }
    console.log('>>> submitting ', formData);
    const apiCall = `${process.env.API_URL}/letters/delete`;

    const res = await fetch(apiCall, {
      method: 'post',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' },
    });
    try {
      const json = await res.json();
      console.log('>>> response', json);
      if (json.code == 200) {
        this.setState({ status: 'deleted' });
      } else if (json.error) {
        this.setState({ status: 'error', error: json.error.message });
      }
    } catch (e) {
      console.error('>>> unable to parse JSON', e);
    }
    return false;
  }

  render() {
    const { status } = this.state;
    const { t, parentLetter, token } = this.props;
    if (!parentLetter) {
      return (
        <Page>
          <div>
            <h1>Not found</h1>
            <p>This open letter cannot be found in the database.</p>
          </div>
          <Footer />
        </Page>
      );
    }
    return (
      <>
        <TopBanner>
          Deleting{' '}
          <Link href={`/${parentLetter.slug}`}>
            <a>{parentLetter.title}</a>
          </Link>
        </TopBanner>
        <Page>
          <Flex flexWrap="wrap">
            <Box width={[1, 2 / 3]} p={3}>
              {status === null && (
                <div>
                  <h1>Deleting an Open Letter</h1>
                  <p>
                    Are you sure you'd like to delete this open letter (
                    <Link href={`/${parentLetter.slug}`}>
                      <a>{parentLetter.title}</a>
                    </Link>
                    ) that has {parentLetter.signatures.length} {pluralize('signature', parentLetter.signatures.length)}
                    ?{' '}
                  </p>
                  <form method="POST" onSubmit={this.delete}>
                    <input type="hidden" name="parent_letter_id" value={parentLetter.id} />
                    <input type="hidden" name="token" value={token} />
                    <input type="submit" value="Yes, delete this open letter" />
                  </form>
                </div>
              )}
              {status === 'deleted' && (
                <div>
                  <h1>🗑️</h1>
                  <h2>Open letter deleted successfully.</h2>
                  <p>No trace left in the database 🧹</p>
                </div>
              )}
              {status === 'error' && (
                <div>
                  <h1>🙅🏻‍♂️</h1>
                  <h2>An error occured</h2>
                  <p>{this.state.error}</p>
                </div>
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

export default withIntl(DeleteLetterPage);
