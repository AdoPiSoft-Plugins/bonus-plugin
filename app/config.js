const path = require('path')
const ini_file = 'bonus-plugin.ini'
const fs = require('fs')
const fsExtra = require('fs-extra')

const ini_parser = require('@adopisoft/core/utils/ini-parser.js')
const ini = require('ini')
const roleta_config = path.join(__dirname, '../', 'config', 'roleta_cfg.json')
const sounds_dir = '/assets/sounds'
const sounds_dir_path = path.join(__dirname, '../')

exports.read = async (spin_left) => {
  let cfg = await ini_parser(ini_file)
  const roleta_cfg = await fsExtra.readJson(roleta_config)

  if (cfg.certain_amount) {
    cfg.certain_amount.bonus_amount_needed = parseInt(cfg.certain_amount.bonus_amount_needed)
    cfg.certain_amount.bonus_mb = parseInt(cfg.certain_amount.bonus_mb)
    cfg.certain_amount.bonus_minutes = parseInt(cfg.certain_amount.bonus_minutes)
  }

  cfg = {
    enable_bonus: cfg.enable_bonus,
    certain_amount: cfg.certain_amount,
    roleta_game: roleta_cfg || null
  }

  if (cfg.roleta_game) {
    cfg.roleta_game.sounds = await exports.getSounds()
  }

  return cfg
}

exports.save = async (cfg) => {
  if (!cfg) return
  if (cfg.certain_amount) {
    const ini_file_path = path.join(process.env.APPDIR, 'config', ini_file)
    await fs.promises.writeFile(ini_file_path, ini.stringify(cfg))
  } else {
    await fs.writeFileSync(roleta_config, JSON.stringify(cfg))
  }
  return cfg
}

exports.deleteSound = async (dir, fname) => {
  await fsExtra.remove(path.join(sounds_dir_path, sounds_dir, dir, fname))
}

exports.saveSound = async (file, dir) => {
  const file_name = await exports.getFilename(dir)
  if (file_name.length > 0) {
    await fsExtra.remove(path.join(sounds_dir_path, sounds_dir, dir, file_name[0]))
  }
  //save
  await file.mv(path.join(sounds_dir_path, sounds_dir, dir, file.name))
}

exports.getFilename = async (dir) => {
  return await fsExtra.readdir(path.join(sounds_dir_path, sounds_dir, dir))
}

exports.getSounds = async () => {
  const spin_bg_sound = await fsExtra.readdir(path.join(sounds_dir_path, sounds_dir, 'spin'))
  const winner_sound = await fsExtra.readdir(path.join(sounds_dir_path, sounds_dir, 'win'))
  const loser_sound = await fsExtra.readdir(path.join(sounds_dir_path, sounds_dir, 'lose'))

  return {
    spin_bg_sound: spin_bg_sound[0],
    winner_sound: winner_sound[0],
    loser_sound: loser_sound[0]
  }
}
