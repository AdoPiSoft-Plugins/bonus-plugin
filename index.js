const router = require('./router.js')
const {app} = require('../core.js')
const models = require('./models')

module.exports = {
  async init () {
    await models.init()
    app.use(router)
  },
  uninstall () {}

}
