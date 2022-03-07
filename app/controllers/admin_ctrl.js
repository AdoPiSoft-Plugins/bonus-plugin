const config = require('../config.js')
const bonus_sessions = require('../services/bonus_sessions.js')

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
    await config.save(params)
    res.json({success: true})
  } catch (e) {
    next(e)
  }
}
