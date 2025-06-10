'use strict';

/*
|--------------------------------------------------------------------------
| Http server
|--------------------------------------------------------------------------
|
| This file bootstrap Adonisjs to start the HTTP server. You are free to
| customize the process of booting the http server.
|
| """ Loading ace commands """
|     At times you may want to load ace commands when starting the HTTP server.
|     Same can be done by chaining `loadCommands()` method after
|
| """ Preloading files """
|     Also you can preload files by calling `preLoad('path/to/file')` method.
|     Make sure to pass relative path from the project root.
*/

const { Ignitor } = require('@adonisjs/ignitor');

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .fireHttpServer()
  .then(() => {
    // Log configuration after server starts
    const Url = require('url-parse');

    console.log('=== SERVER CONFIGURATION ===');

    console.log('Host', process.env.HOST);
    console.log('Port', process.env.PORT);

    // Database configuration
    const dbConnection = process.env.DB_CONNECTION || 'pg';
    console.log(`Database Connection: ${dbConnection}`);

    if (dbConnection === 'pg') {
      const DATABASE_URL = process.env.DATABASE_URL || '';
      if (DATABASE_URL) {
        const parsedUrl = new Url(DATABASE_URL);
        console.log(`Database Host: ${parsedUrl.hostname}:${parsedUrl.port || '5432'}`);
        console.log(`Database Name: ${parsedUrl.pathname.substr(1)}`);
        console.log(`Database User: ${parsedUrl.username}`);
      } else {
        console.log(`Database Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
        console.log(`Database Name: ${process.env.DB_DATABASE || 'adonis'}`);
        console.log(`Database User: ${process.env.DB_USER || 'root'}`);
      }
    } else if (dbConnection === 'mysql') {
      console.log(`Database Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`);
      console.log(`Database Name: ${process.env.DB_DATABASE || 'adonis'}`);
      console.log(`Database User: ${process.env.DB_USER || 'root'}`);
    }

    // SMTP configuration
    const mailConnection = process.env.MAIL_CONNECTION || 'smtp';
    console.log(`Mail Connection: ${mailConnection}`);

    if (mailConnection === 'smtp') {
      console.log(`SMTP Host: ${process.env.SMTP_HOST || 'not set'}:${process.env.SMTP_PORT || '2525'}`);
    } else if (mailConnection === 'mailgun') {
      console.log(`Mailgun Domain: ${process.env.MAILGUN_DOMAIN || 'not set'}`);
      console.log(`Mailgun Region: ${process.env.MAILGUN_API_REGION || 'EU'}`);
    }

    console.log('===============================');
  })
  .catch(console.error);
