'use strict'

const crypto = use('crypto')

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Signature extends Model {
  static boot () {
    super.boot()

    /**
     * A hook to hash the signature password before saving
     * it to the database.
     */
    this.addHook('beforeCreate', async (signatureInstance) => {
        // create token
        signatureInstance.token = crypto.randomBytes(16).toString('hex').substr(0,16) + crypto.randomBytes(16).toString('hex').substr(0,16);
    })
  }

  static get hidden() {
    return ['id','letter_id', 'token'];
  }

  getName(name) {
    return name || "anonymous";
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens () {
    return this.hasMany('App/Models/Token')
  }
}

module.exports = Signature
