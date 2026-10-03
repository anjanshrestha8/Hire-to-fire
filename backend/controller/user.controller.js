const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const userController = {
    RegisterUser: async(req, res) => {
        try {
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
            department_id
          } = req.body;

          if (!email || !password || !first_name || !last_name) {
            return res.status(400).json({ message: "Missing required fields" });
          }

          const existingUser = await User.findOne({ where: { email } });
          if (existingUser) {
            return res.status(409).json({ message: "Email already exists" });
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
            department_id
          });

          res
            .status(201)
            .json({ message: "User created successfully", user: newUser });
        } catch (error) {
          console.error("Error creating user:", error);
          res
            .status(500)
            .json({ message: "Failed to create user", error: error });
        }
    },

    LoginUser: async(req, res) => {
      try {
        const { email, password } = req.body;

        const user = await User.findOne({where: { email }});

        const role = user.role;

        if(!user) throw new Error("Email not found");

        const decodedPassword = await bcrypt.compare(password, user.password_hash);
        if(!decodedPassword) throw new Error("Password doesn't match");

        const accessToken = jwt.sign({
          email,
          role,
          userId: user.id
        }, "sajakaccess", { expiresIn: "10min" });

        const refreshToken = jwt.sign({ email }, "sajakrefresh", { expiresIn: "1hr" });

        res.cookie("jwt", refreshToken, {
          httpOnly: true,
          sameSite: "Lax",
          secure: false,
          maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).send({token: accessToken, user: user});
      } catch (error) {
        return res.status(401).send({message: error.message});
      }
    },

    RefreshToken: async(req, res) => {
      console.log("req");
      try {
        console.log(req.cookie);
      } catch (error) {
        console.log(error)
      }
    }
}

const authMiddleware = {
    verifyToken: (req, res, next) => {
        try {
            let token = req.header('Authorization')?.replace('Bearer ', '') ||
                         req.header('x-auth-token');

            if (!token && req.cookies?.jwt) {
              token = req.cookies.jwt;
            }

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided, authorization denied'
                });
            }

            console.log("Token being verified:", token);
            console.log("Secret used:", "sajakaccess");
            console.log("Decoded (without verify):", jwt.decode(token));

            console.log({token});
            const decoded = jwt.verify(token, "sajakaccess");
            req.user = decoded;
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({
                success: false,
                message: 'Token is not valid'
            });
        }
    }
};

module.exports = {
    userController,
    authMiddleware
};
