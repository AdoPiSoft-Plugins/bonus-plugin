'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('bonus_sessions', {
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
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('bonus_sessions')
  }
}
