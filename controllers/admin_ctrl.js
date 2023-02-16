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
    const prev_cfg = await config.read()
    const params = req.body
    if (prev_cfg.certain_amount) {
      if (prev_cfg.certain_amount.bonus_limit_days !== params.certain_amount.bonus_limit_days) {
        await bonus_sessions.deleteAllCertainAmount()
      }
    }
    await config.save(params)
    res.json({success: true})
  } catch (e) {
    next(e)
  }
}

exports.uploadSound = async (req, res, next) => {
  try {
    const {dir} = req.body
    if (!req.files) return 'File is Empty'
    const {file} = req.files
    await config.saveSound(file, dir)
    res.json({success: true})
  } catch (e) {
    console.log(e)
    next(e)
  }
}

exports.deleteSound = async (req, res, next) => {
  try {
    const {dir, file_name} = req.body
    await config.deleteSound(dir, file_name)
    res.json({success: true})
  } catch (e) {
    console.log(e)
    next(e)
  }
}