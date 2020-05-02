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

   return (
     <ol>
      {signatures.map((signature, i) => (
        <li key={i}>
          {printSignature(signature)}
        </li>
      ))}
     </ol>
   )
});