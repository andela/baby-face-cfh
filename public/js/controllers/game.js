angular.module('mean.system')
  .controller('GameController', [
    '$rootScope',
    '$scope',
    'socket',
    '$window',
    'game',
    '$timeout',
    '$location',
    'MakeAWishFactsService',
    '$http',
    '$dialog',
    (
      $rootScope, $scope, socket, $window, game, $timeout,
      $location, MakeAWishFactsService, $http
    ) => {
      $scope.hasPickedCards = false;
      $scope.winningCardPicked = false;
      $scope.showTable = false;
      $scope.modalShown = false;
      $scope.game = game;
      $scope.pickedCards = [];
      let makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
      $scope.makeAWishFact = makeAWishFacts.pop();

      $scope.inviteCounter = 0;
      $scope.invited = [];
      $scope.inviteList = [];
      $scope.notifications = [];
      $scope.inviteMsg = '';


      // Listen to the roomFilled event on the root scope
      // then trigger a modal to tell the user that the room is filled..
      $rootScope.$on('roomFilled', () => {
        $('#roomFilled').modal();
      });

      $scope.gameTour = introJs();

      $scope.pickCard = (card) => {
        if (!$scope.hasPickedCards) {
          if ($scope.pickedCards.indexOf(card.id) < 0) {
            $scope.pickedCards.push(card.id);
            if (game.curQuestion.numAnswers === 1) {
              $scope.sendPickedCards();
              $scope.hasPickedCards = true;
            } else if (game.curQuestion.numAnswers === 2 &&
            $scope.pickedCards.length === 2) {
            // delay and send
              $scope.hasPickedCards = true;
              $timeout($scope.sendPickedCards, 300);
            }
          } else {
            $scope.pickedCards.pop();
          }
        }
      };

      $scope.pointerCursorStyle = () => {
        if ($scope.isCzar() &&
          $scope.game.state === 'waiting for czar to decide') {
          return { cursor: 'pointer' };
        }
        return {};
      };

      $scope.sendPickedCards = () => {
        game.pickCards($scope.pickedCards);
        $scope.showTable = true;
      };


      $scope.searchUser = () => {
        $scope.userNotFound = false;
        $scope.searchResult = '';
        const { username } = $scope;
        if (username && username.length !== 0) {
          $http({
            method: 'GET',
            url: `/api/search/${username}`
          }).then((response) => {
            $scope.username = null;
            if (response.data.user && response.data.email) {
              $('#searchControl').show();
              $scope.searchResult = response.data.user;
              $scope.email = response.data.email;
            }
          }, () => {
            $scope.username = null;
            $scope.userNotFound = true;
            setTimeout(() => {
              $scope.userNotFound = false;
            }, 2000);
          });
        } else {
          $scope.searchResult = [];
        }
      };

      $scope.popModal = () => {
        $('#searchControl').hide();
        $('#search').modal('show');
      };
      $scope.sendInvite = (email) => {
        $('#searchControl').hide();
        $http.post('/api/users/invite', {
          recipient: email,
          gameLink: document.URL
        });
      };

      $scope.sendInvite = (email, username) => {
        if (email) {
          $http.post('/api/users/invite', {
            recipient: email,
            gameLink: document.URL
          }).then(() => {
            $scope.inviteMsg = `You have sent an invite to ${username}`;
            setTimeout(() => {
              $scope.inviteMsg = '';
            }, 2000);
          }, (err) => {
            $scope.inviteMsg = err.data.message;
          });
        } else {
          $scope.inviteMsg = 'An error occured while sending the message.';
        }
      };

      // Set http header
      $scope.setHttpHeader = () => {
        const token = $window.localStorage.getItem('token');
        $http.defaults.headers.common.token = token;
      };

      // add friends

      $scope.addFriend = (friendName, friendId, friendEmail) => {
        const payload = {
          friendId,
          friendName,
          friendEmail
        };

        $scope.setHttpHeader();
        $http.put('/api/user/friends', payload, {
          headers: {
            'x-access-token': `${localStorage.getItem('token')}`
          }
        })
          .then(
            () => {
              $scope.getFriendsList();
              $scope.inviteMsg = 'Friend added to list';
              setTimeout(() => {
                $scope.inviteMsg = '';
              }, 2000);
            },
            (error) => {
              console.log('here is the error', error);
              $scope.getFriendsList();
              $scope.inviteMsg = error.data.message;
              setTimeout(() => {
                $scope.inviteMsg = '';
              }, 2000);
            }
          );
      };

      // get Friends list
      $scope.getFriendsList = () => {
        $scope.setHttpHeader();
        $http.get('/api/user/friends', {
          headers: {
            'x-access-token': `${localStorage.getItem('token')}`
          }
        })
          .then(
            (response) => {
              $scope.friendsList = response.data;
              console.log(response.data);
              $scope.friendsId = response.data.map(friend => friend.friendId);
            },
            () => {
              $scope.friendsList = [];
            }
          );
      };

      // remove friend
      $scope.removeFriend = (friendId) => {
        $scope.setHttpHeader();
        $http.delete(`/api/user/friends/${friendId}`, {
          headers: {
            'x-access-token': `${localStorage.getItem('token')}`
          }
        }).then(() => {
          $scope.getFriendsList();
          $scope.friendMsg = 'Friend delete from your list';
          setTimeout(() => {
            $scope.friendMsg = '';
          }, 2000);
        }, () => {
          $scope.getFriendsList();
        });
      };

      // send notifications
      $scope.sendNotification = (friendId, friendEmail) => {
        const payload = {
          link: document.URL,
          friendId
        };
        let userID;
        $scope.setHttpHeader();
        $http.post('/api/notifications', payload, {
          headers: {
            'x-access-token': `${localStorage.getItem('token')}`
          }
        })
          .then(() => {
            $scope.inviteList.push(friendId);
            userID = game.players.filter(e => e.email === friendEmail);
            if (userID.length > 0) {
              game.broadcastNotification(userID[0].socketID);
            }
            $scope.friendMsg = 'Notification sent to friend';
            setTimeout(() => {
              $scope.friendMsg = '';
            }, 2000);
          });
      };

      socket.on('notificationReceived', (userId) => {
        const userID = game.players[game.playerIndex].socketID;
        if (userId === userID) {
          $scope.loadNotifications();
        }
      });

      $scope.loadNotifications = () => {
        $scope.setHttpHeader();
        $http.get('/api/notifications', {
          headers: {
            'x-access-token': `${localStorage.getItem('token')}`
          }
        })
          .then(
            (response) => {
              $scope.notifications = response.data.notifications
                .sort((a, b) => b.id - a.id);
              if ($scope.notifications.length >= 1) {
                toastr.success(`You have ${
                  $scope.notifications.length} new Notification${
                  $scope.notifications.length > 1 ? 's' : ''}!`);
              }
            },
            () => {
              $scope.notifications = $scope.notifications;
            }
          );
      };

      $scope.loadNotifications();

      $scope.readNotifications = (id) => {
        $http.put(`/api/notification/${id}`, {
          headers: {
            'x-access-token': `${localStorage.getItem('token')}`
          }
        })
          .then(
            () => {
              $scope.loadNotifications();
            },
            () => {
              $scope.loadNotifications();
            }
          );
      };

      $scope.viewNotification = function () {
        $('#notify').modal('show');
      };

      $scope.cardIsFirstSelected = (card) => {
        if (game.curQuestion.numAnswers > 1) {
          return card === $scope.pickedCards[0];
        }
        return false;
      };

      $scope.cardIsSecondSelected = (card) => {
        if (game.curQuestion.numAnswers > 1) {
          return card === $scope.pickedCards[1];
        }
        return false;
      };

      $scope.firstAnswer = ($index) => {
        if ($index % 2 === 0 && game.curQuestion.numAnswers > 1) {
          return true;
        }
        return false;
      };

      $scope.secondAnswer = ($index) => {
        if ($index % 2 === 1 && game.curQuestion.numAnswers > 1) {
          return true;
        }
        return false;
      };

      $scope.showFirst = card =>
        game.curQuestion.numAnswers > 1 && $scope.pickedCards[0] === card.id;

      $scope.showSecond = card =>
        game.curQuestion.numAnswers > 1 && $scope.pickedCards[1] === card.id;

      $scope.isCzar = () =>
        game.czar === game.playerIndex;

      $scope.isPlayer = $index =>
        $index === game.playerIndex;

      $scope.isCustomGame = () =>
        !(/^\d+$/).test(game.gameID) && game.state === 'awaiting players';

      $scope.isPremium = $index => game.players[$index].premium;

      $scope.currentCzar = $index => $index === game.czar;

      $scope.winningColor = ($index) => {
        if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
          return $scope.colors[game.players[game.winningCardPlayer].color];
        }
        return '#f9f9f9';
      };

      $scope.pickWinning = (winningSet) => {
        if ($scope.isCzar()) {
          game.pickWinning(winningSet.card[0]);
          $scope.winningCardPicked = true;
        }
      };

      $scope.winnerPicked = () => game.winningCard !== -1;

      // Catches changes to round to update when no players pick card
      // (because game.state remains the same)
      $scope.$watch('game.round', () => {
        $scope.hasPickedCards = false;
        $scope.showTable = false;
        $scope.winningCardPicked = false;
        $scope.makeAWishFact = makeAWishFacts.pop();
        if (!makeAWishFacts.length) {
          makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
        }
        $scope.pickedCards = [];
      });

      $scope.showRandomCardModal = false;

      $scope.onPickRandomCard = () => {
        setTimeout(() => {
          $('#modal-container').addClass('out');
          $('body').removeClass('modal-active');
          game.czarHasPickedRandCard();
        }, 2000);
      };

      // In case player doesn't pick a card in time, show the table
      $scope.$watch('game.state', () => {
        if (game.state === 'waiting for czar to decide'
          && $scope.showTable === false) {
          $scope.showTable = true;
        }
        if (game.state === 'game in progress') {
          $('#modal-container').removeAttr('class').addClass('five');
          $('.modal label').prop('checked', false);
          $('.modal input').prop('checked', false);
          $('.back p').html(game.curQuestion.text);
          // $('body').addClass('modal-active');
        }
        if (game.state === 'waiting for players to pick') {
          $('#modal-container').addClass('out');
          $('body').removeClass('modal-active');
          game.decrementTime();
        }
        if (game.state === 'game dissolved') {
          $('#modal-container').addClass('out');
          $('body').removeClass('modal-active');
        }
      });

      $scope.startGame = () => {
        if (game.players.length >= game.playerMinLimit) {
          $('#startGameModal').modal({
            keyboard: false,
            backdrop: 'static'
          });
          $('#startGameModal').modal('show');
        } else {
          $('#incompletePlayersModal').modal('show');
        }
      };

      $scope.confirmStartGame = () => {
        game.startGame();
      };

      $scope.abandonGame = () => {
        game.leaveGame();
        $location.path('/');
      };

      $scope.$watch('game.gameID', () => {
        if (game.gameID && game.state === 'awaiting players') {
          if (!$scope.isCustomGame() && $location.search().game) {
          // If the player didn't successfully enter the request room,
          // reset the URL so they don't think they're in the requested room.
            $location.search({});
          } else if ($scope.isCustomGame() && !$location.search().game) {
          // Once the game ID is set,
          // update the URL if this is a game with friends,
          // where the link is meant to be shared.
            $location.search({ game: game.gameID });
            if (!$scope.modalShown) {
              setTimeout(() => {
                const link = document.URL;
                const txt = '<p style="font-family: Helvetica; ' +
                'font-size: 20px;">Give the following link to your friends ' +
                'so they can join your game: </p>';
                $('#lobby-how-to-play').html(txt);
                $('#oh-el').css({
                  'text-align': 'center',
                  'font-size': '22px',
                  background: 'white',
                  color: 'black'
                }).text(link);
              }, 200);
              $scope.modalShown = true;
            }
          }
        }
      });
      $scope.gameTour.setOptions({
        steps: [
          {
            intro: 'Hello, I would like to take you on a quick'
            + ' tour of how this game is played.'
          },
          {
            element: document.querySelector('#start-game-button'),
            intro: 'This pane, also called the question box shows '
            + 'the number of players  that have joined.'
          },
          {
            element: document.querySelector('#abandon-game-button'),
            intro: 'If you ever decide to quit or leave the game,'
            + ' you can click this button.'
          },
          {
            element: document.querySelector('#donate-game-button'),
            intro: 'Click this button to make a donation'
          },
          {
            element: document.querySelector('#players-online-onboarding'),
            intro: 'This is the player card. It shows the username, avatar,'
            + ' and score of players that have joined the current game session.'
          },
          {
            element: '#play',
            intro: 'Click on the play button to start a new game.'
          },
          {
            element: '#invite-players',
            intro: 'Use the Invite Players button to invite your friends.',
          },
          {
            element: document.querySelector('#timer-status-round'),
            intro: 'A game session lasts for 20 seconds. This pane '
            + 'shows the number of seconds left for a game session to end.'
          },
          {
            element: '#h-t-p',
            intro: 'This panel shows the instructions of the game. , '
            + 'When the game starts the answers to the question in '
            + 'the question box above will be shown here.'
          },
          {
            element: '#chat-on-b',
            intro: 'Feel free to chat with other players... , '
          },
          {
            element: document.querySelector('#retake-tour-button'),
            intro: 'If you feel like taking this tour again,'
            + ' you can always click here.'
          },
          {
            intro: 'YES! We are done with the tour.'
            + ' Enjoy your game and remember to donate!.'
          }
        ]
      });
      // Take tour method: This will run on ng-init
      $scope.takeTour = () => {
        const tourStatus = localStorage.getItem('tour_status');
        if (tourStatus === 'false') {
          const timeout = setTimeout(() => {
            $scope.gameTour.start();
            clearTimeout(timeout);
          }, 2000);
          localStorage.removeItem('tour_status');
        }
        const guestTour = localStorage.getItem('token');
        if (!guestTour) {
          const timeout = setTimeout(() => {
            $scope.gameTour.start();
            clearTimeout(timeout);
          }, 2000);
        }
      };
      $scope.retakeTour = () => {
        $scope.gameTour.start();
      };

      if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
        console.log('joining custom game');
        game.joinGame('joinGame', $location.search().game);
      } else if ($location.search().custom) {
        game.joinGame('joinGame', null, true);
      } else {
        game.joinGame();
      }
    }]);
