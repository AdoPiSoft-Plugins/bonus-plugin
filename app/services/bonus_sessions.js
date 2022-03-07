const {machine, sessions_manager} = require('@adopisoft/exports')
const cfg = require('../config.js')
const moment = require('moment')
const db = require('@adopisoft/core/models')

exports.load = async (device) => {
  const {models, Sequelize} = await db.getInstance()
  const {Op} = Sequelize
  const {enable_bonus, certain_amount} = await cfg.read()
  if (enable_bonus) {
    //for certain amount challenge only
    if (certain_amount) {
      exports.setTime(certain_amount)

      const {bonus_amount_needed, bonus_mb, bonus_minutes} = certain_amount
      const total_amount = await exports.findTotalAmount(device.db_instance.id)
      const machine_id = await machine.getId()

      const exist_sessions = await models.BonusSession.findAll({
        where: {
          mobile_device_id: device.db_instance.id,
          type: 'certain_amount'
        }
      })
      //destory bonus_session if activated after the limitation date
      await exist_sessions.map(async s => {
        const is_true = moment(exports.to_date).startOf('day').toDate() > moment(s.created_at).endOf('day').toDate() || false
        if (s.is_activated && is_true) {
          await s.destroy()
        }
      })

      if (total_amount >= bonus_amount_needed) {
        const is_exist = await models.BonusSession.findOne({
          where: {
            mobile_device_id: device.db_instance.id,
            type: 'certain_amount',
            created_at: {
              [Op.gte]: exports.from_date,
              [Op.lte]: exports.to_date
            }
          }
        })

        if (!is_exist) {
          await models.BonusSession.create({
            machine_id,
            type: 'certain_amount',
            mobile_device_id: device.db_instance.id,
            bonus_mb,
            bonus_minutes
          })
        }
      }
    }
    return exports.list(device.db_instance.id)
  }
}

exports.list = async (device_id) => {
  const {models} = await db.getInstance()
  const bonus_sessions = await models.BonusSession.findAll({
    where: {
      mobile_device_id: device_id,
      is_activated: false
    }
  })

  return bonus_sessions.map(item => item)
}

exports.setTime = (certain_amount) => {
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
  const {models, Sequelize} = await db.getInstance()
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

exports.collect = async (params, device) => {
  const {models} = await db.getInstance()
  const {bonus_mb, bonus_minutes, id, mobile_device_id} = params

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
      customer_id: device.customer_id
    }

    await sessions_manager.createSession(device.db_instance.id, opts)
    await models.BonusSession.update({
      is_activated: true
    },
    {
      where: {
        id,
        mobile_device_id
      }
    })
  }
}
