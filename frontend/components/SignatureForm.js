import React, { Component } from 'react';
import { withIntl } from '../lib/i18n';
import { Label, Checkbox } from '@rebass/forms';


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
      form: {
        name: null,
        occupation: null,
        city: null,
        email: null,
        share_email: false,
      },
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(fieldname, value) {
    const { form } = this.state;
    form[fieldname] = value;
    this.setState({ form });
  }

  async handleSubmit(event) {
    this.setState({ loading: true });
    event.preventDefault();
    await this.props.onSubmit(this.state.form);

    // just in case
    setTimeout(() => {
      this.setState({ loading: false });
    }, 2000);
    return false;
  }

  render() {
    const { error, t, letter } = this.props;
    return (
      <form onSubmit={this.handleSubmit}>
        <div className="flex-wrap">
          <div className="w-full py-1">
            <input
              className="font-[SignPainter] text-3xl border-dotted border-gray-400 border pt-2 px-2 pb-1 rounded-lg w-full dark:bg-black dark:text-gray-50 dark:border-white"
              type="text"
              id="name"
              placeholder={t('sign.name')}
              onChange={(e) => this.handleChange('name', e.target.value)}
            />
          </div>
          <div className="flex w-full py-1">
            <div className="w-1/2 mr-1">
              <Input name="occupation" placeholder={t('sign.occupation')} onChange={this.handleChange} />
            </div>
            <div className="w-1/2">
              <Input name="city" placeholder={t('sign.city')} onChange={this.handleChange} />
            </div>
          </div>
          <div className="w-full py-1">
            <Input name="organization" placeholder={t('sign.organization')} onChange={this.handleChange} />
          </div>
          <div className="w-full py-1">
            <Input type="email" name="email" placeholder={t('sign.email')} onChange={this.handleChange} required />
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
        </div>
        <div className="mt-4 mb-6">
          <button
            className="text-white text-base font-sans border-white bg-gray-900 p-3 rounded-lg w-full disabled:bg-gray-500 dark:bg-black dark:text-white dark:border-white border-2 font-bold"
            disabled={this.state.loading}
          >
            {t('sign.button')}
          </button>
        </div>
        {error && <div className="text-red font-bold text-center m-4">{error.message}</div>}
      </form>
    );
  }
}

export default withIntl(SignatureForm);
