import React, { Component } from 'react';
import { withIntl } from '../lib/i18n';
import { Label, Checkbox } from '@rebass/forms';
import { isPasskeySupported, isPlatformAuthenticatorAvailable } from '../lib/passkey';

const Input = ({ type, name, placeholder, onChange, ...rest }) => (
  <input
    className="border-dotted border-gray-400 border p-2 rounded-lg w-full dark:bg-black dark:text-gray-50 dark:border-white"
    type={type || 'text'}
    id={name}
    placeholder={placeholder || name}
    onChange={(e) => onChange(name, e.target.value)}
    {...rest}
  />
);

class SignatureForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      passkeyAvailable: false,
      usePasskey: false,
      emailOptional: false, // true when passkey is available and user hasn't switched to email
      form: {
        name: null,
        occupation: null,
        city: null,
        organization: null,
        email: null,
        share_email: false,
        id: this.props.signature && this.props.signature.id,
        token: this.props.signature && this.props.signature.token,
      },
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('passkey') === 'true' && isPasskeySupported()) {
      const available = await isPlatformAuthenticatorAvailable();
      this.setState({ passkeyAvailable: available, usePasskey: available, emailOptional: available });
    }
  }

  handleChange(fieldname, value) {
    const { form } = this.state;
    form[fieldname] = value;
    this.setState({ form });
  }

  async handleSubmit(event) {
    this.setState({ loading: true });
    event.preventDefault();

    const formData = { ...this.state.form };
    if (this.state.usePasskey && this.state.passkeyAvailable) {
      formData.use_passkey = true;
    }

    await this.props.onSubmit(formData);

    setTimeout(() => {
      this.setState({ loading: false });
    }, 2000);
    return false;
  }

  updatingSignature = this.props.signature && this.props.signature.id;

  render() {
    const { error, t, letter } = this.props;
    const { passkeyAvailable, usePasskey, emailOptional } = this.state;

    // When ?passkey=true and passkey is available, show the redesigned flow
    const showPasskeyFlow = passkeyAvailable && !this.updatingSignature;
    // Fallback: current interface when passkey is NOT available
    const showFallbackFlow = !passkeyAvailable && !this.updatingSignature;

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="flex-wrap">
          <div className="w-full py-1">
            <input
              className="font-[SignPainter] text-3xl border-dotted border-gray-400 border pt-2 px-2 pb-1 rounded-lg w-full dark:bg-black dark:text-gray-50 dark:border-white"
              type="text"
              id="name"
              placeholder={t('sign.name')}
              defaultValue={this.props.signature && this.props.signature.name}
              onChange={(e) => this.handleChange('name', e.target.value)}
            />
          </div>
          <div className="flex w-full py-1">
            <div className="w-1/2 mr-1">
              <Input
                name="occupation"
                placeholder={t('sign.occupation')}
                onChange={this.handleChange}
                defaultValue={this.props.signature && this.props.signature.occupation}
              />
            </div>
            <div className="w-1/2">
              <Input
                name="city"
                placeholder={t('sign.city')}
                onChange={this.handleChange}
                defaultValue={this.props.signature && this.props.signature.city}
              />
            </div>
          </div>
          <div className="w-full py-1">
            <Input
              name="organization"
              placeholder={t('sign.organization')}
              onChange={this.handleChange}
              defaultValue={this.props.signature && this.props.signature.organization}
            />
          </div>

          {/* ── Redesigned passkey flow ───────────────────────────────── */}
          {showPasskeyFlow && (
            <>
              {/* Email: optional (with subtext) or required (with checkbox) */}
              {emailOptional ? (
                // Passkey-first mode: email optional + subtext
                <div className="w-full py-1">
                  <Input type="email" name="email" placeholder={t('sign.email')} onChange={this.handleChange} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('sign.email.optional.subtext')}
                  </p>
                </div>
              ) : (
                // Email mode: required + checkbox opt-in
                <div className="w-full py-1">
                  <Input
                    type="email"
                    name="email"
                    placeholder={t('sign.email')}
                    onChange={this.handleChange}
                    required
                  />
                  {letter.user_id && (
                    <div className="my-2">
                      <Label>
                        <div className="mt-1 mr-0">
                          <Checkbox
                            id="share_email"
                            name="share_email"
                            onChange={(e) => this.handleChange('share_email', e.target.checked)}
                          />
                        </div>
                        <label className="ml-1 text-sm text-gray-600 dark:text-gray-300">
                          {t('sign.share_email')}
                        </label>
                      </Label>
                    </div>
                  )}
                </div>
              )}

              {/* Primary button */}
              <div className="mt-4 mb-2">
                <button
                  type="submit"
                  className="text-white text-base font-sans border-white bg-gray-900 p-3 rounded-lg w-full disabled:bg-gray-500 dark:bg-black dark:text-white dark:border-white border-2 font-bold"
                  disabled={this.state.loading}
                >
                  {t('sign.button.passkey')}
                </button>
              </div>

              {/* Toggle link */}
              <div className="text-center mb-6">
                {emailOptional ? (
                  <button
                    type="button"
                    className="text-sm text-gray-500 underline hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => this.setState({ usePasskey: false, emailOptional: false })}
                  >
                    {t('sign.email.instead')}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-sm text-gray-500 underline hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => this.setState({ usePasskey: true, emailOptional: true })}
                  >
                    {t('sign.passkey.instead')}
                  </button>
                )}
              </div>
            </>
          )}

          {/* ── Fallback: standard interface when passkey not available ── */}
          {showFallbackFlow && (
            <>
              <div className="w-full py-1">
                <Input
                  type="email"
                  name="email"
                  placeholder={t('sign.email')}
                  onChange={this.handleChange}
                  required
                />
              </div>
              {letter.user_id && (
                <div className="my-1">
                  <Label>
                    <div className="mt-1 mr-0">
                      <Checkbox
                        id="share_email"
                        name="share_email"
                        onChange={(e) => this.handleChange('share_email', e.target.checked)}
                      />
                    </div>
                    <label className="ml-1">{t('sign.share_email')}</label>
                  </Label>
                </div>
              )}
              <div className="mt-4 mb-6">
                <button
                  className="text-white text-base font-sans border-white bg-gray-900 p-3 rounded-lg w-full disabled:bg-gray-500 dark:bg-black dark:text-white dark:border-white border-2 font-bold"
                  disabled={this.state.loading}
                >
                  {this.props.signature ? t('sign.update') : t('sign.button')}
                </button>
              </div>
            </>
          )}

          {/* ── Existing signature update (no passkey flow) ── */}
          {this.updatingSignature && (
            <>
              <div className="w-full py-1">
                <Input
                  type="email"
                  name="email"
                  placeholder={t('sign.email')}
                  onChange={this.handleChange}
                />
              </div>
              <div className="mt-4 mb-6">
                <button
                  className="text-white text-base font-sans border-white bg-gray-900 p-3 rounded-lg w-full disabled:bg-gray-500 dark:bg-black dark:text-white dark:border-white border-2 font-bold"
                  disabled={this.state.loading}
                >
                  {t('sign.update')}
                </button>
              </div>
            </>
          )}
        </div>
        {error && <div className="text-red font-bold text-center m-4">{error.message}</div>}
      </form>
    );
  }
}

export default withIntl(SignatureForm);
