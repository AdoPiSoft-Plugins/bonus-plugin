const path = require('path')
const ini_file = 'bonus-plugin.ini'
const fs = require('fs')
const { promisify } = require('util')
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

const ini = require('ini')

exports.read = async () => {
  const ini_file_path =  path.join(process.env.APPDIR, 'plugins/bonus-plugin/config',  ini_file)
  let cfg = await readFile(ini_file_path, 'utf8').then(txt => {
    return ini.decode(txt)
  })
  if (cfg.certain_amount) {
    cfg.certain_amount.bonus_amount_needed = parseInt(cfg.certain_amount.bonus_amount_needed)
    cfg.certain_amount.bonus_mb = parseInt(cfg.certain_amount.bonus_mb)
    cfg.certain_amount.bonus_minutes = parseInt(cfg.certain_amount.bonus_minutes)
  }
  return cfg
}

exports.save = async (cfg) => {
  if (!cfg) return
  const ini_file_path = path.join(process.env.APPDIR, 'plugins/bonus-plugin/config', ini_file)
  await writeFile(ini_file_path, ini.stringify(cfg))

  return cfg
}
