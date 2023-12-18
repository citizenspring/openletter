import { withIntl } from '../lib/i18n';
import Link from 'next/link';
import moment from 'moment';
const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 w-fit text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gray-900 text-white hover:bg-primary/80">
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
  };
  return emojis[locale] || locale;
}

function Card({ t, letter }) {
  return (
    <div className="rounded-lg border shadow-sm dark:bg-gray-800 dark:text-white">
      <CardHeader>
        <div className="flex items-left flex-col">
          <h3 className="text-xl font-bold">{letter.title}</h3>
          <div className="flex align-middle mt-2">
            {letter.locales.split(',').map((locale) => (
              <div className="inline-flex items-center border w-fit text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent text-primary-foreground hover:bg-primary/80 mr-2 py-1 rounded-lg px-1">
                <Link href={`/${letter.slug}/${locale}`}>{getEmoji(locale)}</Link>
              </div>
            ))}
            <Badge>{letter.total_signatures} signatures</Badge>
          </div>
        </div>
        <p className="text-sm text-gray-500">{moment(letter.created_at).format('D MMMM YYYY')}</p>
        <p className="text-sm text-gray-500"></p>
      </CardHeader>
      <div className="p-6 pt-0">
        <p className="text-gray-700 dark:text-white text-sm">{letter.text}...</p>
      </div>
      <Button className="mt-4" variant="link">
        <Link href={`/${letter.slug}`}>Read more</Link>
      </Button>
    </div>
  );
}

export default withIntl(Card);