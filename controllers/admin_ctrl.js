const config = require('../config.js')
const bonus_sessions = require('../services/bonus_sessions.js')
const core = require('../../core.js')
const {plugin_config} = core

exports.get = async (req, res, next) => {
  try {
    const cfg = await bonus_sessions.getConfig()
    res.send(cfg)
  } catch (e) {
    next(e)
  }
}

exports.update = async (req, res, next) => {
  try {
    const params = req.body

    const prev_cfg = await bonus_sessions.getConfig()
    if (prev_cfg.bonus_limit_days !== params.bonus_limit_days) {
      await bonus_sessions.deleteAllCertainAmountBonus()
    }

    await plugin_config.updatePlugin(config.id, params)
    res.json({success: true})
  } catch (e) {
    next(e)
  }
}
