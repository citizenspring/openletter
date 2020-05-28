import styled from 'styled-components';
import { Box } from 'reflexbox/styled-components';
import { withIntl } from '../lib/i18n';
import moment from 'moment';

const H2 = styled.h2`
  margin-top: 0px;
`;

const Text = styled.div`
  max-width: 80ex;
`;

export default withIntl(({ t, updates }) => {
  if (!updates || updates.length === 0) {
    return <div />;
  }

  return (
    <>
      {updates.map((update, i) => (
        <Box my={5} id={`update${i + 1}`}>
          <strong>
            {t('letter.update')} {moment(update.created_at).format('DD MMMM YYYY')}
          </strong>
          <H2>{update.title}</H2>
          <Text dangerouslySetInnerHTML={{ __html: update.text }} />
        </Box>
      ))}
    </>
  );
});
