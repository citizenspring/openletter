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

Factory.blueprint('App/Models/Letter', (faker) => {
  return {
    title: faker.sentence({words: 5 + Math.floor(Math.random()*8) }).replace(/\.$/,''),
    text: `<div><h2>${faker.pickone(['Hello', 'Hi', 'Dear'])} ${faker.name()},</h2></div><div><p>This is why you should consider my <b>open letter</b>.</p><p>${faker.paragraph()}</p><p>${faker.paragraph()}</p><p>${faker.paragraph()}</p></div>`,
  }
})

Factory.blueprint('App/Models/Signature', (faker) => {
  const organization = faker.pickone(organizations);
  return {
    name: faker.pickone([null, faker.name(), faker.name()]),
    city: faker.pickone(cities),
    organization,
    occupation: organization ? 'employee' : faker.pickone(occupations),
    letter_id: faker.integer({min: 1, max: 20}),
    is_verified: faker.bool()
  }
})
