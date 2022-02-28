const path = require('path')
const ini_file = 'bonus-plugin.ini'
const fs = require('fs')
const ini_parser = require('@adopisoft/core/utils/ini-parser.js')
const ini = require('ini')

exports.read = async () => {
  let cfg = await ini_parser(ini_file)
  if (cfg.certain_amount) {
    cfg.certain_amount.bonus_amount_needed = parseInt(cfg.certain_amount.bonus_amount_needed)
    cfg.certain_amount.bonus_mb = parseInt(cfg.certain_amount.bonus_mb)
    cfg.certain_amount.bonus_minutes = parseInt(cfg.certain_amount.bonus_minutes)
  }
  return cfg
}

exports.save = async (cfg) => {
  if (!cfg) return
  const ini_file_path = path.join(process.env.APPDIR, 'config', ini_file)
  await fs.promises.writeFile(ini_file_path, ini.stringify(cfg))
}