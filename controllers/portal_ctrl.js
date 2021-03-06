const bonus_sessions = require('../services/bonus_sessions.js')

exports.init = async (req, res, next) => {
  try {
    const cfg = await bonus_sessions.getConfig()
    const bonus = await bonus_sessions.load(req.device)
    res.json({bonus, config: cfg})
  } catch (e) {
    next(e)
  }
}

exports.collect = async (req, res, next) => {
  try {
    const params = req.body
    const cfg = await bonus_sessions.getConfig()
    if (!cfg.enable_bonus) {
      return res.json({error: 'Bonus is temporarily disabled by the administrator.'})
    }
    await bonus_sessions.collect(params, req.device)
    res.json({success: true})
  } catch (e) {
    next(e)
  }
}
