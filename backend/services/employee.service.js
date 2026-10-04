const Employee = require("../models/employee");
const User = require("../models/user");
const sequelize = require("../config/Database/dbConn");
const sendMail = require("../config/mailConfig");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { Team, Designation } = require("../models/index.modal");
const ServiceError = require("../utils/serviceError");

async function addEmployee(body) {
  const t = await sequelize.transaction();

  try {
    const {
      email,
      password,
      first_name,
      last_name,
      role,
      department_id,
      designation_id,
      hire_date,
      phone,
      address,
      emergency_contact,
      employment_type,
    } = body;

    const password_hash = await bcrypt.hash(password, 10);

    console.log(password_hash);

    const newUser = await User.create(
      {
        email,
        password_hash,
        first_name,
        last_name,
        role: role || "employee",
        phoneNumber: phone,
        department_id,
        designation_id,
      },
      { transaction: t }
    );

    const employee_code = `EMP${newUser.id}`;

    const newEmployee = await Employee.create(
      {
        user_id: newUser.id,
        department_id,
        designation_id,
        employee_code,
        hire_date,
        phoneNumber: phone,
        address,
        emergency_contact,
        employment_type,
      },
      { transaction: t }
    );

    await t.commit();

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to Our Company - Your Account Details",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Welcome to Our Team, ${first_name}!</h2>
              <p>Your employee account has been successfully created.</p>

              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #555;">Your Login Credentials:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p><strong>Employee Code:</strong> ${employee_code}</p>
              </div>

              <p style="color: #666;">
                Please log in and change your password immediately for security reasons.
              </p>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">
                  This is an automated message. Please do not reply to this email.
                </p>
              </div>
            </div>
          `,
      };

      await sendMail(mailOptions);
      console.log("Welcome email sent successfully to:", email);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    return {
      message: "Employee added successfully and welcome email sent",
      user: newUser,
      employee: newEmployee,
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

async function getEmployee() {
  const userData = await User.findAll({
    include: [
      {
        model: Team,
        as: "department",
        attributes: ["id", "name", "description", "status"],
      },
      {
        model: Designation,
        as: "designation",
        attributes: ["id", "title", "department", "level", "status"],
      },
    ],
    attributes: [
      "id",
      "first_name",
      "last_name",
      "email",
      "role",
      "status",
      "phoneNumber",
      "createdAt",
    ],
  });

  console.log("UserData", userData);

  return { users: userData };
}

async function createSuperAdmin(body) {
  const { email, password, first_name, last_name, phone } = body;

  if (!email || !password || !first_name || !last_name) {
    throw new ServiceError(400, {
      error: "email, password, first_name, and last_name are required",
    });
  }

  const resolvedPhone = phone;
  if (!resolvedPhone) {
    throw new ServiceError(400, { error: "phone is required" });
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ServiceError(409, { error: "Email already exists" });
  }

  const managementDept = await Team.findOne({
    where: { name: "Management" },
  });
  if (!managementDept) {
    throw new ServiceError(500, {
      error: "Default Management department not found. Please run migrations.",
    });
  }

  const managementDesignation = await Designation.findOne({
    where: { title: "Management" },
  });
  if (!managementDesignation) {
    throw new ServiceError(500, {
      error: "Default Management designation not found. Please run migrations.",
    });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email,
    password_hash,
    first_name,
    last_name,
    role: "super_admin",
    phoneNumber: resolvedPhone,
    department_id: managementDept.id,
    designation_id: managementDesignation.id,
  });

  return {
    message: "Super admin created successfully",
    user: {
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      role: newUser.role,
      status: newUser.status,
      phoneNumber: newUser.phoneNumber,
      department_id: newUser.department_id,
      designation_id: newUser.designation_id,
    },
  };
}

module.exports = {
  addEmployee,
  getEmployee,
  createSuperAdmin,
};
