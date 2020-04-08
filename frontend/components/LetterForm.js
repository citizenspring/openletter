import React, { Component } from 'react';
import { Flex, Box } from 'reflexbox/styled-components'
import styled from 'styled-components'

const TitleInput = styled.input`
  border: 1px dotted grey;
  font-size: 24pt;
  border-radius: 5px;
  padding: 10px;
  font-family: "Baskerville", Serif;
  box-sizing: border-box;
  width: 100%;
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
  font-size: 12pt;
  font-family: "Arial";
  background: #111;
  color: white;
  padding: 10px;
  border-radius: 5px;
  box-sizing: border-box;
`;

const Input = ({ type, name, placeholder, onChange, ...rest }) => (
  <StyledInput type={type || 'text'} id={name} placeholder={placeholder || name} onChange={e => onChange(name, e.target.value)} {...rest} />
);

export default class SignatureForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      form: {
        title: null,
        text: null,
      }
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(fieldname, value) {
    const { form } = this.state;
    form[fieldname] = value;
    this.setState({ form });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(this.state.form);
    return false;
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <Box my={1} width={1}>
          <TitleInput type="text" id="title" placeholder="Title" onChange={e => this.handleChange('title', e.target.value)} />
        </Box>
        <Box my={1} width={1}>
          <StyledTextarea name="text" onChange={e => this.handleChange('text', e.target.value)} required />
        </Box>
        <StyledButton>Publish this Open Letter</StyledButton>
      </form>
    );
  }
}