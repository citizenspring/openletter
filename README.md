# openletter.earth

Create an open letter and get people to sign it digitally

- No cookies, no trackers, no ads
- Doesn't save email addresses unless people opt in to receive updates about the letter they signed
- Support for multiple languages
- Use SSG (Static Site Generation) for super fast delivery

## Examples

- [Open letter to ask for Sundays Without Cars in Brussels](https://openletter.earth/lettre-ouverte-a-elke-van-den-brandt-dimanches-sans-voiture-cet-ete-a-bruxelles-ebf9bf61) (in English, French and Dutch)
- [Open letter to ask to give priority to soft mobility over cars in residential streets in Schaerbeek, Brussels](https://openletter.earth/open-letter-to-the-city-of-schaerbeek-give-priority-to-pedestrians-runners-and-bicycles-54952bee) (in English, French and Dutch inline)

Inspirations:

- [Carte blanche: pour un "Corona reset"](https://docs.google.com/forms/d/e/1FAIpQLSfoqjsCyADoUW90FOlzO94Jz7lbVItrNhkVRzoUlTfPYLvb7Q/viewform)
- [Face à la crise historique engendrée par la pandémie de coronavirus, organisons notre sécurité alimentaire](https://www.lalibre.be/debats/opinions/face-a-la-crise-historique-engendree-par-la-pandemie-de-coronavirus-organisons-notre-securite-alimentaire-5e8aeeb6d8ad581631c03f18)
- [Mille médecins sonnent l’alarme climatique](https://plus.lesoir.be/252649/article/2019-10-10/mille-medecins-sonnent-lalarme-climatique)

## Demo

![](https://openletter.earth/images/openletter-demo.gif)

## Deployment

### API

Simply run `npm run deploy:api`

We are using Heroku to host the API using a Postgres database. Since heroku expects a git tree, make sure you only push the `api/`sub directory.

`git subtree push --prefix api heroku master`

(or to force push if ever needed: `` git push heroku `git subtree split --prefix api master`:master --force ``)

To test emails, we recommend using (Maildev)[https://github.com/maildev/maildev] (`npm i -g maildev && npx maildev`).

### Frontend

Simply run `npm run deploy:frontend`

We use Vercel.com.
