'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class LettersFeaturedAtSchema extends Schema {
  up() {
    this.table('letters', (table) => {
      // alter table
      table.date('featured_at');
      table.index(['featured_at', 'locale']);
    });
  }

  down() {
    this.table('letters', (table) => {
      // reverse alternations
      this.dropIndex(['featured_at', 'locale']);
      this.dropColumn('featured_at');
    });
  }
}

module.exports = LettersFeaturedAtSchema;
