const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const act = require('@adopisoft/app/middlewares/activation.js')
const admin_ctrl = require('./controllers/admin_ctrl.js')
const portal_ctrl = require('./controllers/portal_ctrl.js')
const device_reg = require('@adopisoft/core/middlewares/device.js')
const cookie_parser = require('@adopisoft/core/middlewares/cookie_parser.js')
const device_cookie = require('@adopisoft/core/middlewares/device_cookie.js')

router.use(cookie_parser)
router.use(device_cookie.read)
router.use(device_cookie.portalCookie)

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
