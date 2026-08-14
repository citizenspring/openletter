import React, { Component } from 'react';
import fetch from 'node-fetch';
import Footer from '../components/Footer';
import LetterForm, { DRAFT_KEY } from '../components/LetterForm';
import Faq from '../components/LetterForm-Faq';
import Notification from '../components/Notification';
import Router from 'next/router';
import Head from 'next/head';
import { withIntl } from '../lib/i18n';

class CreateLetterPage extends Component {
  constructor(props) {
    super(props);
    this.state = { status: null, error: null };
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

    try {
      const res = await fetch(apiCall, {
        method: 'post',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      console.log('>>> json', json);

      if (json.error) {
        this.setState({ error: { message: json.error.message || this.props.t('error.server') } });
        setTimeout(() => this.setState({ error: null }), 5000);
        return;
      }

      // If invite-only, redirect to Stripe Checkout
      if (letters[0].letter_type === 'invite_only') {
        try {
          const checkoutRes = await fetch(`${process.env.API_URL}/letters/${json.slug}/checkout`, {
            method: 'post',
            body: JSON.stringify({ token: json.token }),
            headers: { 'Content-Type': 'application/json' },
          });
          const checkoutJson = await checkoutRes.json();
          if (checkoutJson.checkout_url) {
            // Clear draft only after successful creation + checkout redirect
            try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
            window.location.href = checkoutJson.checkout_url;
            return;
          }
        } catch (e) {
          console.error('>>> Stripe checkout error', e);
        }
      }

      // Clear draft on successful publish
      try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
      Router.push(`/${json.slug}`);
    } catch (e) {
      console.error('>>> API error', e);
      this.setState({ error: { message: this.props.t('error.server') } });
      setTimeout(() => this.setState({ error: null }), 5000);
    }
  }

  render() {
    const { status, error } = this.state;
    const { t } = this.props;

    return (
      <div>
        <Head>
          <title>{t('create.page.title')} - OpenLetter.Earth</title>
          <link rel="shortcut icon" href="/icon.png" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        </Head>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">{t('create.page.heading')}</h1>
            <p className="text-gray-500 dark:text-gray-400">{t('create.page.subheading')}</p>
          </div>

          {status === 'confirmed' && (
            <div className="mb-6">
              <Notification icon="signed" title={t('signed')} message={t('signed.share')} />
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
              <p className="text-red-700 dark:text-red-300 font-medium">{error.message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              {status === null && <LetterForm onSubmit={this.createLetter} />}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Draft indicator */}
                <DraftIndicator />

                {/* FAQ */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
                  <Faq />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }
}

function DraftIndicator() {
  const [hasDraft, setHasDraft] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState(null);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.form && draft.form[0]?.title) {
          setHasDraft(true);
          if (draft.savedAt) {
            const d = new Date(draft.savedAt);
            setSavedAt(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        }
      }
    } catch (e) {}

    // Update indicator when storage changes
    const handler = () => {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          const draft = JSON.parse(saved);
          setHasDraft(!!(draft.form && draft.form[0]?.title));
          if (draft.savedAt) {
            setSavedAt(new Date(draft.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        } else {
          setHasDraft(false);
        }
      } catch (e) {}
    };
    window.addEventListener('storage', handler);
    // Poll for local changes (storage event only fires cross-tab)
    const interval = setInterval(handler, 3000);
    return () => {
      window.removeEventListener('storage', handler);
      clearInterval(interval);
    };
  }, []);

  if (!hasDraft) return null;

  return (
    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-sm">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-green-700 dark:text-green-300">Draft saved{savedAt ? ` at ${savedAt}` : ''}</span>
      </div>
      <button
        onClick={() => {
          try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
          window.location.reload();
        }}
        className="text-xs text-gray-500 hover:text-red-500"
      >
        Clear
      </button>
    </div>
  );
}

export default withIntl(CreateLetterPage);
