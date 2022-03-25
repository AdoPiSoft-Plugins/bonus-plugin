
const core = require('../core.js')
const {middlewares, router} = core
const {bodyParser, express, device_reg, act} = middlewares

const admin_ctrl = require('./controllers/admin_ctrl.js')
const portal_ctrl = require('./controllers/portal_ctrl.js')

router.get('/bonus-plugin-settings', admin_ctrl.get)
router.post('/bonus-plugin-settings', act, express.urlencoded({
  extended: true
}), bodyParser.json(), admin_ctrl.update)

router.get('/bonus-plugin/portal/all', device_reg, portal_ctrl.init)
router.post('/bonus-plugin/portal/collect', device_reg,
  express.urlencoded({
    extended: true
  }), bodyParser.json(), portal_ctrl.collect)

module.exports = router
