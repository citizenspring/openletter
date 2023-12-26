import { Box } from 'reflexbox/styled-components';
import { withIntl } from '../lib/i18n';
import moment from 'moment';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { replaceURLsWithMarkdownAnchors } from '../lib/utils';

export default withIntl(({ t, updates }) => {
  if (!updates || updates.length === 0) {
    return <div />;
  }

  return (
    <>
      {updates.map((update, i) => (
        <Box my={5} id={`update${i + 1}`} key={`update${i + 1}`}>
          <strong>
            {t('letter.update')} {moment(update.created_at).format('DD MMMM YYYY')}
          </strong>
          <h2 className="mt-0 text-3xl">{update.title}</h2>
          <div className="max-w-fit">
            <ReactMarkdown plugins={[gfm]} allowDangerousHtml={true}>
              {replaceURLsWithMarkdownAnchors(update.text.replace(/<br ?\/> ?/g, '\n'))}
            </ReactMarkdown>
          </div>
        </Box>
      ))}
    </>
  );
});
