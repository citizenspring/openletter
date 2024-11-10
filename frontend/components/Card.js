import { withIntl } from '../lib/i18n';
import Link from 'next/link';
import NumberFormat from 'react-number-format';
import moment from 'moment';
const Badge = ({ children }) => (
  <span className="inline-flex flex-nowrap items-center rounded-full border px-2.5 py-0.5 w-fit text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gray-900 text-white hover:bg-primary/80 ml-0 mr-1">
    {children}
  </span>
);

const Button = ({ children, variant }) => (
  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 underline-offset-4 hover:underline h-10 px-4 py-2 mt-4 text-blue-400">
    {children}
  </button>
);

const CardHeader = ({ children }) => <div className="flex flex-col space-y-1.5 p-6">{children}</div>;

function getEmoji(locale) {
  const emojis = {
    fr: '🇫🇷',
    nl: '🇳🇱',
    en: '🇬🇧',
    tr: '🇹🇷',
    ar: '🇸🇦',
  };
  return emojis[locale] || locale;
}
function Card({ t, letter }) {
  return (
    <div className="rounded-lg border shadow-sm dark:bg-gray-800 dark:text-white">
      <CardHeader>
        <div className="flex items-left flex-col">
          <span className="text-sm text-gray-500">{moment(letter.created_at).format('D MMMM YYYY')}</span>
          {letter.title && (
            <h3 className="text-xl font-bold">
              <Link href={`/${letter.slug}`}>{letter.title}</Link>
            </h3>
          )}
          <div className="flex align-middle mt-2">
            <Badge>
              <NumberFormat value={letter.total_signatures} displayType={'text'} thousandSeparator={true} />
              &nbsp;signatures
            </Badge>
            {letter.locales &&
              letter.locales.length > 2 &&
              letter.locales.split(',').map((locale) => (
                <div className="inline-flex items-center text-xs ml-1 py-0">
                  <Link href={`/${letter.slug}`} locale={locale}>
                    <a title={locale}>{getEmoji(locale)}</a>
                  </Link>
                </div>
              ))}
          </div>
        </div>
        <p className="text-sm text-gray-500"></p>
      </CardHeader>
      <div className="p-6 pt-0">
        <p className="text-gray-700 dark:text-white text-sm">{letter.text}...</p>
        <Link href={`/${letter.slug}`} className="text-sm">
          Read more
        </Link>
      </div>
    </div>
  );
}

export default withIntl(Card);
