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
    await this.props.onSubmit(this.state.form);

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
              placeholder={t('create.email')}
              onChange={(e) => this.handleChange('email', e.target.value)}
            />
          </div>
        )}
        <div>
          <StyledButton disabled={this.state.loading}>
            {t(parentLetter ? 'create.publish_update' : 'create.publish')}
          </StyledButton>
        </div>
      </form>
    );
  }
}

export default withIntl(LetterForm);
