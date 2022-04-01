'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LetterSchema extends Schema {
  up () {
    this.table('letters', (table) => {
      table.string('slug', 255).notNullable().unique().index().alter()
      table.string('title', 255).notNullable().alter()
    })
  }

  down () {
    this.table('letters', (table) => {
      table.string('slug', 100).notNullable().unique().index().alter()
      table.string('title', 100).notNullable().alter()
    })
  }
}

module.exports = LetterSchema
