import validator from 'validator';

/**
 * Class representing validation controller functions
 *
 * @class ValidationController
 */
class ValidationController {
  /**
   * Function to validate signup inputs
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {func} next - Call to the next function
   * @returns {any} Object representing error status
   * @memberof ValidationController
   */
  static signupInputs(req, res, next) {
    if (!validator.isLength(req.body.name, { min: 6 }) ||
    !validator.isAlphanumeric(req.body.name)) {
      return res.status(400).send({
        status: 'Fail',
        message: 'Name must be atleast 6 alphanumeric characters',
      });
    }
    if (!validator.isEmail(req.body.email)) {
      return res.status(400).send({
        status: 'Fail',
        message: 'Invalid email address format',
      });
    }
    if (!validator.isLength(req.body.password, { min: 6 })) {
      return res.status(400).send({
        status: 'Fail',
        message: 'Password must be atleat 6 characters',
      });
    }
    next();
  }
}

export default ValidationController;
