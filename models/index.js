'use strict'

const { dbi, machine_id } = require('../../core.js')
const BonusSession = require('./bonus_session.js')
const RoletaUser = require('./roleta_user.js')
const BonusLog = require('./bonus_log.js')

const model_files = {
  BonusSession,
  RoletaUser,
  BonusLog
}

exports.init = async () => {
  if (!dbi) return
  const {
    sequelize,
    Sequelize,
    models
  } = dbi

  const db = await sequelize.getInstance()

  var keys = Object.keys(model_files)
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i]
    models[k] = model_files[k](db, Sequelize)

    try {
      await models[k].sync({
        alter: true
      })
    } catch (e) {}
  }

  var default_scope = {
    where: {machine_id}
  }

  models.BonusSession.addScope('default_scope', default_scope)
  models.RoletaUser.addScope('default_scope', default_scope)
  models.BonusLog.addScope('default_scope', default_scope)

  models.BonusSession.belongsTo(models.MobileDevice)
  models.RoletaUser.belongsTo(models.MobileDevice)
  models.MobileDevice.hasMany(models.BonusSession)

  models.BonusLog.belongsTo(models.MobileDevice, { foreignKey: 'mobile_device_id' })

  return dbi
}
