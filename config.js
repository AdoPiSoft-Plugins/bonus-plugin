const path = require('path')
const fsExtra = require('fs-extra')
const randomstring = require('randomstring')

const sounds_dir = '/assets/sounds'
const sounds_dir_path = path.join(__dirname)
const img_dir_path = path.join(__dirname, '/assets/images/');

const core = require('../core.js')
const { plugin_config } = core

exports.read = async () => {
  const { plugins } = await plugin_config.read()
  let cfg = plugins.find(p => p.id === exports.id) || {}

  if (cfg.certain_amount) {
    cfg.certain_amount.bonus_amount_needed = parseInt(cfg.certain_amount.bonus_amount_needed)
  }

  cfg.roleta_game = cfg.roleta_game || null

  if (!cfg.hasOwnProperty('enable_bonus')){
    cfg.enable_bonus = false
  }

  if (cfg.roleta_game) {
    cfg.roleta_game.sounds = await exports.getSounds()
    cfg.roleta_game.max_spin = parseInt(cfg.roleta_game.max_spin)
    cfg.roleta_game.bonus_minutes = parseInt(cfg.roleta_game.bonus_minutes)
    if (cfg.roleta_game.prizes) {
      const convertedPrizes = []
      cfg.roleta_game.prizes.forEach((p) => {
        convertedPrizes.push(JSON.parse(p))        
      })
      cfg.roleta_game.prizes = convertedPrizes
    }else {
      cfg.roleta_game.prizes = []
    }
  }
  if (!cfg.flip_game) {
    // default config
    cfg.flip_game = {
      first_choice_text: 'Head',
      second_choice_text: 'Tail',
      chance_of_winning: '30%',
      min_mins_session: 5,
      min_mb_session: 5
    }
  }else {
    cfg.flip_game.min_mb_session = parseInt(cfg.flip_game.min_mb_session)
    cfg.flip_game.min_mins_session = parseInt(cfg.flip_game.min_mins_session)
  }

  return cfg
}

exports.save = async (cfg) => {
  if (!cfg) return
  await plugin_config.updatePlugin(exports.id, cfg)
}

exports.deleteSound = async (dir, fname) => {
  await fsExtra.remove(path.join(sounds_dir_path, sounds_dir, dir, fname))
}

exports.saveSound = async (file, dir) => {
  const file_names = await exports.getFilenames(dir)
  if (file_names.length > 0) {
    await fsExtra.remove(path.join(sounds_dir_path, sounds_dir, dir, file_names[0]))
  }
  //save
  await file.mv(path.join(sounds_dir_path, sounds_dir, dir, file.name))
}

exports.getFilenames = async (dir) => {
  try {
    return await fsExtra.readdir(path.join(sounds_dir_path, sounds_dir, dir))
  } catch (e) {
    console.log(e)
    return []
  }
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

exports.imageFilename = async (choice, game) => {
  const dir = game === 'flip_game' ? 'flip/' : 'roleta/';
  var default_icon;
  var asset_path;

  if (choice){
    default_icon = choice + '.png'
    asset_path = img_dir_path + dir + choice
    
  }else {
    // Main Game Icon
    default_icon = game + '_default.png'
    asset_path = img_dir_path + dir
  }
  const files = await exports.getFiles(asset_path)
  if(files.length > 1){
    return files.filter(f => f !== default_icon)[0]
  }else {
    return default_icon
  }
}
exports.saveIcon = async(file, choice, game) => {
  const curr_icon = await exports.imageFilename(choice, game)
  const dir = game === 'flip_game' ? 'flip/' : 'roleta/';

  var default_icon;
  var assetPath;
  
  if(choice){
    default_icon = choice + '.png'
    assetPath = img_dir_path + dir + choice
  } else {
    // Main Game Icon
    default_icon = game + '_default.png'
    assetPath = img_dir_path + dir
  }

  if(file.name === default_icon){
    var ext = path.extname(file.name)
    var rand_str = randomstring.generate({length: 8})
    file.name = `${path.basename(file.name).replace(ext, '')}-${rand_str}${ext}`
  }

  if(curr_icon !== default_icon){
    await fsExtra.remove(path.join(assetPath, curr_icon))
  }

  await file.mv(path.join(assetPath, file.name))
  return file.name
}
exports.restoreIcon = async (game, choice) => {
  const dir = game === 'flip_game' ? 'flip/' : 'roleta/';
  var default_icon;
  var asset_path;
  
  if (choice) {
    default_icon = choice + '.png'
    asset_path = img_dir_path + dir + choice
  } else {
    // Main Game Icon
    default_icon = game + '_default.png'
    asset_path = img_dir_path + dir
  }

  const files = await exports.getFiles(asset_path)
  const fn = files.filter(f => f !== default_icon)[0]
  if(fn) await fsExtra.remove(path.join(asset_path, fn))

  return default_icon
}

exports.getFiles = async (asset_path) => {
  try {
    const items = await fsExtra.readdir(asset_path)
    const filePromises = items.map(async item => {
      const itemPath = `${asset_path}/${item}`
      const stat = await fsExtra.stat(itemPath)
      if(stat.isFile()) {
        return item;
      }
      return null
    })
    return (await Promise.all(filePromises)).filter(file => file !== null)

  } catch (e) {
    console.log(e)
    return []
  }
}

exports.id = null