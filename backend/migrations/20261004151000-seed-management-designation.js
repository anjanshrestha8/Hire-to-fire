"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("designation", [
      {
        title: "Management",
        description: "Default management designation",
        department: "Management",
        level: "Senior",
        status: "active",
        employees: 0,
        salary_range: null,
        base_salary: 0,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("designation", { title: "Management" });
  },
};
