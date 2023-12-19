require('dotenv').config();
module.exports = {
  env: {
    // You can also use process.env.API_URL if it is defined in your .env file
    API_URL: process.env.API_URL || 'https://openletter-earth.herokuapp.com',
  },
  async redirects() {
    return [
      // Redirect /$slug/$locale to /$locale/$slug
      {
        source: '/:slug/:locale(\\w{2})',
        destination: '/:locale/:slug',
        permanent: false,
      },
    ];
  },
  i18n: {
    // These are all the locales you want to support in
    // your application
    locales: ['en', 'fr', 'nl', 'tr', 'ar'],
    // This is the default locale you want to be used when visiting
    // a non-locale prefixed path e.g. `/hello`
    defaultLocale: 'en',
    // This is a list of locale domains and the default locale they
    // should handle (these are only required when setting up domain routing)
    // Note: subdomains must be included in the domain value to be matched e.g. "fr.example.com".
  },
};
