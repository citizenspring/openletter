'use strict';

const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Letters');
const Letter = use('App/Models/Letter');
const Signature = use('App/Models/Signature');
const User = use('App/Models/User');
const Factory = use('Factory');

trait('Test/ApiClient');

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

    await Promise.all(
      locales.map(async (locale) => {
        if (locale === letter.locale) {
          lettersByLocale[locale] = letter;
        } else {
          lettersByLocale[locale] = await createLetterForLocale(letter.slug, locale);
        }
      }),
    );

    await Factory.model('App/Models/Signature').create({
      name: 'John Appleseed',
      city: 'London',
      letter_id: lettersByLocale['en'].id,
      email: 'john@acme.com',
      is_verified: true,
    });

    await Factory.model('App/Models/Signature').create({
      name: 'Amélie Poulin',
      city: 'Paris',
      letter_id: lettersByLocale['fr'].id,
      email: 'amelie@cafe.fr',
      is_verified: true,
    });

    await Factory.model('App/Models/Signature').create({
      name: 'Leen Schelfhout',
      city: 'Antwerp',
      letter_id: lettersByLocale['nl'].id,
      email: 'leen@burgerlijst.be',
      is_verified: false,
    });
  });

  after(async () => {
    // await Signature.query().delete();
    // await Letter.query().delete();
  });

  test('letter.createUpdate', async ({ assert }) => {
    const updatesData = [
      {
        locale: 'fr',
        title: 'Réponse reçue',
        text: 'Voici la réponse de la ministre',
      },
      {
        locale: 'en',
        title: 'Response received',
        text: 'This is what the minister had to say...',
      },
    ];
    const updates = await Letter.createUpdate(letter, updatesData);
    assert.equal(updates.length, 2);
    updates.map((update) => {
      assert.equal(update.user_id, letter.user_id);
      assert.equal(update.parent_letter_id, lettersByLocale[update.locale].id);
    });
  });

  test('POST /letters/:slug/update with 2/3 locales', async ({ client, assert }) => {
    const updatesData = [
      {
        locale: 'fr',
        title: 'Réponse reçue',
        text: 'Voici la réponse de la ministre',
      },
      {
        locale: 'en',
        title: 'Response received',
        text: 'This is what the minister had to say...',
      },
    ];

    const response = await client
      .post(`/letters/update`)
      .send({
        parent_letter_id: letter.id,
        token: letter.token,
        letters: updatesData,
      })
      .end();
    response.assertStatus(200);
    response.assertJSONSubset({
      type: 'update',
      user_id: letter.user_id,
      parent_letter_id: lettersByLocale[response.body.locale].id,
      locales: ['en', 'fr'],
      parentLetter: {
        slug: letter.slug,
      },
    });
  });
}
