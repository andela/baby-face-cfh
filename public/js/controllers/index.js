angular.module('mean.system')
  .controller('IndexController', [
    '$scope', 'Global', '$location', 'socket', 'game', 'AvatarService',
    ($scope, Global, $location, socket, game, AvatarService) => {
      $scope.global = Global;

      $scope.playAsGuest = () => {
        game.joinGame();
        $location.path('/app');
      };

      $scope.openRegionSelectAsGuest = () => {
        window.gameMode = 'guest';
        $('#regionModal').modal();
      };

      $scope.openRegionSelectWithFriends = () => {
        window.gameMode = 'friends';
        $('#regionModal').modal();
      };

      $scope.startGameByRegion = () => {
        window.location.href = window.gameMode === 'friends' ?
          '/play?custom' : '/play';
      };

      $scope.showError = () => {
        if ($location.search().error) {
          return $location.search().error;
        }
        return false;
      };

      $scope.avatars = [];
      AvatarService.getAvatars()
        .then((data) => {
          $scope.avatars = data;
        });

      $scope.selectedRegion = '59b91ad4605e234f4555a4de';

      $scope.$watch('selectedRegion', () => {
        localStorage.setItem('regionId', $scope.selectedRegion);
      });
    }]);
