import React, { Component } from 'react';
import { withIntl } from '../lib/i18n';
import availableLocales from '../constants/locales.json';

const DRAFT_KEY = 'openletter_draft';

class LetterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      showPreview: false,
      letterType: 'public',
      restrictionMode: 'invite',
      allowedDomains: '',
      invitesPerPerson: 5,
      allowChainInvites: false,
      form: [
        {
          locale: props.locale || 'en',
          title: '',
          text: '',
          image: '',
          email: '',
        },
      ],
    };

    if (props.parentLetter) {
      this.state.form = props.parentLetter.locales.map((locale) => ({
        locale,
        title: '',
        text: '',
      }));
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.saveDraft = this.saveDraft.bind(this);
  }

  componentDidMount() {
    // Restore draft from localStorage
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.form && draft.form[0]?.title) {
          this.setState({
            form: draft.form,
            letterType: draft.letterType || 'public',
            restrictionMode: draft.restrictionMode || 'invite',
            allowedDomains: draft.allowedDomains || '',
            invitesPerPerson: draft.invitesPerPerson || 5,
            allowChainInvites: draft.allowChainInvites || false,
          });
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
    if (this.firstTitleInput) this.firstTitleInput.focus();
  }

  saveDraft() {
    try {
      const { form, letterType, restrictionMode, allowedDomains, invitesPerPerson, allowChainInvites } = this.state;
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        form, letterType, restrictionMode, allowedDomains, invitesPerPerson, allowChainInvites,
        savedAt: new Date().toISOString(),
      }));
    } catch (e) {
      // Storage full or unavailable
    }
  }

  static clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
  }

  handleChange(fieldname, value, index) {
    const { form } = this.state;
    form[index || 0] = form[index || 0] || {};
    form[index || 0][fieldname] = value;
    this.setState({ form }, this.saveDraft);
  }

  async handleSubmit(event) {
    this.setState({ loading: true });
    event.preventDefault();

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

    setTimeout(() => {
      this.setState({ loading: false });
    }, 2000);
    return false;
  }

  addLanguage() {
    const { form } = this.state;
    form.push({ locale: 'en', title: '', text: '' });
    this.setState({ form }, this.saveDraft);
  }

  removeLanguage(index) {
    const { form } = this.state;
    form.splice(index, 1);
    this.setState({ form }, this.saveDraft);
  }

  renderPreview() {
    const form = this.state.form[0] || {};
    const text = (form.text || '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br/>');

    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <div className="text-xs text-gray-400 mb-4 uppercase tracking-wide">{this.props.t('create.preview.label')}</div>
        {form.image && (
          <div className="mb-4">
            <img src={form.image} className="w-full rounded-lg max-h-64 object-cover" alt="" onError={(e) => e.target.style.display = 'none'} />
          </div>
        )}
        <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Baskerville', 'Georgia', serif" }}>
          {form.title || <span className="text-gray-300 dark:text-gray-600">{this.props.t('create.title')}</span>}
        </h2>
        <div
          className="prose dark:prose-invert max-w-none text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: text || `<span class="text-gray-300">${this.props.t('create.preview.empty')}</span>` }}
        />
      </div>
    );
  }

  render() {
    const { parentLetter, t } = this.props;
    const { showPreview } = this.state;

    return (
      <form onSubmit={this.handleSubmit} className="space-y-4">
        {this.state.form.map((form, index) => (
          <div key={index}>
            {/* Language selector */}
            <div className="flex justify-between items-center mb-2">
              <select
                className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 dark:bg-gray-900 dark:text-white"
                defaultValue={form.locale}
                onChange={(e) => this.handleChange('locale', e.target.value, index)}
              >
                {Object.keys(availableLocales).map((l) => (
                  <option key={l} value={l}>
                    {availableLocales[l].emoji} {availableLocales[l].name}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-3">
                {index > 0 && !parentLetter && (
                  <button type="button" onClick={() => this.removeLanguage(index)} className="text-sm text-red-500 hover:text-red-700 font-medium">
                    {t('create.removeLanguage')} ✕
                  </button>
                )}
              </div>
            </div>

            {/* Title */}
            <input
              type="text"
              placeholder={t('create.title')}
              value={form.title || ''}
              onChange={(e) => this.handleChange('title', e.target.value, index)}
              ref={(input) => { this.firstTitleInput = this.firstTitleInput || input; }}
              className="w-full text-2xl font-bold py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:outline-none dark:bg-gray-900 dark:text-white"
              style={{ fontFamily: "'Baskerville', 'Georgia', serif" }}
            />

            {/* Image URL */}
            {index === 0 && (
              <input
                type="url"
                placeholder={t('create.image')}
                value={form.image || ''}
                onChange={(e) => this.handleChange('image', e.target.value)}
                className="w-full py-2 px-4 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:outline-none dark:bg-gray-900 dark:text-white mt-3"
              />
            )}

            {/* Body */}
            <textarea
              placeholder={t('create.text')}
              value={form.text || ''}
              onChange={(e) => this.handleChange('text', e.target.value, index)}
              required
              className="w-full py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl text-base leading-relaxed focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:outline-none dark:bg-gray-900 dark:text-white mt-3"
              style={{ minHeight: '400px', resize: 'vertical' }}
            />
          </div>
        ))}

        {/* Add language */}
        {!parentLetter && (
          <button type="button" onClick={() => this.addLanguage()} className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white font-medium">
            + {t('create.addLanguage')}
          </button>
        )}

        {/* Preview toggle */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => this.setState({ showPreview: !showPreview })}
            className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:hover:text-white underline"
          >
            {showPreview ? t('create.preview.hide') : t('create.preview.show')}
          </button>
        </div>

        {/* Preview */}
        {showPreview && this.renderPreview()}

        {/* Email */}
        {!parentLetter && (
          <div className="pt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('create.admin_info.description')}</p>
            <input
              type="email"
              required
              placeholder={t('create.email')}
              value={this.state.form[0]?.email || ''}
              onChange={(e) => this.handleChange('email', e.target.value)}
              className="w-full py-2 px-4 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:outline-none dark:bg-gray-900 dark:text-white"
            />
          </div>
        )}

        {/* Who can sign */}
        {!parentLetter && (
          <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl mt-2">
            <h3 className="text-base font-semibold mb-1">{t('create.signing.title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('create.signing.subtitle')}</p>

            {/* Open to everyone */}
            <button
              type="button"
              onClick={() => this.setState({ letterType: 'public', restrictionMode: 'invite' }, this.saveDraft)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left mb-3 ${
                this.state.letterType === 'public'
                  ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800 shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">✅</span>
                <div>
                  <div className="font-semibold">{t('create.signing.open')}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('create.signing.open.desc')}</div>
                </div>
              </div>
            </button>

            {/* Restricted — two columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Personal invitations */}
              <button
                type="button"
                onClick={() => this.setState({ letterType: 'invite_only', restrictionMode: 'invite' }, this.saveDraft)}
                className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col ${
                  this.state.letterType === 'invite_only' && this.state.restrictionMode === 'invite'
                    ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-lg mb-1">🔗</div>
                <div className="font-semibold text-sm">{t('create.signing.invite')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('create.signing.invite.desc')}</div>
                <div className="mt-auto pt-2 text-xs text-gray-400">€10</div>
              </button>

              {/* Option B: Email domain */}
              <button
                type="button"
                onClick={() => this.setState({ letterType: 'invite_only', restrictionMode: 'domain' }, this.saveDraft)}
                className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col ${
                  this.state.letterType === 'invite_only' && this.state.restrictionMode === 'domain'
                    ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-lg mb-1">🏛️</div>
                <div className="font-semibold text-sm">{t('create.signing.domain')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('create.signing.domain.desc')}</div>
                <div className="mt-auto pt-2 text-xs text-gray-400">€10</div>
              </button>
            </div>

            {/* Settings for personal invitations */}
            {this.state.letterType === 'invite_only' && this.state.restrictionMode === 'invite' && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium whitespace-nowrap">{t('create.invites_per_person')}</label>
                  <input type="number" min="1" max="100" value={this.state.invitesPerPerson}
                    onChange={(e) => this.setState({ invitesPerPerson: parseInt(e.target.value) || 5 }, this.saveDraft)}
                    className="w-20 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm dark:bg-black" />
                </div>
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={this.state.allowChainInvites}
                    onChange={(e) => this.setState({ allowChainInvites: e.target.checked }, this.saveDraft)}
                    className="mt-0.5" />
                  <div>
                    <span className="font-medium">{t('create.allow_chain_invites')}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('create.allow_chain_invites.desc')}</p>
                  </div>
                </label>
              </div>
            )}

            {/* Settings for email domain restriction */}
            {this.state.letterType === 'invite_only' && this.state.restrictionMode === 'domain' && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <label className="text-sm font-medium block mb-2">{t('create.allowed_domains')}</label>
                <input type="text" placeholder="university.edu, company.com" value={this.state.allowedDomains}
                  onChange={(e) => this.setState({ allowedDomains: e.target.value }, this.saveDraft)}
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-black dark:text-white" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('create.allowed_domains.desc')}</p>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={this.state.loading}
          className="w-full py-3 px-6 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-semibold text-base hover:opacity-90 disabled:opacity-50 transition-opacity mt-4"
        >
          {this.state.loading
            ? '...'
            : t(parentLetter ? 'create.publish_update' : this.state.letterType === 'invite_only' ? 'create.publish_invite' : 'create.publish')}
        </button>
      </form>
    );
  }
}

export { DRAFT_KEY };
export default withIntl(LetterForm);
