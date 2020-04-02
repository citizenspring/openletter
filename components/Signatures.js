import React from 'react';
import { Flex, Box } from 'reflexbox/styled-components'
import styled from 'styled-components'
import { render } from 'react-dom';

const SignatureInput = styled.input`
  border: 1px dotted grey;
  font-size: 24pt;
  border-radius: 5px;
  padding: 10px;
  font-family: "SignPainter";
  margin: 5px;
  box-sizing: border-box;
  width: 100%;
`;

const StyledInput = styled.input`
  border: 1px dotted grey;
  font-size: 12pt;
  border-radius: 5px;
  padding: 10px;
  font-family: "Arial";
  margin: 5px;
  box-sizing: border-box;
  width: 100%;
`;

const StyledButton = styled.button`
  font-size: 12pt;
  font-family: "Arial";
  background: #111;
  color: white;
  padding: 10px;
  margin: 5px;
  border-radius: 5px;
  box-sizing: border-box;
  width: 100%;
`;

export default ({signatures}) => {
  
  if (!signatures || signatures.length === 0) {
    return (<div>Be the first to sign this letter</div>)
  }

   return (
     <ol>
      {signatures.map((signature, i) => (
        <li key={i}>
        {signature.name}, {signature.occupation}, {signature.city}
        </li>
      ))}
     </ol>
   )
}