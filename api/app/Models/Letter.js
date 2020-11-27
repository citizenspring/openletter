'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const crypto = use('crypto');
const sanitizeHtml = use('sanitize-html');
const slugify = use('slugify');
const Signature = use('App/Models/Signature');

class Letter extends Model {
  static boot() {
    super.boot();
    this.addTrait('Slugify');
    /**
     * A hook to hash the signature password before saving
     * it to the database.
     */
    this.addHook('beforeSave', async (letterInstance) => {
      if (letterInstance.dirty.password) {
        letterInstance.password = await Hash.make(letterInstance.password);
      }
      const tokenData = `${letterInstance.slug}-${letterInstance.user_id}-${process.env.APP_KEY}`;
      letterInstance.token = crypto.createHash('md5').update(tokenData).digest('hex');
    });
  }

  static get hidden() {
    return ['updated_at', 'token'];
  }

  getText(text) {
    return (text || '').replace(/\n/g, '<br />\n');
  }

  async getLocales() {
    const resultSet = await Letter.query().whereSlug(this.slug).fetch();
    return resultSet.rows;
  }

  async getSubscribers() {
    const resultSet = await Signature.query()
      .select(['email'])
      .where('letter_id', this.id)
      .where('is_verified', true)
      .whereNotNull('email')
      .fetch();

    const subscribers = [];
    resultSet.rows.map((r) => subscribers.push(r.email));
    return subscribers;
  }

  async getSubscribersByLocale() {
    const resultSet = await Letter.query()
      .whereSlug(this.slug)
      .with('signatures', (builder) => {
        builder.where('is_verified', true);
        builder.whereNotNull('email');
      })
      .with('user')
      .fetch();

    const letters = resultSet.rows;
    let length = 0;
    const subscribersByLocale = {};
    letters.map((l, i) => {
      subscribersByLocale[l.locale] = [];
      l.getRelated('signatures').rows.map((s) => {
        subscribersByLocale[l.locale].push(s.email);
        length++;
      });
    });
    subscribersByLocale.length = length;
    return subscribersByLocale;
  }

  user() {
    return this.hasOne('App/Models/User', 'user_id', 'id');
  }

  parentLetter() {
    return this.hasOne('App/Models/Letter', 'parent_letter_id', 'id');
  }

  updates() {
    return this.hasMany('App/Models/Letter', 'id', 'parent_letter_id');
  }

  signatures() {
    return this.hasMany('App/Models/Signature', 'id', 'letter_id');
  }
}

/**
 * Create an update to an open letter with different locales
 * Each locale version's parent relates to the parent letter with the same locale
 * @POST array of letters
 */
Letter.createUpdate = async (parentLetter, letters) => {
  const locales = await parentLetter.getLocales();
  const updates = [];
  await Promise.all(
    locales.map(async (localeParentLetter) => {
      const localeLetterUpdate = letters.find((l) => l.locale === localeParentLetter.locale);
      if (!localeLetterUpdate) {
        console.info('No update found for locale', localeParentLetter.locale, 'skipping');
        return;
      }
      localeLetterUpdate.user_id = parentLetter.user_id;
      localeLetterUpdate.parent_letter_id = localeParentLetter.id;
      const update = await Letter.create(localeLetterUpdate);
      update.parentLetter = localeParentLetter;
      updates.push(update);
    }),
  );
  return updates;
};

Letter.createWithLocales = async (letters, defaultValues = {}) => {
  const slugid =
    crypto.randomBytes(8).toString('hex').substr(0, 4) + crypto.randomBytes(8).toString('hex').substr(0, 4);
  const slug = `${slugify(letters[0].title, { lower: true, remove: /[*+~.()'"!:@#\.,]/g })}-${slugid}`;
  const sanitizedLetters = [];
  letters.map((letter) => {
    const sanitizedValues = {
      title: letter.title,
      text: sanitizeHtml(letter.text, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      }),
      locale: letter.locale,
      image: letter.image,
      slug,
    };
    if (!sanitizedValues.text) {
      console.log('>>> empty text for locale', letter.locale, 'skipping');
      return;
    }
    Object.keys(defaultValues).map((key) => {
      sanitizedValues[key] = sanitizedValues[key] || defaultValues[key];
    });
    sanitizedLetters.push(sanitizedValues);
  });
  return await Letter.createMany(sanitizedLetters);
};

module.exports = Letter;
