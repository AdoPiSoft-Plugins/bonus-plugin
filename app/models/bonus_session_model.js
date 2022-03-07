'use strict'
const model_name = 'BonusSession'
const table_name = 'bonus_sessions'
const opts = {
  created_at: 'created_at',
  updated_at: 'updated_at',
  underscored: true,
  timestamps: true,
  tableName: table_name
}

module.exports = (sequelize, Sequelize) => {
  return sequelize.define(model_name, {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      unique: true
    },
    machine_id: {
      type: Sequelize.STRING
    },
    mobile_device_id: {
      type: Sequelize.UUID
    },
    type: {
      type: Sequelize.STRING
    },
    bonus_mb: {
      type: Sequelize.INTEGER
    },
    bonus_minutes: {
      type: Sequelize.INTEGER
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    is_activated: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, opts)
}
