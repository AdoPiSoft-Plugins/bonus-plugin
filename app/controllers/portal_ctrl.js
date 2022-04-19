const bonus_sessions = require('../services/bonus_sessions.js')
const config = require('../config.js')
const roleta_game = require('../services/roleta_game.js')

exports.init = async (req, res, next) => {
  try {
    const cfg = await config.read()
    const bonus = await bonus_sessions.load(req.device)
    res.json({bonus, config: cfg})
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
    await bonus_sessions.collect(params, req.device)
    res.json({success: true})
  } catch (e) {
    next(e)
  }
}

exports.getSpinLeft = async (req, res, next) => {
  try {
    const spin_left = await roleta_game.get(req.device)
    res.json({spin_left: spin_left})
  } catch (e) {
    next(e)
  }
}
exports.update = async (req, res, next) => {
  try {
    await roleta_game.update(req.device)
    res.json({success: true})
  } catch (e) {
    console.log(e)
    next(e)
  }
}

exports.addBonus = async (req, res, next) => {
  try {
    const params = req.body
    await bonus_sessions.addBonus(params, req.device)
    res.json({success: true})
  } catch (e) {
    console.log(e)
    next(e)
  }
}
