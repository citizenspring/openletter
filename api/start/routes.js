'use strict';

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

Route.on('/').render('welcome');

Route.get('stats', 'MainController.stats');
Route.get('homepage', 'MainController.homepage');
Route.get('letters', 'LetterController.index');
Route.get('letters/featured', 'LetterController.featured');
Route.get('letters/:slug', 'LetterController.get');
Route.get('letters/:slug/:locale', 'LetterController.get');
Route.post('letters/create', 'LetterController.create');
Route.post('letters/update', 'LetterController.update');
Route.post('letters/delete', 'LetterController.delete');
Route.get('signatures/:token', 'SignatureController.get');
Route.get('signatures/:id/:token', 'SignatureController.get'); // deprecated
// TODO: refactor to signatures/create
Route.post('letters/:slug/:locale/sign', 'LetterController.sign');
Route.post('signatures/confirm', 'SignatureController.confirm');
