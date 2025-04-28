'use strict';

const crypto = use('crypto');
const Letter = use('App/Models/Letter');
const Signature = use('App/Models/Signature');
const User = use('App/Models/User');
const acceptLanguageParser = use('accept-language-parser');
const Logger = use('Logger');
Logger.level = 'info';

const availableLocales = require('../../../locales.json');

const { sendEmail } = use('App/Libs/email');
const { getImageSize } = use('App/Libs/image');

function containsURL(str) {
  const patterns = [
    /https?:\/\/.+\..+/,
    /www\..+\..+/,
    /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,8}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
  ];
  return patterns.some((pattern) => pattern.test(str));
}

const latestSignatureTimestampByIpAddress = {};
console.log('>>> Setting up latestSignatureTimestampByIpAddress');
setInterval(() => {
  console.log('>>> Resetting latestSignatureTimestampByIpAddress');
  latestSignatureTimestampByIpAddress = {};
}, 1000 * 60 * 60 * 24); // reset every day

class LetterController {
  async index(ctx) {
    const request = ctx.request.only(['locale', 'featured', 'limit', 'minSignatures']);
    return await Letter.list({
      locale: request.locale,
      featured: request.featured,
      limit: request.limit,
      minSignatures: request.minSignatures,
    });
  }
  async featured(ctx) {
    const request = ctx.request.only(['locale']);
    return await Letter.list({ locale: request.locale, featured: true });
  }

  async get(ctx) {
    const resultSet = await Letter.query()
      .whereSlug(ctx.params.slug)
      .with('signatures', (builder) => {
        builder.orderBy('id', 'asc');
      })
      .with('parentLetter', (builder) => {
        // builder.select('slug', 'title')
      })
      .with('updates')
      .fetch();

    const request = ctx.request.only(['locale', 'limit']);
    const limit = request.limit === '0' ? null : parseInt(request.limit, 10) || 1000;
    const locale =
      request.locale ||
      acceptLanguageParser.pick(Object.keys(availableLocales), ctx.request.headers()['accept-language'], {
        loose: true,
      }) ||
      'en';
    console.log('GET', ctx.params.slug, locale);
    let res;
    if (resultSet.rows.length > 0) {
      const letters = resultSet.rows;
      const signatures_stats = {
        verified: 0,
        unverified: 0,
        total: 0,
      };

      let index = 0;
      const signatures = [];
      const locales = [];
      const verified_signatures = [];
      letters.map((l, i) => {
        const letter = l.toJSON();
        letter.signatures.map((s) => {
          if (s.is_verified) {
            verified_signatures.push(s);
            signatures_stats.verified++;
          } else {
            signatures_stats.unverified++;
          }
          signatures.push(s);
        });
        locales.push(letter.locale);
        if (letter.locale === locale) index = i;
      });

      signatures.sort((a, b) => {
        return a.created_at < b.created_at ? -1 : 1;
      });
      signatures_stats.total = signatures.length;
      res = letters[index].toJSON();
      res.signatures_stats = signatures_stats;
      res.signatures = limit ? signatures.slice(0, limit) : signatures;

      if (limit) {
        res.first_verified_signatures = verified_signatures.slice(0, 20);
        res.latest_verified_signatures = verified_signatures.slice(-20);
      }
      res.locales = locales;
      res.type = res.parent_letter_id ? 'update' : 'letter';
      if (res.updates) {
        res.updates = res.updates.filter((u) => u.locale === locale);
      }

      if (res.image) {
        res.image = await getImageSize(res.image);
      }

      return res;
    }

    if (resultSet.rows.length == 1) {
      res = resultSet.rows[0].toJSON();
      res.locales = [res.locale];
      res.type = res.parent_letter_id ? 'update' : 'letter';
      return res;
    } else {
      return { error: { code: 404, message: 'not found' } };
    }
  }

  async create({ request }) {
    const formData = request.only(['letters']);
    console.log('>>> LetterController.create', formData);
    let user = {};
    if (formData.letters[0].email) {
      try {
        user = await User.findOrCreate(
          { email: formData.letters[0].email },
          {
            email: formData.letters[0].email,
          },
        );
      } catch (e) {
        console.error(e);
      }
    }

    let letters;
    try {
      letters = await Letter.createWithLocales(formData.letters, {
        image: formData.letters[0].image,
        user_id: user && user.id,
      });
    } catch (e) {
      console.error('error', e);
    }

    if (formData.letters[0].email) {
      const locale =
        acceptLanguageParser.pick(['en', 'fr', 'nl'], request.headers()['accept-language'], { loose: true }) || 'en';

      const subject = {
        en: 'KEEP: Link to post updates to your open letter',
        nl: 'KEEP: Link to post updates to your open letter',
        fr: 'A GARDER: Lien pour poster une mise à jour à votre lettre ouverte',
      };

      console.log('>>> send email confirmation for locale', locale);

      try {
        await sendEmail(formData.letters[0].email, subject[locale], `emails.${locale}.link_to_edit_openletter`, {
          letter: letters[0],
          env: process.env,
        });
      } catch (e) {
        console.error('error', e);
      }
      console.log('>>> email sent');
    }
    return letters[0].toJSON();
  }

  /**
   * Post an update to an existing open letter
   * @param {*} param0
   */
  async update({ request }) {
    const formData = request.only(['letters', 'parent_letter_id', 'token']);
    console.log('>>> LetterController.update', formData);

    const parentLetter = await Letter.find(formData.parent_letter_id);

    if (formData.token !== parentLetter.token) {
      return { error: { code: 403, message: 'Unauthorized: Invalid token' } };
    }

    let updates;
    try {
      updates = await Letter.createUpdate(parentLetter, formData.letters);
    } catch (e) {
      console.error('error', e);
    }

    const subscribersByLocale = await parentLetter.getSubscribersByLocale();
    await Promise.all(
      updates.map(async (localeUpdate) => {
        const subscribers = subscribersByLocale[localeUpdate.locale];
        const emailData = {
          update: localeUpdate.toJSON(),
          parentLetter: localeUpdate.toJSON().parentLetter.toJSON(),
          env: process.env,
        };
        console.log(`>>> sending ${localeUpdate.locale} update to ${subscribers.length} subscribers`, subscribers);

        await Promise.all(
          subscribers.map(async (email) => {
            try {
              await sendEmail(email, localeUpdate.title, 'emails.update', emailData);
            } catch (e) {
              console.error('error', e);
            }

            console.log('>>> email sent');
          }),
        );
      }),
    );
    const res = updates[0].toJSON();
    res.locales = updates.map((u) => u.locale);
    res.type = 'update';
    return res;
  }

  /**
   * Delete an existing open letter
   * @param {*} param0
   */
  async delete({ request }) {
    const formData = request.only(['parent_letter_id', 'token']);
    console.log('>>> LetterController.delete', formData);

    const parentLetter = await Letter.find(formData.parent_letter_id);

    if (!parentLetter) {
      return { error: { code: 404, message: 'This open letter cannot be found in the database' } };
    }

    if (formData.token !== parentLetter.token) {
      return { error: { code: 403, message: 'Unauthorized: Invalid token' } };
    }

    await parentLetter.updates().delete();
    await parentLetter.signatures().delete();
    await parentLetter.delete();

    return {
      code: 200,
      status: 'success',
      action: 'delete',
      letter_url: `https://openletter.earth/${parentLetter.slug}`,
      message: `Open letter removed successfully`,
    };
  }

  async sign({ request }) {
    const signatureData = request.only(['name', 'occupation', 'city', 'organization', 'share_email']);

    // only accept one signature per 30s per ip address
    const ipAddress = request.headers()['x-forwarded-for'] || request.ip;
    if (ipAddress) {
      console.log(
        '>>> last signature request from ip',
        ipAddress,
        latestSignatureTimestampByIpAddress[ipAddress],
        new Date(Date.now() - 30000),
        latestSignatureTimestampByIpAddress[ipAddress] > new Date(Date.now() - 30000),
      );
      if (latestSignatureTimestampByIpAddress[ipAddress] > new Date(Date.now() - 30000)) {
        console.log('>>> Too many requests: please try again later', ipAddress, JSON.stringify(signatureData));
        return {
          error: { code: 429, message: 'Too many requests: please try again later' },
        };
      }
    }

    if (containsURL(JSON.stringify(signatureData))) {
      console.log(
        '>>> containsURL',
        JSON.stringify(signatureData),
        'ip address:',
        request.headers()['x-forwarded-for'],
      );
      return {
        error: { code: 400, message: 'Invalid signature: it should not contain any URL' },
      };
    }

    const letter = await Letter.query()
      .where('slug', request.params.slug)
      .where('locale', request.params.locale)
      .first();

    // We create the token based on the letter.slug and request.body.email to make sure we can only have one signature per email address per letter (without having to actually record the email address in our database)
    const tokenData = `${letter.slug}-${request.body.email}-${process.env.APP_KEY}`;

    signatureData.token = crypto.createHash('md5').update(tokenData).digest('hex');
    if (signatureData.share_email) {
      signatureData.email = request.body.email;
    }
    delete signatureData.share_email;

    let signature;
    try {
      signature = await letter.signatures().create(signatureData);
      if (ipAddress) {
        latestSignatureTimestampByIpAddress[ipAddress] = new Date();
        console.log('>>> latestSignatureTimestampByIpAddress', ipAddress, latestSignatureTimestampByIpAddress);
      }
    } catch (e) {
      if (e.constraint === 'signatures_token_unique') {
        signature = await Signature.query().where('token', signatureData.token).first();
        if (!signature || signature.is_verified) {
          return {
            error: { code: 400, message: 'you already signed this open letter' },
          };
        } else {
          // we update the signature and continue to send a new email confirmation
          signature.merge(signatureData);
          await signature.save();
        }
      } else {
        console.error('error', e);
      }
    }

    const emailData = {
      letter: letter.toJSON(),
      signature: signature.toJSON(),
      env: process.env,
    };
    emailData.signature.token = signature.token;
    const locale =
      acceptLanguageParser.pick(['en', 'fr', 'nl'], request.headers()['accept-language'], { loose: true }) || 'en';

    const subject = {
      en: 'ACTION REQUIRED: Please confirm your signature on this open letter',
      nl: 'ACTIE VEREIST: Bevestig uw handtekening onder deze open brief',
      fr: 'ACTION REQUISE: Veuillez confirmer votre signature sur cette lettre ouverte',
    };

    console.log('>>> send email confirmation for locale', locale);

    await sendEmail(request.body.email, subject[locale], `emails.${locale}.confirm_signature`, emailData);
    // if successful, we remove the email from database if the user didn't subscribe for updates
    if (!request.body.share_email) {
      signature.email = null;
      signature.save();
    }
    return signature.toJSON();
  }
}

module.exports = LetterController;
