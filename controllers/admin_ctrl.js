const config = require('../config.js')
const roleta_game = require('../services/roleta_game.js')
const bonus_logger = require('../bonus_logger.js')

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
    await config.save(req.body)
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

exports.resetSpin = async (req, res, next) => {
  try {
    await roleta_game.resetSpin()
    res.json({success: true})
  } catch (e) {
    console.log(e)
    next(e)
  }
}

exports.getBonusLogs = async (req, res, next) => {
  try {
    const { page, q, perPage} = req.query

    let n_page = parseInt(page || 0)
    n_page = n_page >= 0 ? n_page : 0
    const n_perPage = (perPage || 25) * 1

    const bonus_logs = await bonus_logger.getPaginated(n_page, n_perPage, q)
    res.json(bonus_logs)
  } catch (e) {
    console.log(e)
    next(e)
  }
}

exports.clearLogs = async (req, res, next) => {
  try {
    await bonus_logger.clear()
    res.json({})
  } catch (e) {
    console.log(e)
    next(e)
  }
}
