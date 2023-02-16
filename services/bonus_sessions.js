const cfg = require('../config.js')
const moment = require('moment')
const core = require('../../core')

const { machine_id, dbi, sessions_manager} = core

exports.load = async (device, customer) => {
  const { models, Sequelize} = dbi
  const { Op } = Sequelize
  const { enable_bonus, certain_amount, roleta_game } = await cfg.read()

  //clear database
  if (!certain_amount && !roleta_game) {
    exports.clearBonusDB()
  }

  //for certain amount challenge only
  if (enable_bonus && certain_amount && certain_amount.enable) {
    exports.setDate(certain_amount)

    const { bonus_amount_needed, bonus_mb, bonus_minutes } = certain_amount
    const total_amount = await exports.findTotalAmount(device.db_instance.id)

    // const exist_sessions = await models.BonusSession.findAll({
    //   where: {
    //     mobile_device_id: device.db_instance.id,
    //     type: 'certain_amount',
    //     customer_id: customer.id
    //   },
    // })

    // //destory bonus_session if activated and after the limitation date
    // await exist_sessions.map(async s => {
    //   const is_after_limitation_date = moment(exports.from_date).startOf('day').toDate() > moment(s.created_at).endOf('day').toDate() || false
    //   if (s.is_activated && is_after_limitation_date) {
    //     await s.destroy()
    //   }
    // })

    if (total_amount >= bonus_amount_needed) {
      const is_exist = await models.BonusSession.findOne({
        where: {
          mobile_device_id: device.db_instance.id,
          type: 'certain_amount',
          created_at: {
            [Op.gte]: exports.from_date,
            [Op.lte]: exports.to_date
          },
          customer_id: customer.id
        }
      })

      if (!is_exist) {
        await models.BonusSession.create({
          machine_id,
          type: 'certain_amount',
          mobile_device_id: device.db_instance.id,
          bonus_mb,
          bonus_minutes,
          customer_id: customer.id
        })
      }
    }
  }
  return exports.list(device.db_instance.id, customer)
}

exports.clearBonusDB = async () => {
  const { models } = dbi
  const bonus_sessions = await models.BonusSession.findAll({})
  const roleta_users = await models.RoletaUser.findAll({})

  if (bonus_sessions) {
    for(const b of bonus_sessions ) {
      await b.destroy()
    }
  }
  if (roleta_users) {
    for(const r of roleta_users) {
      await r.destroy()
    }
  }
}

exports.list = async (device_id, customer) => {
  const { models } = dbi
  const bonus_sessions = await models.BonusSession.findAll({
    where: {
      mobile_device_id: device_id,
      is_activated: false,
      customer_id: customer.id
    }
  })

  return bonus_sessions.map(item => item)
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

exports.findTotalAmount = async (id) => {
  const { models, Sequelize } = dbi
  const {Op} = Sequelize
  const sum = await models.Transaction.scope(['default_scope']).sum('amount', {
    where: {
      mobile_device_id: id,
      created_at: {
        [Op.gte]: exports.from_date,
        [Op.lte]: exports.to_date
      }
    }
  })
  console.log('total_amount: ', sum)

  return sum
}

exports.collect = async (params, device, customer) => {
  const {bonus_mb, bonus_minutes, id, mobile_device_id} = params
  const { models } = dbi

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