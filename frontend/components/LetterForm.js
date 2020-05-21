import React, { Component } from 'react';
import { Flex, Box } from 'reflexbox/styled-components'
import styled from 'styled-components'
import { withIntl } from "../lib/i18n";
import availableLocales from '../constants/locales';

const TitleInput = styled.input`
  border: 1px dotted grey;
  font-size: 24pt;
  border-radius: 5px;
  padding: 10px;
  font-family: "Baskerville", Serif;
  box-sizing: border-box;
  width: 100%;
`;

const StyledInput = styled.input`
  border: 1px dotted grey;
  font-size: 14pt;
  border-radius: 5px;
  padding: 10px;
  font-family: "Baskerville", Serif;
  box-sizing: border-box;
  width: 100%;
  margin: 5px 0;
`;

const StyledTextarea = styled.textarea`
  font-family: "Baskerville", Serif;
  border: 1px dotted grey;
  font-size: 14pt;
  border-radius: 5px;
  padding: 10px;
  box-sizing: border-box;
  width: 100%;
  height: 600px;
`;

const StyledButton = styled.button`
  margin-top: 30px;
  font-size: 12pt;
  font-family: "Arial";
  background: #111;
  color: white;
  padding: 10px;
  border-radius: 5px;
  box-sizing: border-box;
`;

const H2 = styled.h2`

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


const Input = ({ type, name, placeholder, onChange, ...rest }) => (
  <StyledInput type={type || 'text'} id={name} placeholder={placeholder || name} onChange={e => onChange(name, e.target.value)} {...rest} />
);

class LetterForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      form: [
        {
          locale: props.locale,
          title: null,
          text: null
        }
      ]
    }

    // If we pass the list of locales (when posting an update)
    console.log(">>> props.parentLetter", props.parentLetter)
    if (props.parentLetter) {
      this.state.form = [];
      props.parentLetter.locales.map(locale => {
        this.state.form.push({ locale, title: null, text: null });
      })
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

  handleSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(this.state.form);
    return false;
  }

  addLanguage() {
    const { form } = this.state;
    form.push({
      locale: null,
      title: null,
      text: null
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
            {this.state.form.length > 1 &&
              <Flex justifyContent="space-between">
                <Box>
                  <select onChange={(e) => this.handleChange('locale', e.target.value, index)}>
                    {Object.keys(availableLocales).map(l => {
                      const selected = (form.locale === l);
                      return (
                        <option value={l} selected={selected}>{availableLocales[l]}</option>
                      );
                    }
                    )}
                  </select>
                </Box>
                {index > 0 && !parentLetter &&
                  <Box>
                    <ActionLink onClick={() => this.removeLanguage(index)}>[{t('create.removeLanguage')} ⨯]</ActionLink>
                  </Box>
                }
              </Flex>
            }
            <Box my={1} width={1}>
              <TitleInput type="text" id="title" placeholder={t("create.title")} value={form.title} onChange={e => this.handleChange('title', e.target.value, index)} ref={(input) => { this.firstTitleInput = this.firstTitleInput || input; }} />
            </Box>
            <Box my={1} width={1}>
              <StyledTextarea name="text" onChange={e => this.handleChange('text', e.target.value, index)} required />
            </Box>
          </>
        ))}
        {!parentLetter &&
          <ActionLink onClick={() => this.addLanguage()}>[{t('create.addLanguage')}]</ActionLink>
        }
        {!parentLetter &&
          <Box>
            <p>{t('create.admin_info.description')}</p>
            <StyledInput type="email" id="email" placeholder={t("create.email")} onChange={e => this.handleChange('email', e.target.value)} />
          </Box>
        }
        <Box>
          <StyledButton>{t(parentLetter ? "create.publish_update" : "create.publish")}</StyledButton>
        </Box>
      </form>
    );
  }
}

export default withIntl(LetterForm);