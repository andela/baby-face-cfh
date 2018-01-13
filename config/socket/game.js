import async from 'async';
import _ from 'underscore';
import questions from '../../app/controllers/questions';
import answers from '../../app/controllers/answers';

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
 * 
 * 
 * @class Game
 */
class Game {
  /**
  * Game function
  *
  * @param {any} gameID - The Id of the game
  * @param {any} io - The socket instance
  * @returns {any} Game
  */
  constructor(gameID, io) {
    this.io = io;
    this.gameID = gameID;
    this.players = []; // Contains array of player models
    this.table = []; // Contains array of {card: card, player: player.id}
    this.winningCard = -1; // Index in this.table
    this.gameWinner = -1; // Index in this.players
    this.winnerAutopicked = false;
    this.czar = -1; // Index in this.players
    this.playerMinLimit = 3;
    this.playerMaxLimit = 12;
    this.pointLimit = 5;
    this.state = 'awaiting players';
    this.round = 0;
    this.questions = null;
    this.answers = null;
    this.curQuestion = null;
    this.timeLimits = {
      stateChoosing: 21,
      stateJudging: 16,
      stateResults: 6
    };
    // setTimeout ID that triggers the czar judging state
    // Used to automatically run czar judging if players don't pick
    // before time limit
    // Gets cleared if players finish picking before time limit.
    this.choosingTimeout = 0;
    // setTimeout ID that triggers the result state
    // Used to automatically run result if czar doesn't decide before time limit
    // Gets cleared if czar finishes judging before time limit.
    this.judgingTimeout = 0;
    this.resultsTimeout = 0;
    this.guestNames = guestNames.slice();
  }

  /**
   * @returns {void}
   *
   * @memberof Game
   */
  payload = () => {
    const players = [];
    this.players.forEach((player) => {
      players.push({
        hand: player.hand,
        points: player.points,
        username: player.username,
        avatar: player.avatar,
        premium: player.premium,
        socketID: player.socket.id,
        color: player.color
      });
    });
    return {
      gameID: this.gameID,
      players,
      czar: this.czar,
      state: this.state,
      round: this.round,
      gameWinner: this.gameWinner,
      winningCard: this.winningCard,
      winningCardPlayer: this.winningCardPlayer,
      winnerAutopicked: this.winnerAutopicked,
      table: this.table,
      pointLimit: this.pointLimit,
      curQuestion: this.curQuestion
    };
  }


  /**
   *
   * @returns {void}
   * @param {string} msg
   *
   * @memberOf Game
   */
  sendNotification = (msg) => {
    this.io.sockets.in(this.gameID).emit('notification', { notification: msg });
  }


  /**
   *
   *
   * @returns {void}
   * @memberOf Game
   */
  assignPlayerColors = () => {
    this.players.forEach((player, index) => {
      player.color = index;
    });
  }

  assignGuestNames = () => {
    this.players.forEach((player) => {
      if (player.username === 'Guest') {
        const randIndex = Math.floor(Math.random() * this.guestNames.length);
        [player.username] = this.guestNames.splice(randIndex, 1);
        if (!this.guestNames.length) {
          this.guestNames = guestNames.slice();
        }
      }
    });
  }

  prepareGame = () => {
    this.state = 'game in progress';
    this.io.sockets.in(this.gameID).emit(
      'prepareGame',
      {
        playerMinLimit: this.playerMinLimit,
        playerMaxLimit: this.playerMaxLimit,
        pointLimit: this.pointLimit,
        timeLimits: this.timeLimits
      }
    );
    async.parallel(
      [
        this.getQuestions,
        this.getAnswers
      ],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        [this.questions, this.answers] = results;

        this.startGame();
      }
    );
  }

  startGame = () => {
    // console.log(this.gameID, this.state);
    this.shuffleCards(this.questions);
    this.shuffleCards(this.answers);
    this.stateChoosing();
  }

  sendUpdate = () => {
    this.io.sockets.in(this.gameID).emit('gameUpdate', this.payload());
  }

  czarHasPickedARandomCard = () => {
    this.state = 'waiting for players to pick';
    this.choosingTimeout = setTimeout(() => {
      this.stateJudging();
    }, this.timeLimits.stateChoosing * 1000);
    this.sendUpdate();
  }

  stateChoosing = () => {
    this.state = 'game in progress';
    this.table = [];
    this.winningCard = -1;
    this.winningCardPlayer = -1;
    this.winnerAutopicked = false;
    this.curQuestion = this.questions.pop();
    if (!this.questions.length) {
      this.getQuestions((err, data) => {
        this.questions = data;
      });
    }
    this.round += 1;
    this.dealAnswers();
    // Rotate card czar
    if (this.czar >= this.players.length - 1) {
      this.czar = 0;
    } else {
      this.czar += 1;
    }
    this.sendUpdate();
  }

  selectFirst = () => {
    if (this.table.length) {
      this.winningCard = 0;
      const winnerIndex = this._findPlayerIndexBySocket(this.table[0].player);
      this.winningCardPlayer = winnerIndex;
      this.players[winnerIndex].points += 1;
      this.winnerAutopicked = true;
      this.stateResults();
    } else {
      // console.log(this.gameID,'no cards were picked!');
      this.stateChoosing();
    }
  }

  stateJudging = () => {
    this.state = 'waiting for czar to decide';
    // console.log(self.gameID,self.state);

    if (this.table.length <= 1) {
      // Automatically select a card if only one card was submitted
      this.selectFirst();
    } else {
      this.sendUpdate();
      this.judgingTimeout = setTimeout(() => {
        // Automatically select the first submitted card when time runs out.
        this.selectFirst();
      }, this.timeLimits.stateJudging * 1000);
    }
  }

  stateResults = () => {
    this.state = 'winner has been chosen';
    console.log(this.state);
    // TODO: do stuff
    let winner = -1;
    for (let i = 0; i < this.players.length; i += 1) {
      if (this.players[i].points >= this.pointLimit) {
        winner = i;
      }
    }
    this.sendUpdate();
    this.resultsTimeout = setTimeout(() => {
      if (winner !== -1) {
        this.stateEndGame(winner);
      } else {
        this.stateChoosing();
      }
    }, this.timeLimits.stateResults * 1000);
  }

  stateEndGame = (winner) => {
    this.state = 'game ended';
    this.gameWinner = winner;
    const players = this.players.map(player => player.username);
    const gameSessionData = {
      gameId: this.gameID,
      players,
      winner: this.players[this.gameWinner].username,
      round: this.round,
    };
    this.sendUpdate();
    this.io.sockets.in(this.gameID).emit('saveGameSession', gameSessionData);
  }

  stateDissolveGame = () => {
    this.state = 'game dissolved';
    this.sendUpdate();
  }

  getQuestions = (cb) => {
    questions.allQuestionsForGame((data) => {
      cb(null, data);
    });
  }

  getAnswers = (cb) => {
    answers.allAnswersForGame((data) => {
      cb(null, data);
    });
  }

  shuffleCards = (cards) => {
    let shuffleIndex = cards.length,
      temp,
      randNum;

    while (shuffleIndex) {
      randNum = Math.floor(Math.random() * (shuffleIndex -= 1));
      temp = cards[randNum];
      cards[randNum] = cards[shuffleIndex];
      cards[shuffleIndex] = temp;
    }

    return cards;
  }

  dealAnswers = (maxAnswers) => {
    maxAnswers = maxAnswers || 10;
    const storeAnswers = (err, data) => {
      this.answers = data;
    };
    for (let i = 0; i < this.players.length; i += 1) {
      while (this.players[i].hand.length < maxAnswers) {
        this.players[i].hand.push(this.answers.pop());
        if (!this.answers.length) {
          this.getAnswers(storeAnswers);
        }
      }
    }
  }

  _findPlayerIndexBySocket = (thisPlayer) => {
    let playerIndex = -1;
    _.each(this.players, (player, index) => {
      if (player.socket.id === thisPlayer) {
        playerIndex = index;
      }
    });
    return playerIndex;
  }

  pickCards = (thisCardArray, thisPlayer) => {
    // Only accept cards when we expect players to pick a card
    if (this.state === 'waiting for players to pick') {
      // Find the player's position in the players array
      const playerIndex = this._findPlayerIndexBySocket(thisPlayer);
      console.log('player is at index', playerIndex);
      if (playerIndex !== -1) {
        // Verify that the player hasn't previously picked a card
        let previouslySubmitted = false;
        _.each(this.table, (pickedSet) => {
          if (pickedSet.player === thisPlayer) {
            previouslySubmitted = true;
          }
        });
        if (!previouslySubmitted) {
          // Find the indices of the cards in the player's
          // hand (given the card ids)
          const tableCard = [];
          for (let i = 0; i < thisCardArray.length; i += 1) {
            let cardIndex = null;
            for (let j = 0; j < this.players[playerIndex].hand.length; j += 1) {
              if (this.players[playerIndex].hand[j].id === thisCardArray[i]) {
                cardIndex = j;
              }
            }
            console.log('card', i, 'is at index', cardIndex);
            if (cardIndex !== null) {
              tableCard.push(this.players[playerIndex].hand.splice(cardIndex, 1)[0]);
            }
            console.log('table object at', cardIndex, ':', tableCard);
          }
          if (tableCard.length === this.curQuestion.numAnswers) {
            this.table.push({
              card: tableCard,
              player: this.players[playerIndex].socket.id
            });
          }
          console.log('final table object', this.table);
          if (this.table.length === this.players.length - 1) {
            clearTimeout(this.choosingTimeout);
            this.stateJudging();
          } else {
            this.sendUpdate();
          }
        }
      }
    } else {
      console.log('NOTE:', thisPlayer, 'picked a card during', this.state);
    }
  }

  getPlayer = (thisPlayer) => {
    const playerIndex = this._findPlayerIndexBySocket(thisPlayer);
    if (playerIndex > -1) {
      return this.players[playerIndex];
    }
    return {};
  }

  removePlayer = (thisPlayer) => {
    const playerIndex = this._findPlayerIndexBySocket(thisPlayer);

    if (playerIndex !== -1) {
      // Just used to send the remaining players a notification
      const playerName = this.players[playerIndex].username;

      // If this player submitted a card, take it off the table
      for (let i = 0; i < this.table.length; i += 1) {
        if (this.table[i].player === thisPlayer) {
          this.table.splice(i, 1);
        }
      }

      // Remove player from this.players
      this.players.splice(playerIndex, 1);

      if (this.state === 'awaiting players') {
        this.assignPlayerColors();
      }

      // Check if the player is the czar
      if (this.czar === playerIndex) {
        // If the player is the czar...
        // If players are currently picking a card, advance to a new round.
        if (this.state === 'waiting for players to pick') {
          clearTimeout(this.choosingTimeout);
          this.sendNotification('The Czar left the game! Starting a new round.');
          return this.stateChoosing();
        } else if (this.state === 'waiting for czar to decide') {
          // If players are waiting on a czar to pick, auto pick.
          this.sendNotification('The Czar left the game! First answer submitted wins!');
          this.pickWinning(this.table[0].card[0].id, thisPlayer, true);
        }
      } else {
        // Update the czar's position if the removed player is above
        // the current czar
        if (playerIndex < this.czar) {
          this.czar -= 1;
        }
        this.sendNotification(`${playerName} has left the game.`);
      }

      this.sendUpdate();
    }
  }

  pickWinning = (thisCard, thisPlayer, autopicked) => {
    autopicked = autopicked || false;
    const playerIndex = this._findPlayerIndexBySocket(thisPlayer);
    if ((playerIndex === this.czar || autopicked) &&
      this.state === 'waiting for czar to decide') {
      let cardIndex = -1;
      _.each(this.table, (winningSet, index) => {
        if (winningSet.card[0].id === thisCard) {
          cardIndex = index;
        }
      });
      if (cardIndex !== -1) {
        this.winningCard = cardIndex;
        const winnerIndex = this._findPlayerIndexBySocket(this.table[cardIndex].player);
        this.sendNotification(`${this.players[winnerIndex].username} has won the round!`);
        this.winningCardPlayer = winnerIndex;
        this.players[winnerIndex].points += 1;
        clearTimeout(this.judgingTimeout);
        this.winnerAutopicked = autopicked;
        this.stateResults();
      } else {
        console.log('WARNING: czar', thisPlayer, 'picked a card that was not on the table.');
      }
    } else {
      // TODO: Do something?
      this.sendUpdate();
    }
  }

  killGame = () => {
    console.log('Killing game', this.gameID);
    clearTimeout(this.resultsTimeout);
    clearTimeout(this.choosingTimeout);
    clearTimeout(this.judgingTimeout);
  };
}

module.exports = Game;
