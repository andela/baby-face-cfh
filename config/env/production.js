export default {
  app: {
    name: 'Cards for Humanity - Development'
  },
  facebook: {
    clientID: process.env.FACEBOOK_PROD_CLIENTID,
    clientSecret: process.env.FACEBOOK_PROD_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_PROD_CALLBACK_URL
  },
  twitter: {
    clientID: process.env.TWITTER_PROD_CLIENTID,
    clientSecret: process.env.TWITTER_PROD_CLIENT_SECRET,
    callbackURL: process.env.TWITTER_PROD_CALLBACK_URL
  },
  github: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://localhost:3000/auth/github/callback'
  },
  google: {
    clientID: process.env.GOOGLE_PROD_CLIENTID,
    clientSecret: process.env.GOOGLE_PROD_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_PROD_CALLBACK_URL
  }
};
