'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SignaturesSchema extends Schema {
  up () {
    this.table('signatures', (table) => {
      // alter table
      table.string('email', 255);
    })
  }

  down () {
    this.table('signatures', (table) => {
      // reverse alternations
      table.dropColumn('email');
    })
  }
}

module.exports = SignaturesSchema
