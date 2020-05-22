import React from 'react';
import { withIntl } from '../lib/i18n';

export default withIntl(({signatures, t}) => {

  if (!signatures || signatures.length === 0) {
    return (<div>{t('signatures.first')}</div>)
  }

  const printSignature = (signature) => {
    const fields = ['name', 'occupation', 'organization', 'city'];
    const res = [];
    fields.map(field => {
      if (signature[field]) {
        res.push(signature[field].trim());
      }
    })
    return res.join(', ');
  }

  // we first copy the array otherwise we keep on reversing the array multiple times
  const sortedSignatures= signatures.slice().reverse();

  return (
     <ol reversed>
      {sortedSignatures.map((signature, i) => (
        <li key={`signature-${i}`}>
          {printSignature(signature)}
        </li>
      ))}
     </ol>
   )
});