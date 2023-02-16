const router = require('./router.js')
const { app } = require('../core.js')
const models = require('./models')
const config = require('./config.js')

module.exports = {
  async init (id) {
    config.id = id
    await models.init()
    app.use(router)
  },
  uninstall () {}

}
