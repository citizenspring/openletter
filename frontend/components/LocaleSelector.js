import Link from 'next/link';
import styled from 'styled-components';
import { withIntl } from '../lib/i18n';
import availableLocales from '../constants/locales';
import { useRouter } from 'next/router'

const StyledSelect = styled.select`
@media screen and (max-width: 767px) {
  input, select, textarea {
    font-size: 16px;
  }
}
`;

export default withIntl(({ t, slug, currentLocale, locales }) => {
  if (!locales || locales.length === 1) {
    return <div />;
  }

  const router = useRouter();
  const handleChange = e => {
    e.preventDefault();
    router.push('/[slug]/[locale]', `/${slug}/${e.target.value}`);
  }

  return (
    <div>
      <StyledSelect onChange={handleChange}>
        {locales.map(l => {
          const selected = (l === currentLocale);
          return (
            <option value={l} selected={selected}>{availableLocales[l]}</option>
          );
        }
        )}
      </StyledSelect>
    </div>
  );
}
);