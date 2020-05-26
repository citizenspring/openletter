'use strict';

const Model = use('Model');

class User extends Model {
  static boot() {
    super.boot();

    /**
     * A hook to bash the user password before saving
     * it to the database.
     *
     * Look at `app/Models/Hooks/User.js` file to
     * check the hashPassword method
     */
    this.addHook('beforeCreate', 'User.hashPassword');
  }

  static get visible() {
    return ['name'];
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

  letters() {
    return this.hasMany('App/Models/Letter', 'id', 'user_id');
  }
}

module.exports = User;
