'use strict'

const { test, trait } = use('Test/Suite')('User registeration')

trait('Test/Browser')

test('load letters', async ({ browser }) => {
  const letters = await browser.visit('/letters');
})
