import { Flex, Box } from 'reflexbox/styled-components'
import styled from 'styled-components'
import { space } from 'styled-system'

const NotificationBox = styled.div`
  border-top: 4px solid black;
  border-bottom: 4px solid black;
  ${space}
`;

const H2 = styled.h2`
  margin: 0 0 8px 8px;
  font-size: 18pt;
`;

export default () => (
  <NotificationBox my={4} py={4}>
    <Box mx={1}>

      <Flex flexWrap='wrap' alignItems='center'>
        <Box my={1}>
          <img src="/images/email-icon.png" width={64} />
        </Box>
        <Box>
          <H2>Almost done!</H2>
        </Box>
      </Flex>
      <Box>
        Just click on the link in the email that we sent you to confirm your signature.
      </Box>
    </Box>
  </NotificationBox>
)