const config = require('../config.js')
const moment = require('moment')
const core = require('../../core.js')

const { machine_id, dbi} = core

exports.get = async (db_device, customer) => {
  const cfg = await config.read()
  const roleta_user = await exports.getRoletaUser(cfg, db_device, customer)
  const left_spin = roleta_user ? cfg.roleta_game.max_spin - roleta_user.spinned : cfg.roleta_game.max_spin
  return left_spin >= 0 ? left_spin : 0
}

exports.update = async (db_device, customer) => {
  const { models } = dbi

  const roleta_user = await models.RoletaUser.findOne({
    where: {
      mobile_device_id: db_device.db_instance.id,
      customer_id: customer.id
    }
  })

  if (!roleta_user) {
    //create
    await models.RoletaUser.create({
      machine_id,
      mobile_device_id: db_device.db_instance.id,
      spinned: 1,
      customer_id: customer.id
    })
  } else {
    //update
    await roleta_user.update({spinned: roleta_user.spinned + 1})
  }
}

exports.getRoletaUser = async (cfg, db_device, customer) => {

  const { models } = dbi
  let from_date
  let updated_roleta_user = null

  if (cfg.roleta_game.reset_spin_after === 'today') {
    from_date = moment().startOf('day').toDate()
  } else if (cfg.roleta_game.reset_spin_after === 'this_week') {
    from_date = moment().startOf('isoWeek').startOf('day').toDate()
  } else if (cfg.roleta_game.reset_spin_after === 'this_month') {
    from_date = moment().startOf('month').toDate()
  }

  const roleta_user = await models.RoletaUser.findOne({
    where: {
      mobile_device_id: db_device.db_instance.id,
      customer_id: customer.id
    }
  })

  if (roleta_user && roleta_user.updated_at < from_date) {
    //reset user spin
    await roleta_user.update({spinned: 0})

    updated_roleta_user = await models.RoletaUser.findOne({
      where: {
        mobile_device_id: db_device.db_instance.id,
        customer_id: customer.id
      }
    })
  }

  return !updated_roleta_user ? roleta_user : updated_roleta_user
}
