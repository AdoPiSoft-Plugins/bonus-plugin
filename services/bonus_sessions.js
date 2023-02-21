const config = require('../config.js')
const moment = require('moment')
const core = require('../../core')

const { machine_id, dbi, sessions_manager, bandwidth_cfg} = core

exports.load = async (device, customer) => {
  let cfg = await config.read()
  const { enable_bonus, certain_amount } = cfg

  if (enable_bonus && certain_amount && certain_amount.enable) {
    exports.setDate(certain_amount)

    const { bonus_amount_needed } = certain_amount
    const total_amount = await exports.findTotalAmount(device.db_instance.id, customer)

    if (total_amount >= bonus_amount_needed) {
      cfg.can_play = true
    } else {
      cfg.can_play = false
    }
  } else {
    cfg.can_play = true
  }

  await config.save(cfg)
  return exports.list(device.db_instance.id, customer)
}

exports.list = async (device_id, customer) => {
  const { models } = dbi
  const cfg = await config.read()

  const bonus_sessions = await models.BonusSession.findAll({
    where: {
      mobile_device_id: device_id,
      is_activated: false,
      customer_id: customer.id
    }
  })

  return { bonus: bonus_sessions.map(item => item), config: cfg}
}

exports.setDate = (certain_amount) => {
  const {bonus_limit_days} = certain_amount
  if (bonus_limit_days === 'today') {
    exports.from_date = moment().startOf('day').toDate()
    exports.to_date = moment().endOf('day').toDate()
  } else if (bonus_limit_days === 'this_week') {
    exports.from_date = moment().startOf('isoWeek').startOf('day').toDate()
    exports.to_date = moment().endOf('isoWeek').toDate()
  } else if (bonus_limit_days === 'this_month') {
    exports.from_date = moment().startOf('month').toDate()
    exports.to_date = moment().endOf('month').toDate()
  }
}

exports.findTotalAmount = async (id, customer) => {
  const { models, Sequelize } = dbi
  const {Op} = Sequelize
  const sum = await models.Transaction.scope(['default_scope']).sum('amount', {
    where: {
      mobile_device_id: id,
      created_at: {
        [Op.gte]: exports.from_date,
        [Op.lte]: exports.to_date
      },
      customer_id: customer.id
    }
  })
  console.log('total_amount: ', sum)

  return sum
}

exports.collect = async (params, device, customer) => {
  const {bonus_mb, bonus_minutes, id, mobile_device_id} = params
  const { models } = dbi
  const bdw_cfg = bandwidth_cfg ? await bandwidth_cfg.read() : {}
  const { use_global } = bdw_cfg

  const type = bonus_mb > 0 && bonus_minutes > 0
    ? 'time_or_data'
    : bonus_mb > 0
      ? 'data'
      : bonus_minutes > 0 ? 'time' : null
  if (type) {
    const opts = {
      type,
      time_seconds: bonus_minutes * 60,
      data_mb: bonus_mb,
      allow_pause: false,
      use_global_bandwidth: use_global,
      customer_id: customer.id
    }

    await sessions_manager.createSession(device.db_instance.id, opts)
    await models.BonusSession.update({
      is_activated: true
    },
    {
      where: {
        id,
        mobile_device_id,
        customer_id: customer.id
      }
    })
  }
}

exports.addBonus = async (params, device, customer) => {
  const { models } = dbi
  const { bonus_minutes, bonus_mb } = params
  await models.BonusSession.create({
    machine_id,
    mobile_device_id: device.db_instance.id,
    bonus_mb,
    bonus_minutes,
    type: 'roleta_game',
    customer_id: customer.id
  })
}
