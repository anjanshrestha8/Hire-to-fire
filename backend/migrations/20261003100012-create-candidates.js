"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("candidates", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cvLink: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      currentRound: {
        type: Sequelize.ENUM(
          "CV Screening",
          "Technical Interview",
          "HR Interview",
          "Completed"
        ),
        defaultValue: "CV Screening",
      },
      cvStatus: {
        type: Sequelize.ENUM("Pending", "Passed", "Failed"),
        defaultValue: "Pending",
      },
      techStatus: {
        type: Sequelize.ENUM("Pending", "Passed", "Failed"),
        defaultValue: "Pending",
      },
      hrStatus: {
        type: Sequelize.ENUM("Pending", "Passed", "Failed"),
        defaultValue: "Pending",
      },
      overallStatus: {
        type: Sequelize.ENUM("In Progress", "Rejected", "Selected"),
        defaultValue: "In Progress",
      },
      jobId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "jobs",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      technicalAssessment: {
        type: Sequelize.JSON,
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
    await queryInterface.dropTable("candidates");
  },
};
