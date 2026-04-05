import React, { Component } from 'react';
import styled from 'styled-components';
import { withIntl } from '../lib/i18n';
import availableLocales from '../constants/locales.json';

const TitleInput = styled.input`
  border: 1px dotted grey;
  font-size: 24pt;
  border-radius: 5px;
  padding: 10px;
  font-family: 'Baskerville', Serif;
  box-sizing: border-box;
  width: 100%;
  @media (prefers-color-scheme: dark) {
    background: #111;
    color: white;
  }
`;

const StyledInput = styled.input`
  border: 1px dotted grey;
  font-size: 14pt;
  border-radius: 5px;
  padding: 10px;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  box-sizing: border-box;
  width: 100%;
  margin: 5px 0;
  @media (prefers-color-scheme: dark) {
    background: #111;
    color: white;
  }
`;

const StyledTextarea = styled.textarea`
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  border: 1px dotted grey;
  font-size: 14pt;
  border-radius: 5px;
  padding: 10px;
  box-sizing: border-box;
  width: 100%;
  height: 600px;
  @media (prefers-color-scheme: dark) {
    background: #111;
    color: white;
  }
`;

const StyledButton = styled.button`
  margin-top: 30px;
  font-size: 12pt;
  font-family: 'Arial';
  background: #111;
  color: white;
  border: 2px solid white;
  padding: 10px;
  border-radius: 5px;
  box-sizing: border-box;
  &[disabled] {
    background: #999;
  }
  @media (prefers-color-scheme: dark) {
    background: #111;
    color: white;
  }
`;

const ActionLink = styled.a`
  font-size: 14px;
  cursor: pointer;
  color: red;
  font-weight: bold;
  &:hover {
    color: darkred;
  }
`;

class LetterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      letterType: 'public',
      restrictionMode: 'invite',
      allowedDomains: '',
      invitesPerPerson: 5,
      allowChainInvites: false,
      form: [
        {
          locale: props.locale,
          title: null,
          text: null,
          image: null,
        },
      ],
    };

    // If we pass the list of locales (when posting an update)
    if (props.parentLetter) {
      this.state.form = [];
      props.parentLetter.locales.map((locale) => {
        this.state.form.push({ locale, title: null, text: null });
      });
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.firstTitleInput.focus();
  }

  handleChange(fieldname, value, index) {
    const { form } = this.state;
    form[index || 0] = form[index || 0] || {};
    form[index || 0][fieldname] = value;
    this.setState({ form });
  }

  async handleSubmit(event) {
    this.setState({ loading: true });
    event.preventDefault();

    // Attach invite-only settings to the first form entry
    const formData = [...this.state.form];
    if (this.state.letterType === 'invite_only') {
      formData[0].letter_type = 'invite_only';
      formData[0].restriction_mode = this.state.restrictionMode;
      if (this.state.restrictionMode === 'invite') {
        formData[0].invites_per_person = this.state.invitesPerPerson;
        formData[0].allow_chain_invites = this.state.allowChainInvites;
      }
      if (this.state.restrictionMode === 'domain') {
        const domains = this.state.allowedDomains.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);
        formData[0].allowed_domains = JSON.stringify(domains);
      }
    }

    await this.props.onSubmit(formData);

    // just in case
    setTimeout(() => {
      this.setState({ loading: false });
    }, 2000);
    return false;
  }

  addLanguage() {
    const { form } = this.state;
    form.push({
      locale: 'en',
      title: null,
      text: null,
    });
    this.setState({ form });
  }

  removeLanguage(index) {
    const { form } = this.state;
    const deletedLocale = form.splice(index, 1);
    this.setState({ form });
  }

  render() {
    const { parentLetter, t } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        {this.state.form.map((form, index) => (
          <>
            {this.state.form.length > 0 && (
              <div className="flex justify-between">
                <div>
                  <select
                    className="dark:text-white dark:bg-black"
                    defaultValue={form.locale}
                    onChange={(e) => this.handleChange('locale', e.target.value, index)}
                  >
                    {Object.keys(availableLocales).map((l) => {
                      return (
                        <option key={l} value={l}>
                          {availableLocales[l].emoji} {availableLocales[l].name}
                        </option>
                      );
                    })}
                  </select>
                </div>
                {index > 0 && !parentLetter && (
                  <div>
                    <ActionLink onClick={() => this.removeLanguage(index)}>[{t('create.removeLanguage')} ⨯]</ActionLink>
                  </div>
                )}
              </div>
            )}
            <div className="my-1 w-full">
              <TitleInput
                type="text"
                id="title"
                placeholder={t('create.title')}
                value={form.title}
                onChange={(e) => this.handleChange('title', e.target.value, index)}
                ref={(input) => {
                  this.firstTitleInput = this.firstTitleInput || input;
                }}
              />
            </div>
            {index === 0 && (
              <div className="my-1 w-full">
                <StyledInput
                  type="url"
                  id="url"
                  placeholder={t('create.image')}
                  onChange={(e) => this.handleChange('image', e.target.value)}
                />
              </div>
            )}
            <div className="my-1 w-full">
              <StyledTextarea
                name="text"
                onChange={(e) => this.handleChange('text', e.target.value, index)}
                required
                placeholder={t('create.text')}
              />
            </div>
          </>
        ))}
        {!parentLetter && <ActionLink onClick={() => this.addLanguage()}>[{t('create.addLanguage')}]</ActionLink>}
        {!parentLetter && (
          <div>
            <p className="mt-4">{t('create.admin_info.description')}</p>
            <StyledInput
              type="email"
              id="email"
              required
              placeholder={t('create.email')}
              onChange={(e) => this.handleChange('email', e.target.value)}
            />
          </div>
        )}

        {/* Letter type selector */}
        {!parentLetter && (
          <div className="mt-6 p-4 border border-gray-200 rounded-lg dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-3">{t('create.type.title')}</h3>
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => this.setState({ letterType: 'public' })}
                className={`flex-1 p-3 rounded-lg border-2 transition-colors text-left ${
                  this.state.letterType === 'public'
                    ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="font-semibold">📢 {t('create.type.public')}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('create.type.public.desc')}</div>
              </button>
              <button
                type="button"
                onClick={() => this.setState({ letterType: 'invite_only' })}
                className={`flex-1 p-3 rounded-lg border-2 transition-colors text-left ${
                  this.state.letterType === 'invite_only'
                    ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="font-semibold">🔒 {t('create.type.invite_only')} <span className="text-sm font-normal text-gray-500">€10</span></div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('create.type.invite_only.desc')}</div>
              </button>
            </div>

            {/* Invite-only settings */}
            {this.state.letterType === 'invite_only' && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                <div>
                  <label className="text-sm font-medium">{t('create.restriction.title')}</label>
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => this.setState({ restrictionMode: 'invite' })}
                      className={`px-3 py-1.5 rounded-lg border text-sm ${
                        this.state.restrictionMode === 'invite'
                          ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      🔗 {t('create.restriction.invite')}
                    </button>
                    <button
                      type="button"
                      onClick={() => this.setState({ restrictionMode: 'domain' })}
                      className={`px-3 py-1.5 rounded-lg border text-sm ${
                        this.state.restrictionMode === 'domain'
                          ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      📧 {t('create.restriction.domain')}
                    </button>
                  </div>
                </div>

                {this.state.restrictionMode === 'invite' && (
                  <>
                    <div>
                      <label className="text-sm font-medium">{t('create.invites_per_person')}</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={this.state.invitesPerPerson}
                        onChange={(e) => this.setState({ invitesPerPerson: parseInt(e.target.value) || 5 })}
                        className="ml-2 w-20 border border-gray-300 rounded px-2 py-1 text-sm dark:bg-black dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={this.state.allowChainInvites}
                          onChange={(e) => this.setState({ allowChainInvites: e.target.checked })}
                        />
                        {t('create.allow_chain_invites')}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 ml-5">{t('create.allow_chain_invites.desc')}</p>
                    </div>
                  </>
                )}

                {this.state.restrictionMode === 'domain' && (
                  <div>
                    <label className="text-sm font-medium">{t('create.allowed_domains')}</label>
                    <StyledInput
                      type="text"
                      placeholder="university.edu, company.com"
                      value={this.state.allowedDomains}
                      onChange={(e) => this.setState({ allowedDomains: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('create.allowed_domains.desc')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <StyledButton disabled={this.state.loading}>
            {t(parentLetter ? 'create.publish_update' : this.state.letterType === 'invite_only' ? 'create.publish_invite' : 'create.publish')}
          </StyledButton>
        </div>
      </form>
    );
  }
}

export default withIntl(LetterForm);
