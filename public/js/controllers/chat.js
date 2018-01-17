angular.module('mean.system')
  .controller('ChatController', [
    '$scope', '$firebaseArray', 'socket', 'game',
    ($scope, $firebaseArray, socket, game) => {
      const ref = new Firebase(`https://baby-face-cfh.firebaseio.com/${
        game.gameID}`);
      let chatOnboarding = true,
        oldMessagesCount = 0,
        newMessagesCount = 0,
        unreadMessagesCount = 0,
        chatMessagesPanelOpen = false;

      $scope.chatMessages = $firebaseArray(ref);
      $scope.message = '';
      $scope.unreadMessagesCount = null;

      if (chatOnboarding) {
        ref.remove();
        chatOnboarding = false;
      }

      $('.left-section').click(() => {
        if ($('.chat-panel').hasClass('is-closed')) {
          $('.chat-panel').removeClass('is-closed').addClass('is-open');
          $('#toggle-sign').removeClass('fa-plus').addClass('fa-minus');
          chatMessagesPanelOpen = true;
        } else if ($('.chat-panel').hasClass('is-open')) {
          $('.chat-panel').removeClass('is-open').addClass('is-closed');
          $('#toggle-sign').removeClass('fa-minus').addClass('fa-plus');
          chatMessagesPanelOpen = false;
        }
      });
      $('.fa-plus').click(() => {
        if ($('.chat-panel').hasClass('is-closed')) {
          $('.chat-panel').removeClass('is-closed').addClass('is-open');
          $('#toggle-sign').removeClass('fa-plus').addClass('fa-minus');
          chatMessagesPanelOpen = true;
        } else if ($('.chat-panel').hasClass('is-open')) {
          $('.chat-panel').removeClass('is-open').addClass('is-closed');
          $('#toggle-sign').removeClass('fa-minus').addClass('fa-plus');
          chatMessagesPanelOpen = false;
        }
      });

      $scope.$watch(() => {
        if (!chatMessagesPanelOpen) {
          newMessagesCount = $scope.chatMessages.length;
          unreadMessagesCount = newMessagesCount - oldMessagesCount;
          $scope.unreadMessagesCount = unreadMessagesCount === 0 ?
            null : unreadMessagesCount;
        } else {
          oldMessagesCount = $scope.chatMessages.length;
          $scope.unreadMessagesCount = null;
        }
      });

      $scope.scrollDownPanel = () => {
        $('.chat-messages').stop().animate({
          scrollTop: $('.chat-messages')[0].scrollHeight
        }, 1000);
      };

      $scope.forwardMessage = () => {
        $scope.player = game.players[game.playerIndex];
        $scope.payLoad = {
          avatar: $scope.player.avatar,
          username: $scope.player.username,
          message: $scope.message,
          timeSent: new Date(Date.now()).toLocaleTimeString('en-US')
        };

        $scope.chatMessages.$add($scope.payLoad);
        $scope.scrollDownPanel();
        $scope.message = '';
      };

      $scope.sendMessage = (event) => {
        if (event) {
          if ((event.which === 13 && $scope.message !== '')) {
            $scope.forwardMessage();
          }
        } else if ($scope.message !== '') {
          $scope.forwardMessage();
        }
      };
    }]);
