/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
  Question = mongoose.model('Question');

/**
 * Questions
 *
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @param {func} next - The next handler function
 * @param {any} id - The id of the question
 * @returns {any} The next handler function
 */
exports.question = function (req, res, next, id) {
  Question.load(id, (err, question) => {
    if (err) return next(err);
    if (!question) return next(new Error(`Failed to load question ${id}`));
    req.question = question;
    next();
  });
};


/**
 * Show a question
 *
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @returns {any} The question
 */
exports.show = function (req, res) {
  res.jsonp(req.question);
};

/**
 * List of questions
 *
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @returns {any} List of questions
 */
exports.all = function (req, res) {
  Question.find({
    official: true,
    numAnswers: {
      $lt: 3
    }
  })
    .select('-_id')
    .exec((err, questions) => {
      if (err) {
        res.render('error', {
          status: 500
        });
      } else {
        res.jsonp(questions);
      }
    });
};

/**
 * List of Questions (for Game class)
 *
 * @param {func} cb - Callback function
 * @param {string} regionId - Id of the region
 * @returns {any} The question
 */
exports.allQuestionsForGame = function (cb, regionId) {
  Question.find({
    official: true,
    regionId: regionId || 1,
    numAnswers: { $lt: 3 }
  }).select('-_id')
    .exec((err, questions) => {
      if (err) {
        console.log(err);
      } else {
        cb(questions);
      }
    });
};
