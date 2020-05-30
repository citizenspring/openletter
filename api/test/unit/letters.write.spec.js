'use strict';

const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Letters');
const Letter = use('App/Models/Letter');
const Signature = use('App/Models/Signature');
const User = use('App/Models/User');
const Factory = use('Factory');
const Mail = use('Mail');

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
    Mail.fake();
  });

  beforeEach(() => {
    Mail.clear();
  });

  after(async () => {
    Mail.restore();
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

  test('POST /letters/:slug/:locale/sign error', async ({ client, assert }) => {
    const signatureData = {
      name: 'Xavier',
      occupation: 'Entrepreneur',
      organization: 'AllForClimate',
      city: 'Brussels',
      email: 'author',
      share_email: true,
    };

    const response = await client.post(`/letters/${letter.slug}/${letter.locale}/sign`).send(signatureData).end();
    response.assertStatus(200);
    response.assertJSONSubset({
      error: {
        code: 400,
        message: 'invalid email address',
      },
    });
  });

  test('POST /letters/:slug/:locale/sign and share email', async ({ client, assert }) => {
    const signatureData = {
      name: 'Xavier',
      occupation: 'Entrepreneur',
      organization: 'AllForClimate',
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
      organization: 'AllForClimate',
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

  test('POST /letters/:slug/:locale/sign update signature and send new email confirmation if not already confirmed', async ({
    client,
    assert,
  }) => {
    const signatureData = {
      name: 'Xavier',
      occupation: 'Entrepreneur',
      organization: 'Citizen Spring',
      city: 'Brussels',
      email: 'author2@gmail.com',
      share_email: false,
    };

    const response = await client.post(`/letters/${letter.slug}/${letter.locale}/sign`).send(signatureData).end();
    console.log('>>> response', response.body);
    response.assertStatus(200);
    response.assertJSONSubset({
      letter_id: letter.id,
      name: signatureData.name,
      occupation: signatureData.occupation,
      organization: signatureData.organization,
    });
    const signature = await Signature.find(response.body.id);
    assert.equal(signature.email, null);
    const emailSent = Mail.pullRecent();
    assert.equal(emailSent.message.to[0].address, signatureData.email);
    assert.equal(emailSent.message.subject, 'ACTION REQUIRED: Please confirm your signature on this open letter');
  });

  test('POST /signatures/confirm', async ({ client, assert }) => {
    let signature = await Signature.query().first();
    assert.equal(signature.is_verified, false);
    const response = await client.post(`/signatures/confirm`).send({ token: signature.token }).end();
    signature = await Signature.find(response.body.id);
    assert.equal(signature.is_verified, true);
  });

  test('POST /letters/:slug/:locale/sign error if already signed', async ({ client, assert }) => {
    const signatureData = {
      name: 'Xavier',
      occupation: 'Entrepreneur',
      organization: 'AllForClimate',
      city: 'Brussels',
      email: 'author@gmail.com',
      share_email: false,
    };

    const response = await client.post(`/letters/${letter.slug}/${letter.locale}/sign`).send(signatureData).end();
    response.assertStatus(200);
    response.assertJSONSubset({
      error: {
        code: 400,
        message: 'you already signed this open letter',
      },
    });
    const emailSent = Mail.pullRecent();
    assert.equal(emailSent, null);
  });
}
