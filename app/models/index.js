'use strict'

const core_models = require('@adopisoft/core/models')
const {machine} = require('@adopisoft/exports')
const BonusSession = require('./bonus_session_model.js')

const model_files = {
  BonusSession
}

exports.init = async () => {
  const {sequelize, models, Sequelize} = await core_models.getInstance()
  const db = await sequelize.getInstance()
  const machine_id = await machine.getId()

  var keys = Object.keys(model_files)
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i]
    models[k] = model_files[k](db, Sequelize)
  }

  var default_scope = {
    where: {machine_id}
  }

  models.BonusSession.addScope('default_scope', default_scope)
  models.BonusSession.belongsTo(models.MobileDevice)
  models.MobileDevice.hasMany(models.BonusSession)

  return {sequelize, Sequelize, models}
}
