
const core = require('../core.js')
const { middlewares, router } = core

const admin_ctrl = require('./controllers/admin_ctrl.js')
const portal_ctrl = require('./controllers/portal_ctrl.js')
const fileUpload = require('express-fileupload')

const { bodyParser, express, device_reg, act, current_customer, ipv4 } = middlewares

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

router.post('/bonus-plugin-settings/roleta-game/reset-spin', admin_ctrl.resetSpin)
router.get('/bonus-plugin-settings/get-bonus-logs', admin_ctrl.getBonusLogs)
router.delete('/bonus-plugin-settings/clear-bonus-logs', admin_ctrl.clearLogs)
router.get('/bonus-plugin/portal/all', ipv4, device_reg, current_customer, portal_ctrl.init)
router.post('/bonus-plugin/portal/collect', ipv4, device_reg, current_customer,
  express.urlencoded({
    extended: true
  }), bodyParser.json(), portal_ctrl.collect)

router.get('/bonus-plugin/portal/roleta-game/spin-left', ipv4, device_reg, current_customer, portal_ctrl.getSpinLeft)
router.post('/bonus-plugin/portal/roleta-game/update', ipv4,  device_reg, current_customer, express.urlencoded({extended: true}), bodyParser.json(), portal_ctrl.update)
router.post('/bonus-plugin/portal/roleta-game/add-bonus', ipv4, device_reg, current_customer, express.urlencoded({extended: true}), bodyParser.json(), portal_ctrl.addBonus)

module.exports = router
