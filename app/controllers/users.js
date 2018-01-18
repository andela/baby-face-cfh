import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

import jwt from '../../config/jwt';

const User = mongoose.model('User');
const avatars = require('./avatars').all();

/**
 * Auth callback
 * @param {obj} req
 * @param {obj} res
 * @param {obj} next
 * @returns {void}
 */
exports.authCallback = (req, res) => {
  res.redirect('/#!/');
};

/**
 * Show login form
 * @param {obj} req
 * @param {obj} res
 * @returns {void}
 */
exports.signin = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signin?error=invalid');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Function to check if a user is signed in already
 *
 * @param {any} req - The request object
 * @param {any} res - The response object
 * @returns {func} Redirect to respective page
 */
exports.signup = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signup');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Logout
 * @param {obj} req
 * @param {obj} res
 * @returns {void}
 */
exports.signout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * Session
 * @param {obj} req
 * @param {obj} res
 * @param {obj} next
 * @returns {void}
 */
exports.session = (req, res) => {
  res.redirect('/');
};

/**
 * Check avatar - Confirm if the user who logged in via passport
 * already has an avatar. If they don't have one, redirect them
 * to our Choose an Avatar page.
 * @param {obj} req
 * @param {obj} res
 * @returns {void}
 */
exports.checkAvatar = (req, res) => {
  if (req.user && req.user._id) {
    User.findOne({
      _id: req.user._id
    })
      .exec((err, user) => {
        if (user.avatar !== undefined) {
          res.redirect('/#!/');
        } else {
          res.redirect('/#!/choose-avatar');
        }
      });
  } else {
    // If user doesn't even exist, redirect to /
    res.redirect('/');
  }
};

/**
 * Function to create a new user
 *
 * @param {any} req - The request object
 * @param {any} res - The response object
 * @returns {any} - token and redirect to home page
 */
exports.create = (req, res) => {
  if (req.body.name && req.body.password && req.body.email) {
    User.findOne({
      email: req.body.email
    }, (err, existingUser) => {
      if (!existingUser) {
        const user = new User(req.body);
        // Switch the user's avatar index to an actual avatar url
        user.avatar = avatars[user.avatar];
        user.provider = 'local';
        user.save((err, newUser) => {
          if (err) {
            return res.status(500).send({
              status: 'Error',
              message: err.errors,
            });
          }
          req.logIn(user, (err, next) => {
            if (err) return next(err);
            const token = jwt.generateToken(newUser);
            return res.status(201).send({
              status: 'Success',
              message: 'User created',
              data: {
                token,
              }
            });
          });
        });
      } else {
        return res.status(409).send({
          status: 'Fail',
          message: 'User already exist',
        });
      }
    });
  } else {
    return res.status(400).send({
      status: 'Fail',
      message: 'Incomplete signup details',
    });
  }
};

exports.login = (req, res) => {
  if (req.body.email && req.body.password) {
    User.findOne({
      email: req.body.email,
    }, (error, existingUser) => {
      if (error) {
        return res.status(500).send({
          status: 'Error',
          message: error,
        });
      }
      if (existingUser) {
        if (!existingUser.authenticate(req.body.password)) {
          return res.status(401).send({
            status: 'Fail',
            message: 'Incorrect email or password',
          });
        }
        return res.status(200).send({
          status: 'Success',
          message: 'User logged in',
          data: {
            token: jwt.generateToken(existingUser),
          }
        });
      }
      return res.status(401).send({
        status: 'Fail',
        message: 'Incorrect email or password',
      });
    });
  } else {
    return res.status(400).send({
      status: 'Fail',
      message: 'Incomplete login details',
    });
  }
};

/**
 * Assign avatar to user
 * @param {obj} req
 * @param {obj} res
 * @returns {void}
 */
exports.avatars = (req, res) => {
  // Update the current user's profile to include the avatar choice they've made
  if (req.user && req.user._id && req.body.avatar !== undefined &&
    /\d/.test(req.body.avatar) && avatars[req.body.avatar]) {
    User.findOne({
      _id: req.user._id
    })
      .exec((err, user) => {
        user.avatar = avatars[req.body.avatar];
        user.save();
      });
  }
  return res.redirect('/#!/app');
};

/**
 * Add donation
 * @param {obj} req
 * @param {obj} res
 * @returns {void}
 */
exports.addDonation = (req, res) => {
  if (req.body && req.user && req.user._id) {
    // Verify that the object contains crowdrise data
    if (req.body.amount && req.body.crowdrise_donation_id && req.body.donor_name) {
      User.findOne({
        _id: req.user._id
      })
        .exec((err, user) => {
        // Confirm that this object hasn't already been entered
          let duplicate = false;
          for (let i = 0; i < user.donations.length; i++) {
            if (user.donations[i].crowdrise_donation_id === req.body.crowdrise_donation_id) {
              duplicate = true;
            }
          }
          if (!duplicate) {
            console.log('Validated donation');
            user.donations.push(req.body);
            user.premium = 1;
            user.save();
          }
        });
    }
  }
  res.send();
};

/**
 * Show profile
 * @param {obj} req
 * @param {obj} res
 * @returns {void}
 */
exports.show = (req, res) => {
  const user = req.profile;
  res.render('users/show', {
    title: user.name,
    user
  });
};

/**
 * Send User
 * @param {obj} req
 * @param {obj} res
 * @returns {void}
 */
exports.me = (req, res) => {
  res.jsonp(req.user || null);
};

/**
 * Find user by id
 * @param {obj} req
 * @param {obj} res
 * @param {obj} next
 * @param {number} id
 * @returns {void}
 */
exports.user = (req, res, next, id) => {
  User
    .findOne({
      _id: id
    })
    .exec((err, user) => {
      if (err) return next(err);
      if (!user) return next(new Error(`Failed to load User ${id}`));
      req.profile = user;
      next();
    });
};

/**
 * @returns {json} user
 * @param {*} req
 * @param {*} res
 */
exports.search = (req, res) => {
  User
    .find({
      name: req.params.username
    }, (error, user) => {
      if (user.length < 1) {
        return res.status(404).send({
          message: `username ${req.params.username} is not found.`
        });
      }
      return res.status(200).json({ user: user[0].name, email: user[0].email });
    });
};
/**
 * @returns {json} mail
 * @param {*} req
 * @param {*} res
 */
exports.sendInvite = (req, res) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USERMAIL,
      pass: process.env.MAILPASSWORD
    }
  });
  const mailOptions = {
    from: 'Cards for Humanity',
    to: req.body.recipient,
    subject: 'Invitation to join a current game session',
    text: `Click this link to join game: ${req.body.gameLink}`,
    html: `<b>click this link to join game: ${req.body.gameLink}</b>`
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      res.status(400).json({
        message: 'An error occured while trying to send your mail'
      });
    } else {
      res.status(200).json({
        message: 'Message sent successfully'
      });
    }
  });
};

// Add Friends

exports.addFriend = (req, res) => {
  const { friendId, friendName, friendEmail } = req.body;
  const friendData = { friendId, friendName, friendEmail };
  const userId = req.decoded.id;
  User.findOneAndUpdate(
    {
      _id: userId
    },
    {
      $push: { friends: friendData }
    }
  ).then(() => {
    res.status(200).json({
      message: 'Friend Added Succesfully'
    });
  })
    .catch((error) => {
      res.status(500).json({
        error,
        message: 'Internal Server Error'
      });
    });
};

exports.getFirendsList = (req, res) => {
  const userId = req.decoded.id;

  User.find({
    _id: userId
  }).then((user) => {
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    return res.status(200).json(user[0].friends);
  })
    .catch((error) => {
      res.status(500).json({
        error,
        message: 'Internal Server Error'
      });
    });
};

exports.deleteFriend = (req, res) => {
  const userId = req.decoded.id;
  const { friendId } = req.params;
  User.findOneAndUpdate(
    {
      _id: userId
    },
    {
      $pull: { friends: { friendId } }
    },
    { multi: true }
  ).then(() => {
    res.status(200).json({
      message: 'Friend removed sucessfully!'
    });
  });
};

