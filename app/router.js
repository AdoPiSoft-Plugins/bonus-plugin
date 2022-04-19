const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const act = require('@adopisoft/app/middlewares/activation.js')
const admin_ctrl = require('./controllers/admin_ctrl.js')
const portal_ctrl = require('./controllers/portal_ctrl.js')
const device_reg = require('@adopisoft/core/middlewares/device.js')
const cookie_parser = require('@adopisoft/core/middlewares/cookie_parser.js')
const device_cookie = require('@adopisoft/core/middlewares/device_cookie.js')
const fileUpload = require('express-fileupload')

router.use(cookie_parser)
router.use(device_cookie.read)
router.use(device_cookie.portalCookie)

router.get('/bonus-plugin-settings', admin_ctrl.get)
router.post('/bonus-plugin-settings', act, express.urlencoded({
  extended: true
}), bodyParser.json(), admin_ctrl.update)
router.post('/bonus-plugin-settings/roleta-game/sounds',
  fileUpload({
    limits: {fileSize: 5 * 1024 * 1024 * 1024},
    useTempFiles: true,
    tempFileDir: process.env.TMPDIR
  }), admin_ctrl.uploadSound)
router.post('/bonus-plugin-settings/roleta-game/sounds/delete',
  express.urlencoded({
    extended: true
  }), bodyParser.json(), admin_ctrl.deleteSound)

router.get('/bonus-plugin/portal/all', device_reg, portal_ctrl.init)
router.post('/bonus-plugin/portal/collect', device_reg,
  express.urlencoded({
    extended: true
  }), bodyParser.json(), portal_ctrl.collect)

router.get('/bonus-plugin/portal/roleta-game/spin-left', device_reg, portal_ctrl.getSpinLeft)
router.post('/bonus-plugin/portal/roleta-game/update', device_reg, portal_ctrl.update)
router.post('/bonus-plugin/portal/roleta-game/add-bonus', device_reg, express.urlencoded({extended: true}), bodyParser.json(), portal_ctrl.addBonus)
module.exports = router
