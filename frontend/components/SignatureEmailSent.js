import Link from 'next/link';
import { Flex, Box } from 'reflexbox/styled-components';
import styled from 'styled-components';
import { space } from 'styled-system';
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

export default withIntl(({ t }) => (
  <NotificationBox my={4} py={4}>
    <Box mx={1}>
      <Flex flexWrap="wrap" alignItems="center">
        <Box my={1}>
          <img src="/images/email-icon.png" width={64} />
        </Box>
        <Box>
          <H2>{t('notification.sent')}</H2>
        </Box>
      </Flex>
      <Box>{t('notification.sent.info')}</Box>
      <Box mt={3}>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('notification.sent.donate.note')}
        </p>
        <Link href="/donate">
          <a className="inline-block mt-2 text-center transition-all duration-200 text-white text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 py-2 px-4 rounded-lg shadow hover:shadow-md hover:text-white">
            {t('notification.signed.donate.button')}
          </a>
        </Link>
      </Box>
    </Box>
  </NotificationBox>
));
