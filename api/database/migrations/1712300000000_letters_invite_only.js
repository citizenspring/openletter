'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LettersInviteOnlySchema extends Schema {
  up () {
    this.table('letters', (table) => {
      table.string('letter_type', 16).defaultTo('public').index()       // 'public' | 'invite_only'
      table.string('restriction_mode', 16).defaultTo(null)              // 'invite' | 'domain' | null
      table.text('allowed_domains').defaultTo(null)                     // JSON array: ["uni.edu"]
      table.integer('invites_per_person').defaultTo(5)
      table.boolean('allow_chain_invites').defaultTo(false)
      table.boolean('is_paid').defaultTo(false)
      table.string('stripe_session_id', 255).defaultTo(null)
      table.timestamp('deleted_at').defaultTo(null)
    })
  }

  down () {
    this.table('letters', (table) => {
      table.dropColumn('letter_type')
      table.dropColumn('restriction_mode')
      table.dropColumn('allowed_domains')
      table.dropColumn('invites_per_person')
      table.dropColumn('allow_chain_invites')
      table.dropColumn('is_paid')
      table.dropColumn('stripe_session_id')
      table.dropColumn('deleted_at')
    })
  }
}

module.exports = LettersInviteOnlySchema
