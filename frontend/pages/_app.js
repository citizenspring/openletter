import App from 'next/app';
import React from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { IntlContext, getMessagesForLocale } from '../lib/i18n';
import '../styles/tailwind.css';
import { useRouter } from 'next/router';

const theme = {
  fontSizes: ['12pt', '16pt', '24pt', '32pt', '48pt', '64pt'],
};

export const GlobalStyle = createGlobalStyle`

  @font-face {
    font-family: "Baskerville";
    src: url("fonts/Baskerville.eot"); /* IE9*/
    src: url("fonts/Baskerville.eot?#iefix") format("embedded-opentype"), /* IE6-IE8 */
    url("fonts/Baskerville.woff") format("woff"), /* chrome、firefox */
    url("fonts/Baskerville.ttf") format("truetype"), /* chrome、firefox、opera、Safari, Android, iOS 4.2+*/
    url("fonts/Baskerville.svg#Baskerville") format("svg"); /* iOS 4.1- */
  }

  @font-face {
    font-family: "SignPainter";
    src: url("fonts/SignPainter.eot"); /* IE9*/
    src: url("fonts/SignPainter.eot?#iefix") format("embedded-opentype"), /* IE6-IE8 */
    url("fonts/SignPainter.woff") format("woff"), /* chrome、firefox */
    url("fonts/SignPainter.ttf") format("truetype"), /* chrome、firefox、opera、Safari, Android, iOS 4.2+*/
    url("fonts/SignPainter.svg#SignPainter") format("svg"); /* iOS 4.1- */
  }

  body .letter {
    font-family: Baskerville;
    font-size: 14pt;
    line-height: 1.5;
  }
`;

const GIT_SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.GIT_SHA || 'unknown';
const GIT_MSG = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE || process.env.GIT_MSG || '';

function DevBanner() {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setVisible(params.get('devmode') === 'true');
    document.body.style.paddingTop = params.get('devmode') === 'true' ? '36px' : '';
  }, []);

  if (!visible) return null;

  const sha = GIT_SHA.slice(0, 8);
  return (
    <div
      style={{
        background: '#ff6b6b',
        color: '#fff',
        textAlign: 'center',
        padding: '6px 12px',
        fontSize: '13px',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    >
      🔧 devmode: {sha} {GIT_MSG && `— ${GIT_MSG}`}
    </div>
  );
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const locale = router.locale;
  const messages = getMessagesForLocale(locale);
  return (
    <IntlContext.Provider value={{ locale, messages }}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <DevBanner />
        <Component {...pageProps} />
      </ThemeProvider>
    </IntlContext.Provider>
  );
}

export default MyApp;
