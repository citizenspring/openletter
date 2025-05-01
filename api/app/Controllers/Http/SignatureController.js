'use strict';
const Signature = use('App/Models/Signature');

class SignatureController {
  async confirm({ request }) {
    const signature = await Signature.findBy('token', request.body.token);
    signature.is_verified = true;
    await signature.save();
    return signature.toJSON();
  }

  async get(ctx) {
    if (!ctx.params.token) {
      return ctx.response.status(400).json({ error: 'Missing token' });
    }
    const resultSet = await Signature.query().where('token', ctx.params.token).fetch();
    if (resultSet.rows.length === 0) {
      return ctx.response.status(404).json({ error: 'Signature not found' });
    }
    return resultSet.rows[0].toJSON();
  }
}

module.exports = SignatureController;
