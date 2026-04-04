'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddVerificationMethodToSignaturesSchema extends Schema {
  up () {
    this.table('signatures', (table) => {
      table.string('verification_method', 16).defaultTo('email').index()
      table.text('passkey_credential_id').nullable()
    })
  }

  down () {
    this.table('signatures', (table) => {
      table.dropColumn('verification_method')
      table.dropColumn('passkey_credential_id')
    })
  }
}

module.exports = AddVerificationMethodToSignaturesSchema
