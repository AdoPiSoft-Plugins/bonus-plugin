const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const act = require('@adopisoft/app/middlewares/activation.js')
const bonus_ctrl = require('./controllers/bonus_ctrl.js')

router.get('/bonus-plugin', bonus_ctrl.get)
router.post('/bonus-plugin', act, express.urlencoded({
  extended: true
}), bodyParser.json(), bonus_ctrl.update)

module.exports = router
