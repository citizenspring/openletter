# openletter.earth

Create an open letter and get people to sign it digitally

Inspirations:
- [Carte blanche: pour un "Corona reset"](https://docs.google.com/forms/d/e/1FAIpQLSfoqjsCyADoUW90FOlzO94Jz7lbVItrNhkVRzoUlTfPYLvb7Q/viewform)
- [Face à la crise historique engendrée par la pandémie de coronavirus, organisons notre sécurité alimentaire](https://www.lalibre.be/debats/opinions/face-a-la-crise-historique-engendree-par-la-pandemie-de-coronavirus-organisons-notre-securite-alimentaire-5e8aeeb6d8ad581631c03f18)
- [Mille médecins sonnent l’alarme climatique](https://plus.lesoir.be/252649/article/2019-10-10/mille-medecins-sonnent-lalarme-climatique)

We need to make it easier to create such open letters. The number of people signing it doesn't matter as much as the function/organization of the first people who sign it. 

## Demo

![](https://d.pr/free/i/BILgdt+)


## Deployment

### API

We are using Heroku to host the API using a Postgres database. Since heroku expects a git tree, make sure you only push the `api/`sub directory.

`git subtree push --prefix api heroku master`

### Frontend

We use Zeit's now.

`cd frontend && now``