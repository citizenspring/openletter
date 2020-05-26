import Link from 'next/link';
import styled from 'styled-components';
import { withIntl } from '../lib/i18n';
import availableLocales from '../constants/locales';
import { useRouter } from 'next/router';
import { Select } from '@rebass/forms';

export default withIntl(({ t, slug, currentLocale, locales }) => {
  if (!locales || locales.length === 1) {
    return <div />;
  }

  const router = useRouter();
  const handleChange = (e) => {
    e.preventDefault();
    router.push('/[slug]/[locale]', `/${slug}/${e.target.value}`);
  };

  return (
    <div>
      <Select onChange={handleChange} width={[1, 1 / 2, 1 / 4]} fontSize={[2, 2, 1]} mb={3} color={'#555'}>
        {locales.map((l) => {
          const selected = l === currentLocale;
          return (
            <option value={l} selected={selected}>
              {availableLocales[l]}
            </option>
          );
        })}
      </Select>
    </div>
  );
});
