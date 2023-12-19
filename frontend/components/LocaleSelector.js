import { withIntl } from '../lib/i18n';
import availableLocales from '../constants/locales';
import { useRouter } from 'next/router';

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
      <select
        className="bg-white w-full md:w-fit  border-gray-200 my-2 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-700 p-2 rounded-lg border-white border"
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
      </select>
    </div>
  );
});
