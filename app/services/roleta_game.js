const db = require('@adopisoft/core/models')
const {machine} = require('@adopisoft/exports')
const config = require('../config.js')
const moment = require('moment')

exports.get = async (db_device) => {
  const cfg = await config.read()
  const roleta_user = await exports.getRoletaUser(cfg, db_device)
  const left_spin = roleta_user ? cfg.roleta_game.max_spin - roleta_user.spinned : cfg.roleta_game.max_spin
  return left_spin >= 0 ? left_spin : 0
}

exports.update = async (db_device) => {
  const dbi = await db.getInstance()
  const machine_id = await machine.getId()

  const roleta_user = await dbi.models.RoletaUsers.findOne({
    where: {
      mobile_device_id: db_device.db_instance.id
    }
  })

  if (!roleta_user) {
    //create
    await dbi.models.RoletaUsers.create({
      machine_id,
      mobile_device_id: db_device.db_instance.id,
      spinned: 1
    })
  } else {
    //update
    await roleta_user.update({spinned: roleta_user.spinned + 1})
  }
}

exports.getRoletaUser = async (cfg, db_device) => {
  const dbi = await db.getInstance()
  let from_date
  let updated_roleta_user = null

  if (cfg.roleta_game.reset_spin_after === 'today') {
    from_date = moment().startOf('day').toDate()
  } else if (cfg.roleta_game.reset_spin_after === 'this_week') {
    from_date = moment().startOf('isoWeek').startOf('day').toDate()
  } else if (cfg.roleta_game.reset_spin_after === 'this_month') {
    from_date = moment().startOf('month').toDate()
  }

  const roleta_user = await dbi.models.RoletaUsers.findOne({
    where: {
      mobile_device_id: db_device.db_instance.id
    }
  })

  if (roleta_user && roleta_user.updated_at < from_date) {
    //reset user spin
    await roleta_user.update({spinned: 0})

    updated_roleta_user = await dbi.models.RoletaUsers.findOne({
      where: {
        mobile_device_id: db_device.db_instance.id
      }
    })
  }

  return !updated_roleta_user ? roleta_user : updated_roleta_user
}
