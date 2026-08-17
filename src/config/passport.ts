/*
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/UserModel";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.WEB_CLIENT_ID as string,
      clientSecret: process.env.WEB_SECRET_ID as string,
      callbackURL: "/api/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email returned from Google"));

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
            role: "user",
          });
        }

        return done(null, user); // real Mongoose user, not raw profile
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

export default passport;

*/