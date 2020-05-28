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
  let letter, user;

  before(async () => {
    await cleandb();
  });

  after(async () => {
    // await Signature.query().delete();
    // await Letter.query().delete();
  });

  test('POST /letters/create', async ({ client, assert }) => {
    const letterData = {
      locale: 'en',
      title: 'Open letter to the minister',
      text: 'Please do this...',
      image: 'https://images.google.com/test.jpg',
      email: 'author@gmail.com',
    };

    const response = await client
      .post(`/letters/create`)
      .send({
        letters: [letterData],
      })
      .end();
    response.assertStatus(200);
    console.log('>>> response', response.body);
    letter = await Letter.find(response.body.id);
    user = await User.find(response.body.user_id);
    assert.equal(user.email, letterData.email);
    response.assertJSONSubset({
      user_id: letter.user_id,
      slug: letter.slug,
      locale: letter.locale,
    });
  });

  test('POST /letters/:slug/:locale/sign and share email', async ({ client, assert }) => {
    const signatureData = {
      name: 'Xavier',
      occupation: 'Entrepreneur',
      organisation: 'AllForClimate',
      city: 'Brussels',
      email: 'author@gmail.com',
      share_email: true,
    };

    const response = await client.post(`/letters/${letter.slug}/${letter.locale}/sign`).send(signatureData).end();
    response.assertStatus(200);
    response.assertJSONSubset({
      letter_id: letter.id,
      name: signatureData.name,
      occupation: signatureData.occupation,
    });
    const signature = await Signature.find(response.body.id);
    assert.equal(signature.email, signatureData.email);
  });

  test("POST /letters/:slug/:locale/sign and don't share email", async ({ client, assert }) => {
    const signatureData = {
      name: 'Xavier',
      occupation: 'Entrepreneur',
      organisation: 'AllForClimate',
      city: 'Brussels',
      email: 'author2@gmail.com',
      share_email: false,
    };

    const response = await client.post(`/letters/${letter.slug}/${letter.locale}/sign`).send(signatureData).end();
    response.assertStatus(200);
    response.assertJSONSubset({
      letter_id: letter.id,
      name: signatureData.name,
      occupation: signatureData.occupation,
    });
    const signature = await Signature.find(response.body.id);
    assert.equal(signature.email, null);
  });
}
