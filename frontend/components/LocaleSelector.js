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
    router.push('/[slug]', `/${slug}`, { locale: e.target.value });
  };

  return (
    <div>
      <Select
        defaultValue={currentLocale}
        onChange={handleChange}
        width={[1, 1 / 2, 1 / 4]}
        fontSize={[2, 2, 1]}
        mb={3}
        color={'#555'}
      >
        {locales.map((l) => {
          return (
            <option key={l} value={l}>
              {availableLocales[l]}
            </option>
          );
        })}
      </Select>
    </div>
  );
});
