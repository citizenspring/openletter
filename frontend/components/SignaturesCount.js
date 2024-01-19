import React, { useState } from 'react';
import { withIntl } from '../lib/i18n';
import NumberFormat from 'react-number-format';

const Verified = ({ children }) => (
  <div className="text-gray-900 mt-1 cursor-pointer dark:text-gray-500 text-xl">{children}</div>
);

const TooltipText = ({ children }) => <div className="text-gray-500 text-base">{children}</div>;
const InfoIcon = ({ src }) => <img className="h-3.5 ml-0 mr-1 mt-0" src={src} />;

const Tooltip = ({ label, tooltip, children }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div onClick={() => setVisible(!visible)} title={tooltip}>
      <span>{label || children}</span>
      {visible && (
        <div className="flex">
          <div textAlign="right">
            <InfoIcon src="/images/info-icon.png" />
          </div>
          <div>
            <TooltipText>{tooltip}</TooltipText>
          </div>
        </div>
      )}
    </div>
  );
};

export default withIntl(({ signatures, t, stats }) => {
  const signatures_stats = stats || {
    verified: 0,
    unverified: 0,
    total: 0,
  };

  if (signatures_stats.total == 0) {
    signatures.map((s) => {
      signatures_stats.total++;
      if (s.is_verified) {
        signatures_stats.verified++;
      } else {
        signatures_stats.unverified++;
      }
    });
  }

  return (
    <div>
      <div className="mx-1 mb-8">
        <div className="text-center md:text-left text-7xl">
          <NumberFormat value={signatures_stats.total} displayType={'text'} thousandSeparator={true} />
        </div>
        <div className="-mt-1 text-center md:text-left text-3xl md:text-4xl">signatures</div>
        <div className="text-center md:text-left">
          {signatures_stats.total != signatures_stats.verified && (
            <Verified>
              <Tooltip tooltip={t('letter.signatures.unverified.tooltip')}>
                <NumberFormat value={signatures_stats.verified} displayType={'text'} thousandSeparator={true} />
                {` ${t('letter.signatures.verified')}`}
              </Tooltip>
            </Verified>
          )}
        </div>
      </div>
    </div>
  );
});
