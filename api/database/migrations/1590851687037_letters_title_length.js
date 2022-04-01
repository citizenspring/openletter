'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LetterSchema extends Schema {
  up () {
    this.table('letters', (table) => {
      table.string('slug', 255).alter()
      table.string('title', 255).alter()
    })
  }

  down () {
    this.table('letters', (table) => {
      table.string('slug', 100).alter()
      table.string('title', 100).alter()
    })
  }
}

module.exports = LetterSchema
