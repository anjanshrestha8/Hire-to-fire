const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const ServiceError = require("../utils/serviceError");

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

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
};
