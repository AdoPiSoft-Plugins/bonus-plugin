const config = require('../config.js')
const roleta_game = require('../services/roleta_game.js')

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
