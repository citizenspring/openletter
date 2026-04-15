import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import fetch from 'node-fetch';
import Footer from '../../components/Footer';
import { withIntl } from '../../lib/i18n';
import url from 'url';

function ManagePage({ letter, token, invitations: initialInvitations, paymentSuccess, error, t }) {
  const [invitations, setInvitations] = useState(initialInvitations || []);
  const [emails, setEmails] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(paymentSuccess ? t('manage.payment_success') : null);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center mt-12">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center mt-12">
        <p>Loading...</p>
      </div>
    );
  }

  async function sendInvites() {
    setSending(true);
    setMessage(null);
    const emailList = emails.split(/[,\n]/).map(e => e.trim()).filter(Boolean);
    if (emailList.length === 0) {
      setMessage(t('manage.no_emails'));
      setSending(false);
      return;
    }

    try {
      const res = await window.fetch(`${process.env.API_URL}/letters/${letter.slug}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, emails: emailList }),
      });
      const json = await res.json();
      if (json.error) {
        setMessage(json.error.message);
      } else {
        setMessage(`${json.invitations.length} invitation(s) sent!`);
        setEmails('');
        // Refresh invitations
        refreshInvitations();
      }
    } catch (e) {
      setMessage('Failed to send invitations');
    }
    setSending(false);
  }

  async function refreshInvitations() {
    try {
      const res = await window.fetch(
        `${process.env.API_URL}/letters/${letter.slug}/invitations?token=${token}`
      );
      const json = await res.json();
      if (json.invitations) setInvitations(json.invitations);
    } catch (e) {
      console.error('Failed to refresh invitations', e);
    }
  }

  const signed = invitations.filter(i => i.used_at);
  const pending = invitations.filter(i => !i.used_at);

  return (
    <div>
      <Head>
        <title>Manage - {letter.title}</title>
        <link rel="shortcut icon" href="/icon.png" />
      </Head>
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-6">
          <Link href={`/${letter.slug}`}>
            <a className="text-sm text-gray-500 hover:text-gray-800">← Back to letter</a>
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">{t('manage.title')}</h1>
        <h2 className="text-lg text-gray-600 dark:text-gray-400 mb-6">{letter.title}</h2>

        {message && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg mb-6 text-sm">
            {message}
          </div>
        )}

        {/* Status */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{invitations.length}</div>
            <div className="text-sm text-gray-500">{t('manage.invited')}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{signed.length}</div>
            <div className="text-sm text-gray-500">{t('manage.signed')}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{pending.length}</div>
            <div className="text-sm text-gray-500">{t('manage.pending')}</div>
          </div>
        </div>

        {/* Invite form */}
        {letter.restriction_mode === 'invite' && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">{t('manage.invite_people')}</h3>
            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm dark:bg-black dark:text-white"
              rows={4}
              placeholder={t('manage.emails_placeholder')}
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
            />
            <button
              onClick={sendInvites}
              disabled={sending}
              className="mt-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-500 dark:bg-white dark:text-black"
            >
              {sending ? t('manage.sending') : t('manage.send_invites')}
            </button>
          </div>
        )}

        {letter.restriction_mode === 'domain' && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm">
              <strong>{t('manage.domain_mode')}</strong>{' '}
              {t('manage.domain_mode.desc')} <strong>{letter.allowed_domains?.join(', ')}</strong>
            </p>
          </div>
        )}

        {/* Invitations list */}
        {invitations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('manage.invitations_list')}</h3>
            <ul className="space-y-2">
              {invitations.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                  <div>
                    <span className="font-medium">{inv.email}</span>
                    {inv.generation > 0 && (
                      <span className="ml-2 text-xs text-gray-400">gen {inv.generation}</span>
                    )}
                  </div>
                  <div>
                    {inv.used_at ? (
                      <span className="text-green-600 dark:text-green-400">✓ {t('manage.status.signed')}</span>
                    ) : (
                      <span className="text-yellow-600 dark:text-yellow-400">{t('manage.status.pending')}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export async function getServerSideProps({ params, req }) {
  const parsedUrl = url.parse(req.url, true);
  const token = parsedUrl.query.token;
  const paymentSuccess = parsedUrl.query.payment === 'success';

  if (!token) {
    return { props: { error: 'Missing token' } };
  }

  const props = { token, paymentSuccess };

  try {
    // If returning from payment, verify it
    if (paymentSuccess) {
      await fetch(`${process.env.API_URL}/letters/${params.slug}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    }

    // Fetch letter
    const letterRes = await fetch(`${process.env.API_URL}/letters/${params.slug}`);
    const letter = await letterRes.json();
    if (letter.error) {
      props.error = letter.error.message;
    } else {
      props.letter = letter;
    }

    // Fetch invitations
    const invRes = await fetch(`${process.env.API_URL}/letters/${params.slug}/invitations?token=${token}`);
    const invData = await invRes.json();
    props.invitations = invData.invitations || [];
  } catch (e) {
    props.error = 'Failed to load data';
  }

  return { props };
}

export default withIntl(ManagePage);
