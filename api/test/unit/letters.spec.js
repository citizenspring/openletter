'use strict'

const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Letters')
const Letter = use('App/Models/Letter')
const Signature = use('App/Models/Signature')
const User = use('App/Models/User')
const Factory = use('Factory')

async function cleandb() {
  await Signature.query().delete();
  await Letter.query().delete();
  await User.query().delete();
}

{

  const locales = ['en', 'fr', 'nl'];
  const lettersByLocale = {};
  let user, letter;

  async function createLetterForLocale(slug, locale) {
    const letter = await Factory.model('App/Models/Letter').make();
    letter.slug = slug;
    letter.user_id = user.id;
    letter.locale = locale;
    await letter.save();
    return letter;
  }

  before(async () => {
    await cleandb();
    user = await Factory.model('App/Models/User').create();

    letter = await Factory.model('App/Models/Letter').make();
    await user.letters().save(letter);

    await Promise.all(locales.map(async (locale) => {
      if (locale === letter.locale) {
        lettersByLocale[locale] = letter;
      } else {
        lettersByLocale[locale] = await createLetterForLocale(letter.slug, locale);
      }
    }));

    await Factory.model('App/Models/Signature').create({
      name: 'John Appleseed',
      city: 'London',
      letter_id: lettersByLocale['en'].id,
      email: 'john@acme.com',
      is_verified: true
    });

    await Factory.model('App/Models/Signature').create({
      name: 'Amélie Poulin',
      city: 'Paris',
      letter_id: lettersByLocale['fr'].id,
      email: 'amelie@cafe.fr',
      is_verified: true
    });

    await Factory.model('App/Models/Signature').create({
      name: 'Leen Schelfhout',
      city: 'Antwerp',
      letter_id: lettersByLocale['nl'].id,
      email: 'leen@burgerlijst.be',
      is_verified: false
    });

  })

  after(async () => {
    // await Signature.query().delete();
    // await Letter.query().delete();
  })

  test('letter.getSubscribers', async ({ assert }) => {
    const subscribers = await lettersByLocale.fr.getSubscribers();
    assert.equal(subscribers[0], 'amelie@cafe.fr');
    assert.equal(subscribers.length, 1);
  })

  test('letter.getSubscribersByLocale', async ({ assert }) => {
    const subscribers = await letter.getSubscribersByLocale();
    assert.equal(subscribers.en[0], 'john@acme.com');
    assert.equal(subscribers.fr[0], 'amelie@cafe.fr');
    assert.equal(subscribers.nl.length, 0);
  })
}
