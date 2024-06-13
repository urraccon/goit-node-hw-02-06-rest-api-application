import bcrypt from "bcrypt";
import User from "../models/users.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { MESSAGES, STATUS_CODES } from "../utils/constants.js";
import passport from "passport";

const secret = process.env.TOKEN_SECRET;

async function signup(body) {
  const { email, password } = body;
  const encryptedPass = await bcrypt.hash(password, 10);

  const newUser = new User({
    email,
    password: encryptedPass,
  });

  return User.create(newUser);
}

async function login(body) {
  const { email, password } = body;
  const user = await User.findOne({ email });
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return "";
  }

  const token = jwt.sign(
    { _id: user._id, email: user.email, subscription: user.subscription },
    secret,
    { expiresIn: "1h" }
  );

  await User.findOneAndUpdate({ email }, { token });

  return token;
}

function validateToken(req, res, next) {
  passport.authenticate("jwt", { session: false }, (error, user) => {
    if (error || !user) {
      return res.status(STATUS_CODES.unauthorized).json({
        message: MESSAGES.unauthorized,
      });
    }

    req.user = user;
    next();
  })(req, res, next);
}

const UsersController = {
  signup,
  login,
  validateToken,
};

export default UsersController;
