'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class InvitationsSchema extends Schema {
  up () {
    this.create('invitations', (table) => {
      table.increments()
      table.integer('letter_id').unsigned().notNullable().references('id').inTable('letters').index()
      table.string('token', 64).notNullable().unique().index()
      table.string('email', 255).defaultTo(null)
      table.integer('invited_by').unsigned().defaultTo(null).references('id').inTable('invitations')
      table.integer('generation').defaultTo(0)                     // 0 = creator-sent, 1 = their invitee, etc.
      table.integer('invites_remaining').defaultTo(5)
      table.integer('signature_id').unsigned().defaultTo(null).references('id').inTable('signatures')
      table.timestamp('used_at').defaultTo(null)
      table.timestamps()
    })
  }

  down () {
    this.drop('invitations')
  }
}

module.exports = InvitationsSchema
