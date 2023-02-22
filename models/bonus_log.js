const model_name = "BonusLog"
const table_name = "bonus_logs"

const opts = {
  created_at: 'created_at',
  updated_at: 'updated_at',
  timestamps: true,
  tableName: table_name
}

module.exports = (sequelize, Sequelize) => {
  return sequelize.define(model_name, {
    mobile_device_id: {
      type: Sequelize.INTEGER
    },
    machine_id: {
      type: Sequelize.STRING
    },
    customer_id: {
      type: Sequelize.INTEGER
    },
    text: {
      type: Sequelize.STRING,
      allowNull: false
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updated: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, opts)
}