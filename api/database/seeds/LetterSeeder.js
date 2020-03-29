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

    const letter = await Factory
        .model('App/Models/Letter')
        .createMany(20);

    const signature = await Factory
      .model('App/Models/Signature')
      .createMany(1000);

  }
}

module.exports = LetterSeeder