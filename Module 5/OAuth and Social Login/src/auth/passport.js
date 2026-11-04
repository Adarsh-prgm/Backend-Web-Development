'use strict';
// auth/passport.js — Google OAuth strategy

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { users, nextId } = require('../data');

// Match the stable Google subject first, then securely link a verified email,
// otherwise create a new member account.
async function verifyCallback(accessToken, refreshToken, profile, done) {
  try {
    const googleId = profile.id;
    const email = profile.emails[0].value;

    // 1. Returning OAuth user: Google's stable ID is the primary key.
    const existingGoogleUser = users.find((user) => user.googleId === googleId);
    if (existingGoogleUser) {
      return done(null, existingGoogleUser);
    }

    // 2. Existing local account: only link when Google confirms the email.
    const existingEmailUser = users.find((user) => user.email === email);
    if (existingEmailUser) {
      if (profile._json.email_verified === true) {
        existingEmailUser.googleId = googleId;
        return done(null, existingEmailUser);
      }

      return done(null, false);
    }

    // 3. Brand-new account: new OAuth users receive the least-privileged role.
    const newUser = {
      id: nextId(),
      googleId,
      email,
      name: profile.displayName,
      role: 'member',
    };
    users.push(newUser);
    return done(null, newUser);
  } catch (err) {
    return done(err);
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID     || 'test-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret',
      callbackURL:  '/auth/google/callback',
    },
    verifyCallback,
  ),
);

module.exports = { passport, verifyCallback };
