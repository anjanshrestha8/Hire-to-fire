const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const ServiceError = require("../utils/serviceError");
const { Team, Designation } = require("../models/index.modal");

async function registerUser(body) {
  const {
    email,
    password,
    first_name,
    last_name,
    avatar_url,
    role,
    status,
    phoneNumber,
    designation_id,
    department_id,
  } = body;

  if (!email || !password || !first_name || !last_name) {
    throw new ServiceError(400, { message: "Missing required fields" });
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ServiceError(409, { message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email,
    password_hash: hashedPassword,
    first_name,
    last_name,
    avatar_url,
    role,
    status,
    phoneNumber,
    designation_id,
    department_id,
  });

  return { message: "User created successfully", user: newUser };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ where: { email } });

  const role = user.role;

  if (!user) throw new Error("Email not found");

  const decodedPassword = await bcrypt.compare(password, user.password_hash);
  if (!decodedPassword) throw new Error("Password doesn't match");

  const accessToken = jwt.sign(
    {
      email,
      role,
      userId: user.id,
    },
    "sajakaccess",
    { expiresIn: "10min" }
  );

  const refreshToken = jwt.sign({ email }, "sajakrefresh", { expiresIn: "1hr" });

  return { accessToken, user, refreshToken };
}

function refreshToken(req) {
  console.log("req");
  try {
    console.log(req.cookie);
  } catch (error) {
    console.log(error);
  }
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
  registerUser,
  loginUser,
  refreshToken,
  createSuperAdmin,
};
