import React, { useState } from 'react';
import { withIntl } from '../lib/i18n';
import styled from 'styled-components';
import { Flex, Box } from 'rebass';

const Unverified = styled.span`
  color: #888;
  cursor: pointer;
`;

const TooltipText = styled.div`
  color: #666;
  font-size: 11pt;
`;
const InfoIcon = styled.img`
  height: 14px;
  margin-left: -30px;
  margin-right: 3px;
  text-align: right;
`;

const Tooltip = ({ label, tooltip }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div onClick={() => setVisible(!visible)} title={tooltip}>
      <span>{label}</span>
      {visible && (
        <Flex>
          <Box textAlign="right">
            <InfoIcon src="/images/info-icon.png" />
          </Box>
          <Box>
            <TooltipText>{tooltip}</TooltipText>
          </Box>
        </Flex>
      )}
    </div>
  );
};

export default withIntl(({ start, signatures, t }) => {
  if (!signatures || signatures.length === 0) {
    return <div>{t('signatures.first')}</div>;
  }

  const printSignature = (signature) => {
    const fields = ['name', 'occupation', 'organization', 'city'];
    const res = [];
    fields.map((field) => {
      if (signature[field]) {
        res.push(signature[field].trim());
      }
    });
    const str = res.join(', ');
    return signature.is_verified ? (
      str
    ) : (
      <Unverified>
        <Tooltip label={str} tooltip={t('signature.unverified.tooltip')} />
      </Unverified>
    );
  };

  // we first copy the array otherwise we keep on reversing the array multiple times
  const sortedSignatures = signatures.filter((s) => s.is_verified).slice();

  return (
    <ol start={start || 1} className="dark:text-gray-300 list-decimal list-outside pl-10">
      {sortedSignatures.map((signature, i) => (
        <li key={`signature-${(start || 1) + i}`}>{printSignature(signature)}</li>
      ))}
    </ol>
  );
});
