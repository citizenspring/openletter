'use strict'
const Database = use('Database')
const Letter = use('App/Models/Letter')

class LetterController {
    async index() {
        return await Letter.query()
            .with('signatures')
            .orderBy('id', 'desc')
            .limit(10)
            .fetch();
    }
}

module.exports = LetterController
