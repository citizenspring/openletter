'use strict'
const Mail = use('Mail')
const Database = use('Database')
const Letter = use('App/Models/Letter')
const Signature = use('App/Models/Signature');

class LetterController {
  async index() {
    return await Letter.query()
      .with('signatures')
      .setHidden(['text', 'updated_at'])
      .orderBy('id', 'desc')
      .limit(10)
      .fetch();
  }

  async get(ctx) {
    const resultSet = await Letter
      .query()
      .whereSlug(ctx.params.slug)
      .with('signatures', (builder) => {
        builder.where('is_verified', true)
      })
      .limit(1)
      .fetch();

    if (resultSet.rows.length == 1) {
      return resultSet.rows[0];
    } else {
      return { error: { code: 404, message: 'not found'}};
    }
  }

  async create({request}) {
    const letterData = request.only(['title', 'text']);
    console.log(">>> letterData", letterData);
    let letter;
    try {
      letter = await Letter.create(letterData);
      console.log(">>> letter created", letter.toJSON());
    } catch (e) {
      console.error("error", e);
    }
    return letter.toJSON();
  }

  async sign({request}) {
    const signatureData = request.only(['name', 'occupation', 'city']);
    console.log(">>> signatureData", signatureData);
    console.log(">>> fetching letter", request.params.slug);
    const letter = await Letter.findBy('slug', request.params.slug);
    let signature;
    // console.log(">>> letter", letter);
    try {
      signature = await letter.signatures().create(signatureData);
      console.log(">>> signature created, token", signature.token);
    } catch (e) {
      console.error("error", e);
    }

    const emailData = {
      letter: letter.toJSON(),
      signature: signature.toJSON(),
      env: process.env
    };
    emailData.signature.token = signature.token;
    console.log(">>> emailData", request.body.email, emailData);
    try {
      await Mail.send('emails.confirm_signature', emailData, (message) => {
        message
          .to(request.body.email)
          .from('support@openletter.earth')
          .subject('ACTION REQUIRED: Please confirm your signature on this open letter')
      })
    } catch (e) {
      console.error("error", e);
    }
    console.log(">>> email sent")
    return true;
  }
}

module.exports = LetterController
