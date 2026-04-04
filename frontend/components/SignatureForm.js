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
      usePasskey: true, // default to passkey when available
      form: {
        name: null,
        occupation: null,
        city: null,
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
    if (isPasskeySupported()) {
      const available = await isPlatformAuthenticatorAvailable();
      this.setState({ passkeyAvailable: available, usePasskey: available });
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

    // just in case
    setTimeout(() => {
      this.setState({ loading: false });
    }, 2000);
    return false;
  }

  updatingSignature = this.props.signature && this.props.signature.id;

  render() {
    const { error, t, letter } = this.props;
    const { passkeyAvailable, usePasskey } = this.state;
    const showEmailField = !this.updatingSignature && !usePasskey;
    const showEmailOptional = !this.updatingSignature && usePasskey;

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

          {/* Passkey toggle */}
          {passkeyAvailable && !this.updatingSignature && (
            <div className="w-full py-2">
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => this.setState({ usePasskey: true })}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    usePasskey
                      ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white'
                      : 'bg-transparent text-gray-500 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  🔐 {t('sign.passkey')}
                </button>
                <button
                  type="button"
                  onClick={() => this.setState({ usePasskey: false })}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    !usePasskey
                      ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white'
                      : 'bg-transparent text-gray-500 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  ✉️ {t('sign.email')}
                </button>
              </div>
              {usePasskey && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('sign.passkey.info')}
                </p>
              )}
            </div>
          )}

          {/* Email field: required for email flow, optional for passkey (for updates) */}
          {showEmailField && (
            <div className="w-full py-1">
              <Input type="email" name="email" placeholder={t('sign.email')} onChange={this.handleChange} required />
            </div>
          )}
          {showEmailOptional && (
            <div className="w-full py-1">
              <Input type="email" name="email" placeholder={t('sign.email.optional')} onChange={this.handleChange} />
            </div>
          )}

          {!this.updatingSignature && !usePasskey && letter.user_id && (
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
        </div>
        <div className="mt-4 mb-6">
          <button
            className="text-white text-base font-sans border-white bg-gray-900 p-3 rounded-lg w-full disabled:bg-gray-500 dark:bg-black dark:text-white dark:border-white border-2 font-bold"
            disabled={this.state.loading}
          >
            {this.props.signature ? t('sign.update') : usePasskey ? t('sign.button.passkey') : t('sign.button')}
          </button>
        </div>
        {error && <div className="text-red font-bold text-center m-4">{error.message}</div>}
      </form>
    );
  }
}

export default withIntl(SignatureForm);
