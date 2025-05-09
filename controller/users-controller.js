import bcrypt from "bcrypt";
import User from "../models/users.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { MESSAGES, STATUS_CODES } from "../utils/constants.js";
import passport from "passport";
import gravatar from "gravatar";
import multer from "multer";
import Jimp from "jimp";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { sendFromSendGrid } from "../utils/sendEmail.js";

const secret = process.env.TOKEN_SECRET;
const upload = multer({ dest: "tmp" }).single("avatar");

async function signup(body) {
  const { email, password } = body;
  const encryptedPass = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const token = uuidv4();

  const newUser = new User({
    email,
    password: encryptedPass,
    avatarURL,
    verificationToken: token,
  });

  sendFromSendGrid(email, token);

  return User.create(newUser);
}

async function login(body) {
  const { email, password } = body;
  const user = await User.findOne({ email });
  const isVerified = user.verify;

  if (!isVerified) {
    return "unverified";
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return "mismatch";
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

function uploadFile(req, res, next) {
  try {
    upload(req, res, async function (error) {
      if (error) {
        next(error);
      }

      const avatar = await Jimp.read(req.file.path);
      avatar.resize(250, 250).quality(80).write(req.file.path);

      const userId = req.user.id;
      const uploadDate = Date.now();
      const avatarId = `${userId}-${uploadDate}`;
      const filetype = req.file.originalname.split(".")[1];
      const newFilename = `avatar-${avatarId}.${filetype}`;
      const newPath = path.join("public", "avatars", newFilename);
      await fs.rename(req.file.path, newPath);

      const avatarURL = `/avatars/${newFilename}`;
      await User.findByIdAndUpdate(userId, { avatarURL });

      next(avatarURL);
    });
  } catch (error) {
    next(error);
  }
}

async function getUserByValidationToken(token) {
  return await User.findOne({ verificationToken: token });
}

async function resendVerificationToken(body) {
  const { email } = body;
  const user = await User.findOne({ email });
  const isVerified = user.verify;

  if (isVerified) {
    return false;
  }

  const token = uuidv4();

  await User.findOneAndUpdate({ email }, { token });
  sendFromSendGrid(email, token);

  return true;
}

const UsersController = {
  signup,
  login,
  validateToken,
  uploadFile,
  getUserByValidationToken,
  resendVerificationToken,
};

export default UsersController;
