const core = require('../core.js')

const { machine_id, dbi } = core

exports.create = async (device_id, log_text) => {
  await dbi.models.BonusLog.create({
    machine_id,
    mobile_device_id: device_id,
    text: log_text
  })
}

exports.getPaginated = async (page, perPage, q) => {
  const offset = (page - 1) * perPage
  const limit = perPage
  const { Sequelize } = dbi
  const { Op } = Sequelize
  const order = [['created_at', 'DESC']]
  const where = {}

  if (q) {
    where[Op.or] = [
      Sequelize.where(Sequelize.fn('lower', Sequelize.col('mac_address')), 'LIKE', `%${q.toLowerCase()}%`),
      Sequelize.where(Sequelize.fn('lower', Sequelize.col('text')), 'LIKE', `%${q.toLowerCase()}%`)
    ]
  }

  const result = await dbi.models.BonusLog.scope(['default_scope']).findAndCountAll({
    where,
    limit,
    offset,
    order,
    include: [
      {
        model: dbi.models.MobileDevice,
        required: true
      }
    ],
    distinct: true
  })

  return {
    bonus_logs: result.rows,
    count: result.rows.length,
    total: result.count
  }

}

exports.clear = async () => {
  await dbi.models.BonusLog.scope(['default_scope']).destroy({})
}