import { GraphQLClient, gql } from 'graphql-request';
import AbortController from 'abort-controller';
import useSWR from 'swr';
import NumberFormat from 'react-number-format';
import moment from 'moment';
import { withIntl } from '../lib/i18n';

const query = gql`
  query getCollectiveStats($collectiveSlug: String!) {
    Collective(slug: $collectiveSlug) {
      expenses(limit: 5) {
        id
        createdAt
        description
        amount
        status
      }
      members(role: "BACKER") {
        publicMessage
        member {
          slug
          imageUrl
          name
        }
      }
      currency
      stats {
        balance
        balanceWithBlockedFunds
        backers {
          all
        }
        totalAmountReceived
        totalAmountSpent
      }
    }
  }
`;

const getOpenCollectiveData = async (collectiveSlug) => {
  if (!collectiveSlug) throw new Error('Missing collectiveSlug');

  const slugParts = collectiveSlug.split('/');
  const slug = slugParts[slugParts.length - 1];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 3000);
  const graphQLClient = new GraphQLClient(process.env.OC_GRAPHQL_API, {
    signal: controller.signal,
  });
  const data = await graphQLClient.request(query, { collectiveSlug: slug });
  const result = {
    currency: data.Collective.currency,
    amount: `${data.Collective.stats.balance}`,
    stats: data.Collective.stats,
    backers: data.Collective.members,
    expenses: data.Collective.expenses,
  };
  return result;
};

function CollectiveBalance({ collectiveSlug, locale }) {
  console.log('>>> CollectiveData ', collectiveSlug, locale);
  const { data, error } = useSWR(collectiveSlug, getOpenCollectiveData);

  console.log('>>> error received', error);
  console.log('>>> data received', data);

  if (error) return 'An error has occurred.';
  if (!data) return <div className="text-center">Loading...</div>;

  let totalExpenses = 0;
  data.expenses.map((expense) => {
    totalExpenses += expense.amount;
  });

  totalExpenses = totalExpenses / 100;

  const firstExpense = data.expenses[0];
  const lastExpense = data.expenses[data.expenses.length - 1];
  const timeBetweenFirstAndLastExpenses = new Date(firstExpense.createdAt) - new Date(lastExpense.createdAt);
  const daysBetweenFirstAndLastExpenses = Math.ceil(timeBetweenFirstAndLastExpenses / (1000 * 60 * 60 * 24));
  const averageDailyExpenses = totalExpenses / daysBetweenFirstAndLastExpenses;
  const averageMonthlyExpenses = averageDailyExpenses * 30;

  return (
    <div className="text-center my-4">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 my-4 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Running this free service costs money</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <div className="text-gray-600 dark:text-gray-300 text-sm">Total Spent</div>
            <div className="text-2xl font-bold">{totalExpenses.toFixed(2)}€</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">over {daysBetweenFirstAndLastExpenses} days</div>
          </div>

          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <div className="text-gray-600 dark:text-gray-300 text-sm">Daily Average</div>
            <div className="text-2xl font-bold">{averageDailyExpenses.toFixed(2)}€</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">per day</div>
          </div>

          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <div className="text-gray-600 dark:text-gray-300 text-sm">Monthly Average</div>
            <div className="text-2xl font-bold">{averageMonthlyExpenses.toFixed(2)}€</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">per month</div>
          </div>
        </div>
      </div>
      <h2 className="text-xl mt-4 ml-4">Latest expenses</h2>
      <ul className="list-none m-3 text-left">
        {data.expenses.map((expense) => (
          <li
            key={expense.id}
            className="my-2 grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center px-4 py-2 rounded-md border border-gray-200 dark:border-gray-800"
          >
            <div className="mr-2 text-left">
              <a
                href={`https://opencollective.com/openletter/expenses/${expense.id}`}
                title="open expense on opencollective.com"
              >
                {expense.description}
              </a>
            </div>
            <div className="mr-2 text-right">
              €<NumberFormat value={expense.amount / 100} displayType={'text'} thousandSeparator={true} />
            </div>
            <div className=" w-16 text-center">
              <div className="w-fit inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                {expense.status === 'PAID' ? 'paid' : 'pending'}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <a href="https://opencollective.com/openletter/expenses" className="text-sm">
        View all expenses
      </a>
      <h2 className="text-xl mt-4 ml-4 text-center">Thank you to all our contributors 🙏</h2>
      <ul className="p-2 flex overflow-hidden flex-wrap justify-center list-none">
        {data.backers
          .filter((b) => b.member.name != 'Guest')
          .map((backer) => {
            return (
              <li key={backer.member.slug} className="mx-2">
                <a
                  href={`https://opencollective.com/${backer.member.slug}`}
                  title={backer.member.name}
                  className="display-inline-block"
                >
                  {/* <img
                  className="inline-block mr-2 h-10 w-10 rounded-full ring-2 ring-white"
                  src={backer.member.imageUrl}
                  alt={backer.member.name}
                /> */}
                  {backer.member.name}
                </a>
              </li>
            );
          })}
      </ul>{' '}
    </div>
  );
}

export default withIntl(CollectiveBalance);
