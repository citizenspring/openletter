'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LetterSchema extends Schema {
  up () {
    this.create('letters', (table) => {
      table.increments()
      table.string('slug', 100).notNullable().unique().index()
      table.string('title', 100).notNullable()
      table.text('text').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('letters')
  }
}

module.exports = LetterSchema
