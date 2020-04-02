import App from 'next/app'
import React from 'react'
import { ThemeProvider, createGlobalStyle } from 'styled-components'

const theme = {
  colors: {
    primary: 'black',
  },
  fontSizes: ['12pt', '16pt', '24pt', '32pt', '48pt','64pt']
}

export const GlobalStyle = createGlobalStyle`
  body {
    font-family: Baskerville;
    font-size: 14pt;
    line-height: 1.5;
  }
`;

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Component {...pageProps} />
      </ThemeProvider>
    )
  }
}