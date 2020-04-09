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
    <Q>What is an Open Letter?</Q>
    <A>It's a public letter that you write to address together your company, organization, institution, city, government.</A>

    <Q>What's the difference with a petition?</Q>
    <A>The goal of a petition is to have as many people as possible to sign it. The goal of an open letter is to have people relevant to topic to sign it. It's not the same to have a petition to ask our government to make wearing a mask mandatory than having an open letter signed by 100 doctors, or a petition to ask Google to stop supporting the fossil fuel industry than an open letter signed by a 1000 of their employees. There is no author to an open letter, only co-signatories. No email address is collected. Who wrote it doesn't matter. Who signed it does.</A>

    <Q>Why do I need to provide an email address to sign a letter?</Q>
    <A>To avoid abuse. We want to make sure that each signature is linked to an actual email address. We don't record your email in our database.</A>

    <Q>What about privacy?</Q>
    <A>We only ask for your email address to confirm your signature (see question above). We don't record it in our database. We have no cookies, no trackers.</A>

    <Q>Can I limit who can sign it?</Q>
    <A>No. That's why we recommend you to carefully share it to the right people at the beginning, so that they will get the opportunity to be first people showing up as the signatories.</A>

    <Q>How to provide feedback or request a feature?</Q>
    <A><a href="https://opencollective.com/openletter/conversations">Start a conversation on our collective.</a></A>

    <Q>Are you open source?</Q>
    <A>Yes but our repo is private. We will give access to all our backers. Once we raise €10,000 from the community, we will make the github repo public. <a href="https://opencollective.com/openletter">Make a donation</a>.</A>
  </div>
);