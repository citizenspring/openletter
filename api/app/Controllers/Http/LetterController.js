'use strict'
const crypto = use('crypto')
const Mail = use('Mail')
const Database = use('Database')
const Letter = use('App/Models/Letter')
const Signature = use('App/Models/Signature');
const sanitizeHtml = use('sanitize-html');

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
    letterData.text = sanitizeHtml(letterData.text, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
    });
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

    const signatureData = request.only(['name', 'occupation', 'city', 'organization']);

    const letter = await Letter.findBy('slug', request.params.slug);

    // We create the token based on the letter.id and request.body.email to make sure we can only have one signature per email address (without having to actually record the email address in our database)
    const tokenData = `${letter.id}-${request.body.email}-${process.env.APP_KEY}`;
    signatureData.token = crypto.createHash('md5').update(tokenData).digest("hex");

    let signature;

    try {
      signature = await letter.signatures().create(signatureData);
    } catch (e) {
      if (e.constraint === 'signatures_token_unique') {
        return { error: { code: 400, message: 'you already signed this open letter'}};
      } else {
        console.error("error", e);
      }
    }

    const emailData = {
      letter: letter.toJSON(),
      signature: signature.toJSON(),
      env: process.env
    };
    emailData.signature.token = signature.token;

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
