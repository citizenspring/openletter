'use strict'

/*
|--------------------------------------------------------------------------
| LetterSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');

class LetterSeeder {

  async run () {

    const users = await Factory
        .model('App/Models/User')
        .createMany(2);

    const letters = await Factory
        .model('App/Models/Letter')
        .makeMany(5);
        
    await Promise.all(letters.map(async (l, i) => {
      if (i < users.length) {
        l.user_id = users[i].id;
      }
      await l.save();
      await Factory.model('App/Models/Signature').createMany(100, { letter_id: l.id });
    }));
  }
}

module.exports = LetterSeeder