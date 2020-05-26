'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Signature extends Model {
  static boot() {
    super.boot();
  }

  static get hidden() {
    return ['id', 'letter_id', 'token'];
  }

  getName(name) {
    return name || 'anonymous';
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
  tokens() {
    return this.hasMany('App/Models/Token');
  }
}

module.exports = Signature;
