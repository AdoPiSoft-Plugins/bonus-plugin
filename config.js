const path = require('path')
const fs = require('fs')
const fsExtra = require('fs-extra')
const randomstring = require('randomstring')

const cfg_path = path.join(__dirname, 'config', 'bonus_plugin.json')
const sounds_dir = '/assets/sounds'
const sounds_dir_path = path.join(__dirname)
const image_dir_path = path.join(__dirname, '/assets/images/');

exports.read = async () => {

  let cfg = (await fs.promises.readFile(cfg_path, "utf8")) || {};
  cfg = JSON.parse(cfg)

  if (cfg.certain_amount) {
    cfg.certain_amount.bonus_amount_needed = parseInt(cfg.certain_amount.bonus_amount_needed)
  }

  cfg.roleta_game = cfg.roleta_game || null

  if (cfg.roleta_game) {
    cfg.roleta_game.sounds = await exports.getSounds()
  }

  return cfg
}

exports.save = async (cfg) => {
  if (!cfg) return
  return await fs.promises.writeFile(cfg_path, JSON.stringify(cfg))
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

exports.imageFilename = async (type) => {
  const files = await fsExtra.readdir(image_dir_path + type)
  const default_icon = type + '.png'

  if(files.length > 1){
    return files.filter(f => f !== default_icon)[0]
  }else {
    return default_icon
  }
}

exports.saveIcon = async(file, type) => {
  const curr_icon = await exports.imageFilename(type)
  const default_icon = type + '.png'

  if(file.name === default_icon){
    var ext = path.extname(file.name)
    var rand_str = randomstring.generate({length: 8})
    file.name = `${path.basename(file.name).replace(ext, '')}-${rand_str}${ext}`
  }

  if(curr_icon !== default_icon){
    await fsExtra.remove(path.join(image_dir_path + type, curr_icon))
  }

  await file.mv(path.join(image_dir_path + type, file.name))
  return file.name
}
exports.restoreIcon = async (type) => {
  const files = await fsExtra.readdir(image_dir_path + type)
  const default_icon = type + '.png'

  const fn = files.filter(f => f !== default_icon)[0]
  if(fn) await fsExtra.remove(path.join(image_dir_path + type, fn))

  return default_icon
}


exports.id = null