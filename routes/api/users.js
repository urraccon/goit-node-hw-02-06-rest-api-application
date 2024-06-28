import express from "express";
import { MESSAGES, STATUS_CODES } from "../../utils/constants.js";
import {
  loginUserSchema,
  signupUserSchema,
  userEmailSchema,
} from "../../utils/schemas.js";
import User from "../../models/users.js";
import UsersController from "../../controller/users-controller.js";

const router = express.Router();

router.post("/signup", async (req, res, next) => {
  try {
    const body = req.body;
    const { error } = signupUserSchema.validate(body);

    if (error) {
      return res.status(STATUS_CODES.badRequest).json({
        message: error.details[0].message,
      });
    }

    const { email } = body;
    const isUsed = await User.findOne({ email });

    if (isUsed) {
      return res.status(STATUS_CODES.conflict).json({
        message: MESSAGES.notAvailable,
      });
    }

    const user = await UsersController.signup(body);

    res.status(STATUS_CODES.created).json({
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const body = req.body;
    const { error } = loginUserSchema.validate(body);

    if (error) {
      return res.status(STATUS_CODES.badRequest).json({
        message: error.details[0].message,
      });
    }

    const { email } = body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(STATUS_CODES.unauthorized).json({
        message: MESSAGES.invalidLogin,
      });
    }

    const token = await UsersController.login(body);

    if (token === "unverified") {
      return res.status(STATUS_CODES.unauthorized).json({
        message: MESSAGES.unverified,
      });
    }

    if (token === "mismatch") {
      return res.status(STATUS_CODES.unauthorized).json({
        message: MESSAGES.invalidLogin,
      });
    }

    res.status(STATUS_CODES.ok).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/logout", UsersController.validateToken, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await User.findOne({ _id });

    if (!user) {
      res.status(STATUS_CODES.unauthorized).json({
        message: MESSAGES.unauthorized,
      });
    }

    await User.findOneAndUpdate({ _id }, { token: null });

    res.status(STATUS_CODES.noContent).send();
  } catch (error) {
    next(error);
  }
});

router.get(
  "/current",
  UsersController.validateToken,
  async (req, res, next) => {
    try {
      const { _id } = req.user;
      const user = await User.findOne({ _id });

      if (!user) {
        res.status(STATUS_CODES.unauthorized).json({
          message: MESSAGES.unauthorized,
        });
      }

      res.status(STATUS_CODES.ok).json({
        email: user.email,
        subscription: user.subscription,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/avatars",
  [UsersController.validateToken, UsersController.uploadFile],
  (avatarURL, req, res, next) => {
    res.status(STATUS_CODES.ok).json({
      avatarURL,
    });
  }
);

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const token = req.params.verificationToken;
    const user = await UsersController.getUserByValidationToken(token);

    if (!user) {
      return res.status(STATUS_CODES.notFound).json({
        message: MESSAGES.userNotFound,
      });
    }

    const userId = user._id;

    await User.findByIdAndUpdate(userId, {
      verificationToken: null,
      verify: true,
    });

    res.status(STATUS_CODES.ok).json({
      message: MESSAGES.verificationPassed,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const body = req.body;
    const { error } = userEmailSchema.validate(body);

    if (error) {
      return res.status(STATUS_CODES.badRequest).json({
        message: error.details[0].message,
      });
    }

    const wasResent = UsersController.resendVerificationToken(body);

    if (!wasResent) {
      return res.status(STATUS_CODES.badRequest).json({
        message: MESSAGES.verified,
      });
    }

    res.status(STATUS_CODES.ok).json({
      message: MESSAGES.tokenSent,
    });
  } catch (error) {
    next(error);
  }
});
export default router;
