const core = require('../../core.js')
const {machine_id, dbi, sessions_manager, plugin_config} = core

const config = require('../config.js')
const moment = require('moment')

exports.load = async (device) => {
  const {models, Sequelize} = dbi
  const {Op} = Sequelize
  const {bonus_type, enable_bonus, bonus_limit_days, bonus_amount_needed, bonus_mb, bonus_minutes} = await exports.getConfig()
  if (enable_bonus) {
    //for certain amount challenge only
    if (bonus_type === 'certain_amount') {
      exports.setDate(bonus_limit_days)
      const total_amount = await exports.findTotalAmount(device.db_instance.id)

      const exist_sessions = await models.BonusSession.findAll({
        where: {
          mobile_device_id: device.db_instance.id,
          type: bonus_type
        }
      })
      //destory activated bonus_session after the limitation date
      await exist_sessions.map(async s => {
        const is_true = moment(exports.from_date).startOf('day').toDate() > moment(s.created_at).endOf('day').toDate()
        if (s.is_activated && is_true) {
          await s.destroy()
        }
      })

      if (total_amount >= bonus_amount_needed) {
        const is_exist = await models.BonusSession.findOne({
          where: {
            mobile_device_id: device.db_instance.id,
            type: bonus_type,
            created_at: {
              [Op.gte]: exports.from_date,
              [Op.lte]: exports.to_date
            }
          }
        })

        if (!is_exist) {
          await models.BonusSession.create({
            machine_id,
            type: bonus_type,
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

exports.deleteAllCertainAmountBonus = async () => {
  const allBonus = await dbi.models.BonusSession.findAll({
    where: { type: 'certain_amount', is_activated: false}
  })
  for (const b in allBonus) {
    await allBonus[b].destroy()
  }
}

exports.list = async (device_id) => {
  const {models} = dbi
  const bonus_sessions = await models.BonusSession.findAll({
    where: {
      mobile_device_id: device_id,
      is_activated: false
    }
  })

  return bonus_sessions.map(item => item)
}

exports.setDate = (bonus_limit_days) => {
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
  const {models, Sequelize} = dbi
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
  const {models} = dbi
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

exports.getConfig = async () => {
  const {plugins} = await plugin_config.read()
  let cfg = plugins.find(p => p.id === config.id)
  if (cfg.bonus_type === 'certain_amount') {
    cfg.bonus_amount_needed = parseInt(cfg.bonus_amount_needed)
    cfg.bonus_mb = parseInt(cfg.bonus_mb)
    cfg.bonus_minutes = parseInt(cfg.bonus_minutes)
  }

  return cfg
}
