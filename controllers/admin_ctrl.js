const config = require('../config.js')
const bonus_sessions = require('../services/bonus_sessions.js')
const core = require('../../core.js')
const {plugin_config} = core

exports.get = async (req, res, next) => {
  try {
    const cfg = await config.read()
    res.send(cfg)
  } catch (e) {
    next(e)
  }
}

exports.update = async (req, res, next) => {
  try {
    const params = req.body

    const prev_cfg = await config.read()
    if(prev_cfg.certain_amount){
      if (prev_cfg.certain_amount.bonus_limit_days !== params.certain_amount.bonus_limit_days) {
        await bonus_sessions.deleteAllCertainAmountBonus()
      }
    }
    
    await config.save(params)
    res.json({success: true})

  } catch (e) {
    next(e)
  }
}
