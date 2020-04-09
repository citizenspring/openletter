'use strict'

const slugify = use('slugify');
const crypto = use('crypto');

class Slugify {
  register (Model, customOptions = {}) {
    const defaultOptions = {}
    const options = Object.assign(defaultOptions, customOptions)

    Model.addHook('beforeCreate', function (modelInstance) {
      // create slug
      const slugid = crypto.randomBytes(8).toString('hex').substr(0,4) + crypto.randomBytes(8).toString('hex').substr(0,4);
      modelInstance.slug = `${slugify(modelInstance.title, {lower: true, remove: /[*+~.()'"!:@#\.,]/g })}-${slugid}`;
    })

    Model.queryMacro('whereSlug', function (value) {
      this.where('slug', value)
      return this
    })
  }
}

module.exports = Slugify
