import moment from 'moment';
import Game from '../models/game';

const guestNames = [
  'Disco Potato',
  'Silver Blister',
  'Insulated Mustard',
  'Funeral Flapjack',
  'Toenail',
  'Urgent Drip',
  'Raging Bagel',
  'Aggressive Pie',
  'Loving Spoon',
  'Swollen Node',
  'The Spleen',
  'Dingle Dangle'
];

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

export const getUserGamesHistory = (req, res) => {
  const userId = req.decoded.user.id;
  Game.find({ userId }, (err, userGamesHistory) => {
    if (err) {
      return res.status(500).send({
        status: 'Error',
        message: 'An error occured while fetching the games history',
      });
    }
    userGamesHistory = userGamesHistory.map((gameHistory) => {
      gameHistory = gameHistory.toObject();
      return {
        ...gameHistory,
        createdAt: moment(gameHistory.createdAt).format('MMM D, h:mm a'),
      };
    });
    return res.status(200).send({
      status: 'Success',
      userGamesHistory
    });
  });
};

export const getLeaderBoard = (req, res) => {
  Game.find({}, 'winner', (error, gamesHistory) => {
    if (error) {
      return res.status(500).send({
        status: 'Error',
        message: 'An error occured while fetching the leaderboard',
      });
    }

    // extract game winners names and count
    const gameWinners = gamesHistory.map(game => game.winner);
    const leaderboard = {};
    gameWinners.forEach((winner) => {
      if (leaderboard[winner]) {
        leaderboard[winner] += 1;
        return;
      }
      leaderboard[winner] = 1;
    });

    // delete guest names from leader board
    Object.keys(Object.assign(leaderboard)).forEach((key) => {
      if (guestNames.includes(key)) {
        delete leaderboard[key];
      }
    });

    return res.status(200).send({
      status: 'Success',
      leaderboard,
    });
  });
};

export default createGame;
