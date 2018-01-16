export default {
  app: {
    name: 'Cards for Humanity - Development'
  },
  facebook: {
    clientID: process.env.FB_Dev_clientID,
    clientSecret: process.env.FB_Dev_clientSecret,
    callbackURL: process.env.FB_Dev_callbackURL
  },
  twitter: {
    clientID: process.env.TW_Dev_clientID,
    clientSecret: process.env.TW_Dev_clientSecret,
    callbackURL: process.env.TW_Dev_callbackURL
  },
  github: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://localhost:3000/auth/github/callback'
  },
  google: {
    clientID: process.env.Google_Dev_clientID,
    clientSecret: process.env.Google_Dev_clientSecret,
    callbackURL: process.env.Google_Dev_callbackURL
  }
};
