import React, { useState } from 'react';
import { withIntl } from '../lib/i18n';
import styled from 'styled-components';
import { typography, space } from 'styled-system';
import { Flex, Box } from 'rebass';
import NumberFormat from 'react-number-format';

const Verified = styled.span`
  color: #444;
  cursor: pointer;
  font-size: 12pt;
  @media (prefers-color-scheme: dark) {
    color: #888;
  }
`;

const TooltipText = styled.div`
  color: #666;
  font-size: 11pt;
`;
const InfoIcon = styled.img`
  height: 14px;
  margin-left: 0px;
  margin-right: 3px;
  margin-top: 0px;
`;

const BigNumber = styled.div`
  font-size: 64pt;
  ${typography}
`;

// BigNumber.defaultProps = {
//   fontSize: '64pt'
// };

const BigNumberLabel = styled.div`
  font-size: 32pt;
  margin-top: -14px;
  ${space}
  ${typography}
`;

const Tooltip = ({ label, tooltip, children }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div onClick={() => setVisible(!visible)} title={tooltip}>
      <span>{label || children}</span>
      {visible && (
        <Flex>
          <div textAlign="right">
            <InfoIcon src="/images/info-icon.png" />
          </div>
          <div>
            <TooltipText>{tooltip}</TooltipText>
          </div>
        </Flex>
      )}
    </div>
  );
};

export default withIntl(({ signatures, t }) => {
  const stats = {
    signatures: {
      verified: 0,
      unverified: 0,
      total: 0,
    },
  };

  signatures.map((s) => {
    stats.signatures.total++;
    if (s.is_verified) {
      stats.signatures.verified++;
    } else {
      stats.signatures.unverified++;
    }
  });

  return (
    <div>
      <Box mx={1}>
        <BigNumber fontSize={[2, 3, 4]}>
          <NumberFormat value={stats.signatures.total} displayType={'text'} thousandSeparator={true} />
        </BigNumber>
        <BigNumberLabel fontSize={[1, 2, 3]} mt={[-1, -2, -3]}>
          signatures
        </BigNumberLabel>
        <Box>
          {stats.signatures.total != stats.signatures.verified && (
            <Verified>
              <Tooltip tooltip={t('letter.signatures.unverified.tooltip')}>
                <NumberFormat value={stats.signatures.verified} displayType={'text'} thousandSeparator={true} />
                {` ${t('letter.signatures.verified')}`}
              </Tooltip>
            </Verified>
          )}
        </Box>
      </Box>
    </div>
  );
});
