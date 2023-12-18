'use strict';
const Letter = use('App/Models/Letter');
const Signature = use('App/Models/Signature');

class MainController {
  async stats({ request, response }) {
    console.log('GET', '/stats');

    const totalLetters = await Letter.query().whereNull('parent_letter_id').groupBy('slug').count('* as total');
    const totalSignatures = await Signature.query().count('* as total');

    response.header('Cache-Control', 'public, max-age=300');

    return {
      totalLetters: totalLetters.length,
      totalSignatures: totalSignatures[0].total,
    };
  }
}

module.exports = MainController;
