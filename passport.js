import "dotenv/config";
import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import User from "./models/users.js";

const secret = process.env.TOKEN_SECRET;
const opts = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(opts, async function (payload, done) {
    try {
      const _id = payload._id;
      const user = await User.findOne({ _id });

      if (!user) {
        return done(new Error("User not found"));
      }

      return done(null, user);
    } catch (error) {
      done(error);
    }
  })
);
