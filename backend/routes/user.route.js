const express = require("express");
const router = express.Router();
const { userController } = require("../controller/user.controller");

router.post("/register", userController.RegisterUser);
router.post("/login", userController.LoginUser);
router.post("/refresh", userController.RefreshToken);

module.exports = router;
