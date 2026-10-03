"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ai_screenings", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      candidateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "candidates",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      decision: {
        type: Sequelize.ENUM("Pass", "Fail"),
        allowNull: false,
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("ai_screenings");
  },
};
