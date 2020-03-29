'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TokensSchema extends Schema {
  up () {
    this.create('signatures', (table) => {
      table.increments()
      table.integer('letter_id').unsigned().references('id').inTable('letters')
      table.string('name', 128).nullable()
      table.string('city', 64).nullable()
      table.string('occupation', 64).nullable()
      table.string('organization', 64).nullable()
      table.string('token', 64).nullable().unique().index()
      table.boolean('is_verified').defaultTo(false)
      table.timestamps()
    })
  }

  down () {
    this.drop('signatures')
  }
}

module.exports = TokensSchema
