import { Flex, Box } from 'reflexbox/styled-components'
import styled from 'styled-components'
import { space } from 'styled-system'
import { withIntl } from '../lib/i18n';

const NotificationBox = styled.div`
  border-top: 4px solid black;
  border-bottom: 4px solid black;
  ${space}
`;

const H2 = styled.h2`
  margin: 0 0 8px 8px;
  font-size: 18pt;
`;

export default withIntl(({t}) => (
  <NotificationBox my={4} py={4}>
    <Box mx={1}>

      <Flex flexWrap='wrap' alignItems='center'>
        <Box my={1}>
          <img src="/images/email-icon.png" width={64} />
        </Box>
        <Box>
          <H2>{t('notification.sent')}</H2>
        </Box>
      </Flex>
      <Box>
      {t('notification.sent.info')}
      </Box>
    </Box>
  </NotificationBox>
));