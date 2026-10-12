'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Invitation extends Model {
  static get hidden () {
    return ['token']
  }

  letter () {
    return this.belongsTo('App/Models/Letter')
  }

  parent () {
    return this.belongsTo('App/Models/Invitation', 'invited_by', 'id')
  }

  children () {
    return this.hasMany('App/Models/Invitation', 'id', 'invited_by')
  }

  signature () {
    return this.belongsTo('App/Models/Signature', 'signature_id', 'id')
  }
}

module.exports = Invitation
