import React from 'react';
import parser from 'accept-language-parser';

const locales = {};
locales.en = require('../public/locales/en.json');
locales.fr = require('../public/locales/fr.json');
locales.nl = require('../public/locales/nl.json');

const defaultLanguage = 'en';

// We make sure we fall back to defaultLanguage if some keys are missing from the locale
Object.keys(locales).forEach((locale) => {
  if (locale === defaultLanguage) return;
  Object.keys(locales[defaultLanguage]).forEach((key) => {
    locales[locale][key] = locales[locale][key] || locales[defaultLanguage][key];
  });
});

export const getLocaleFromHeaders = (headers) => {
  const language =
    parser.pick(['en', 'fr', 'nl'], headers && headers['accept-language'], { loose: true }) || defaultLanguage;
  const response = {
    locale: language,
    messages: locales[language],
  };
  return response;
};

export const IntlContext = React.createContext();

const t = (key, messages) => (messages && messages[key]) || `[no message for key '${key}']`;

export const withIntl = (ComposedComponent) =>
  class extends React.Component {
    render() {
      return (
        <IntlContext.Consumer>
          {(context) => (
            <ComposedComponent
              {...this.props}
              locale={context && context.locale}
              messages={context && context.messages}
              t={(key) => t(key, context && context.messages)}
            />
          )}
        </IntlContext.Consumer>
      );
    }
  };
