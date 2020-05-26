import { Flex, Box } from 'reflexbox/styled-components';
import styled from 'styled-components';
import { space } from 'styled-system';

const NotificationBox = styled.div`
  border-top: 4px solid black;
  border-bottom: 4px solid black;
  ${space}
`;

const H2 = styled.h2`
  margin: 0 0 8px 8px;
  font-size: 18pt;
`;

export default ({ icon, title, message }) => (
  <NotificationBox my={4} py={4}>
    <Box mx={2}>
      <Flex flexWrap="wrap" alignItems="center">
        <Box my={1}>
          <img src={`/images/${icon || 'openletter'}-icon.png`} width={64} />
        </Box>
        <Box>
          <H2>{title}</H2>
        </Box>
      </Flex>
      <Box>{message}</Box>
    </Box>
  </NotificationBox>
);
