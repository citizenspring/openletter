'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('letters', 'title', { type: Sequelize.DataTypes.STRING(256) });
    await queryInterface.changeColumn('letters', 'slug', { type: Sequelize.DataTypes.STRING(256) });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('letters', 'title', { type: Sequelize.DataTypes.STRING(100) });
    await queryInterface.changeColumn('letters', 'slug', { type: Sequelize.DataTypes.STRING(100) });
  }
}
