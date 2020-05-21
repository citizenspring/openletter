'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LettersSchema extends Schema {
  up () {
    this.table('letters', (table) => {
      // alter table
      table.string('locale', 5).defaultTo('en');
      table.dropUnique('slug');
      table.unique(['slug', 'locale']);
      table.string('token', 255);
      table.integer('user_id').unsigned();
      table.foreign('user_id').references('users.id');
      table.integer('parent_letter_id').unsigned();
      table.foreign('parent_letter_id').references('letters.id');
    })
  }

  down () {
    this.table('letters', (table) => {
      // reverse alternations
      table.dropColumn('locale');
      table.dropColumn('token');
      table.dropUnique(['slug', 'locale']);
      table.unique('slug');
      table.dropForeign('user_id');
      table.dropForeign('parent_letter_id');
      table.dropColumn('user_id');
      table.dropColumn('parent_letter_id');
    })
  }
}

module.exports = LettersSchema
