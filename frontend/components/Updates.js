import { withIntl } from '../lib/i18n';
import moment from 'moment';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { replaceURLsWithMarkdownAnchors } from '../lib/utils';

const Text = ({ children }) => <div className=" font-sans max-w-2xl dark:text-gray-300">{children}</div>;

export default withIntl(({ t, updates }) => {
  if (!updates || updates.length === 0) {
    return <div />;
  }

  return (
    <>
      {updates.map((update, i) => (
        <div className="my-8" id={`update${i + 1}`} key={`update${i + 1}`}>
          <strong>
            {t('letter.update')} {moment(update.created_at).format('DD MMMM YYYY')}
          </strong>
          <h2 className="mt-0 text-3xl">{update.title}</h2>
          <div className="max-w-fit">
            <Text>
              <ReactMarkdown plugins={[gfm]} allowDangerousHtml={true}>
                {replaceURLsWithMarkdownAnchors(update.text.replace(/<br ?\/> ?/g, '\n'))}
              </ReactMarkdown>
            </Text>
          </div>
        </div>
      ))}
    </>
  );
});
