import React, { Component } from 'react';
import { Flex, Box } from 'reflexbox/styled-components';
import styled from 'styled-components';
import { withIntl } from '../lib/i18n';
import availableLocales from '../constants/locales';

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
  font-family: 'Baskerville', Serif;
  box-sizing: border-box;
  width: 100%;
  margin: 5px 0;
  @media (prefers-color-scheme: dark) {
    background: #111;
    color: white;
  }
`;

const StyledTextarea = styled.textarea`
  font-family: 'Baskerville', Serif;
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

const H2 = styled.h2``;

const ActionLink = styled.a`
  font-size: 14px;
  cursor: pointer;
  color: red;
  font-weight: bold;
  &:hover {
    color: darkred;
  }
`;

const Input = ({ type, name, placeholder, onChange, ...rest }) => (
  <StyledInput
    type={type || 'text'}
    id={name}
    placeholder={placeholder || name}
    onChange={(e) => onChange(name, e.target.value)}
    {...rest}
  />
);

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
    console.log('>>> props.parentLetter', props.parentLetter);
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
              <Flex justifyContent="space-between">
                <Box>
                  <select
                    className="dark:text-white dark:bg-black"
                    defaultValue={form.locale}
                    onChange={(e) => this.handleChange('locale', e.target.value, index)}
                  >
                    {Object.keys(availableLocales).map((l) => {
                      return (
                        <option key={l} value={l}>
                          {availableLocales[l]}
                        </option>
                      );
                    })}
                  </select>
                </Box>
                {index > 0 && !parentLetter && (
                  <Box>
                    <ActionLink onClick={() => this.removeLanguage(index)}>[{t('create.removeLanguage')} ⨯]</ActionLink>
                  </Box>
                )}
              </Flex>
            )}
            <Box my={1} width={1}>
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
            </Box>
            {index === 0 && (
              <Box my={1} width={1}>
                <StyledInput
                  type="url"
                  id="url"
                  placeholder={t('create.image')}
                  onChange={(e) => this.handleChange('image', e.target.value)}
                />
              </Box>
            )}
            <Box my={1} width={1}>
              <StyledTextarea
                name="text"
                onChange={(e) => this.handleChange('text', e.target.value, index)}
                required
                placeholder={t('create.text')}
              />
            </Box>
          </>
        ))}
        {!parentLetter && <ActionLink onClick={() => this.addLanguage()}>[{t('create.addLanguage')}]</ActionLink>}
        {!parentLetter && (
          <Box>
            <p className="mt-4">{t('create.admin_info.description')}</p>
            <StyledInput
              type="email"
              id="email"
              placeholder={t('create.email')}
              onChange={(e) => this.handleChange('email', e.target.value)}
            />
          </Box>
        )}
        <Box>
          <StyledButton disabled={this.state.loading}>
            {t(parentLetter ? 'create.publish_update' : 'create.publish')}
          </StyledButton>
        </Box>
      </form>
    );
  }
}

export default withIntl(LetterForm);
