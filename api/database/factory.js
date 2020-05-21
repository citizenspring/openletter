'use strict'

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const cities = [null, 'Nivelles', 'Louvain-la-Neuve', 'Brussels', 'Barcelona', 'Antwerp', 'Namur', 'London', 'Berlin', 'Amsterdam', 'Paris', 'Lille', 'Vienna'];
const organizations = [null, null, null, 'amazon.com', 'apple.com', 'facebook.com'];
const occupations = [null, 'student', 'teacher', 'doctor', 'nurse', 'developer'];
const locales = ['en', 'en', 'en', 'fr','fr','nl'];

Factory.blueprint('App/Models/Letter', (faker) => {
  return {
    locale: faker.pickone(locales),
    title: faker.sentence({words: 5 + Math.floor(Math.random()*8) }).replace(/\.$/,''),
    text: `<div><h2>${faker.pickone(['Hello', 'Hi', 'Dear'])} ${faker.name()},</h2></div><div><p>This is why you should consider my <b>open letter</b>.</p><p>${faker.paragraph()}</p><p>${faker.paragraph()}</p><p>${faker.paragraph()}</p></div>`,
  }
})

Factory.blueprint('App/Models/User', (faker) => {
  return {
    email: faker.email(),
    name: faker.name(),
    username: faker.username(),
  }
})

Factory.blueprint('App/Models/Signature', (faker, i, data) => {
  const organization = faker.pickone(organizations);
  return {
    letter_id: data.letter_id,
    name: data.name || faker.pickone([null, faker.name(), faker.name()]),
    city: data.city || faker.pickone(cities),
    organization,
    occupation: organization ? 'employee' : faker.pickone(occupations),
    email: data.email || faker.pickone([null, null, null, null, faker.email()]),
    is_verified: (typeof data.is_verified !== 'undefined') ? data.is_verified : faker.bool()
  }
})
