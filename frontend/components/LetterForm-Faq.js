import Link from 'next/link';
import styled from 'styled-components';

const Q = styled.div`
  font-size: 12pt;
  font-weight: bold;
  margin-top: 14px;
`;

const A = styled.div`
  font-size: 11pt;
  color: #555;
`;

export default () => (
  <div>
    <h2>FAQ</h2>
    <Q>How to create an open letter?</Q>
    <A>We recommend you to start a google doc with one or two other people. It's a co-creation process! Once you are happy with it, copy paste it here, publish it and share the URL with your collaborators to be the first to sign it.</A>

    <Q>What for?</Q>
    <A>An open letter is a great way to ask something to your company, organization, institution, city, government. Make sure that it is signed by people that are relevant to what you are asking.</A>

    <Q>Can I limit who can sign it?</Q>
    <A>No. That's why we recommend you to carefully share it to the right people at the beginning, so that they will get the opportunity to be first people showing up as the co-signatories.</A>

  </div>
);