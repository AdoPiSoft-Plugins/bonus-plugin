const bonus_sessions = require('../services/bonus_sessions.js')
const config = require('../config.js')
const roleta_game = require('../services/roleta_game.js')

exports.init = async (req, res, next) => {
  try {
    let { device, customer } = req

    customer = customer || {id: null} 
    const bonus = await bonus_sessions.load(device, customer)
    res.json(bonus)
  } catch (e) {
    next(e)
  }
}

exports.collect = async (req, res, next) => {
  try {
    const params = req.body
    const cfg = await config.read()
    if (!cfg.enable_bonus) {
      return res.json({error: 'Bonus is temporarily disabled by the administrator.'})
    }

    let { device, customer } = req
    customer = customer || {id: null} 
    await bonus_sessions.collect(params, device, customer)
    res.json({success: true})
  } catch (e) {
    next(e)
  }
}

exports.getSpinLeft = async (req, res, next) => {
  try {
    let { device, customer } = req
    customer = customer || {id: null} 
    const spin_left = await roleta_game.get(device, customer)
    res.json({spin_left: spin_left})
  } catch (e) {
    next(e)
  }
}
exports.update = async (req, res, next) => {
  try {
    let { device, customer } = req
    customer = customer || {id: null} 
    await roleta_game.update(device, customer)
    res.json({success: true})
  } catch (e) {
    console.log(e)
    next(e)
  }
}

exports.addBonus = async (req, res, next) => {
  try {
    let { device, customer } = req
    customer = customer || {id: null} 
    const params = req.body
    await bonus_sessions.addBonus(params, device, customer)
    res.json({success: true})
  } catch (e) {
    console.log(e)
    next(e)
  }
}

exports.resetSpin = async (req, res, next) => {
  try {
    await roleta_game.resetSpin()
    res.json({success: true})
  } catch (e) {
    console.log(e)
    next(e)
  }
}