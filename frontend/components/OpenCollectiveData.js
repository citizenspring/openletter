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

  return (
    <div className="text-center my-4">
      <h2>Thank you to all our contributors 🙏</h2>
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
      <h2 className="text-xl mt-4 ml-4 text-left">Expense tracker</h2>
      <ul className="list-none m-3">
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
    </div>
  );
}

export default withIntl(CollectiveBalance);
