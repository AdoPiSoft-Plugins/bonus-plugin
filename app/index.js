const router = require('./router.js')
const {app} = require('@adopisoft/exports')
const models = require('./models')

module.exports = {
  async init () {
    app.use(router)
    await models.init()
  },
  uninstall () {}

}
