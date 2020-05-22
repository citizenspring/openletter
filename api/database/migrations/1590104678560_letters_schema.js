'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LettersSchema extends Schema {
  up () {
    this.table('letters', (table) => {
      // alter table
      table.string('image', 255);
    })
  }

  down () {
    this.table('letters', (table) => {
      // reverse alternations
      table.dropColumn('image');
    })
  }
}

module.exports = LettersSchema
