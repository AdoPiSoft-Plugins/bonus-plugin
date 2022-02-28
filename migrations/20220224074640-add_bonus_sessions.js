'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'sessions',
      'is_bonus',
      {type: Sequelize.BOOLEAN, defaultValue: false}
    )
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'sessions',
      'is_bonus'
    )
  }
}
