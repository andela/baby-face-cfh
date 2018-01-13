import jwt from 'jsonwebtoken';

/**
 * Generic require login routing middleware
 *
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @param {any} next - The next route handler
 * @returns {object} Unauthorized response object
 */
const authenticate = (req, res, next) => {
  const token = req.body.token || req.query.token ||
    req.headers['x-access-token'];
  if (!token) {
    return res.status(401).send({
      status: 'Fail',
      message: 'Unauthenticated access, no token provided'
    });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.message.includes('token')) {
        return res.status(401).send({
          status: 'Error',
          message: 'Invalid token'
        });
      }
      return res.status(401).send({
        status: 'Error',
        message: err.message,
      });
    }
    req.decoded = decoded;
    return next();
  });
};

/**
 * User authorizations routing middleware
 */
const user = {
  hasAuthorization(req, res, next) {
    if (req.profile.id !== req.user.id) {
      return res.send(401, 'User is not authorized');
    }
    next();
  }
};

export { authenticate, user };
