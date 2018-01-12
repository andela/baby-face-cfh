import Game from '../models/game';

/**
 * Create new game handler function
 *
 * @param {any} req - The request object
 * @param {any} res - The response object
 * @returns {object} Success or error message
 */
const createGame = (req, res) => {
  if (req.decoded && req.params.id) {
    const game = new Game(req.body);
    game.userId = req.decoded.user.id;
    game.gameId = req.params.id;
    game.save((error) => {
      if (error) {
        return res.status(500).send({
          status: 'Error',
          message: 'An error occurred while saving game',
        });
      }
      return res.status(201).send({
        status: 'Success',
        message: 'Game has been saved'
      });
    });
  }
};

export default createGame;
