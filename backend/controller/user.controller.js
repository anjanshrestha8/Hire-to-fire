const jwt = require("jsonwebtoken");
const ServiceError = require("../utils/serviceError");
const userService = require("../services/user.service");

const userController = {
  RegisterUser: async (req, res) => {
    try {
      const result = await userService.registerUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json(error.body);
      }
      console.error("Error creating user:", error);
      res
        .status(500)
        .json({ message: "Failed to create user", error: error });
    }
  },

  LoginUser: async (req, res) => {
    try {
      const { accessToken, user, refreshToken } = await userService.loginUser(
        req.body
      );

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "Lax",
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).send({ token: accessToken, user: user });
    } catch (error) {
      return res.status(401).send({ message: error.message });
    }
  },

  createSuperAdmin: async (req, res) => {
    try {
      const result = await userService.createSuperAdmin(req.body);
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json(error.body);
      }
      console.error("Error creating super admin:", error);
      return res
        .status(500)
        .json({ error: error.message || "Something went wrong." });
    }
  },

  RefreshToken: async (req, res) => {
    userService.refreshToken(req);
  },
};

const authMiddleware = {
  verifyToken: (req, res, next) => {
    try {
      let token =
        req.header("Authorization")?.replace("Bearer ", "") ||
        req.header("x-auth-token");

      if (!token && req.cookies?.jwt) {
        token = req.cookies.jwt;
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "No token provided, authorization denied",
        });
      }

      console.log("Token being verified:", token);
      console.log("Secret used:", "sajakaccess");
      console.log("Decoded (without verify):", jwt.decode(token));

      console.log({ token });
      const decoded = jwt.verify(token, "sajakaccess");
      req.user = decoded;
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(401).json({
        success: false,
        message: "Token is not valid",
      });
    }
  },

};

module.exports = {
  userController,
  authMiddleware,
};
