'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('roleta_users', {
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
      spinned: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
      }
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('roleta_users')
  }
}
