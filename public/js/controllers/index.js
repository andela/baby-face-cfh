angular.module('mean.system')
.controller('IndexController', ['$scope', 'Global', '$location', 'socket', 'game', 'AvatarService', function ($scope, Global, $location, socket, game, AvatarService) {
    $scope.global = Global;

    $scope.playAsGuest = function() {
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
      window.location.href  = window.gameMode === 'friends' ? '/play?custom' : '/play';
    };

    $scope.showError = function() {
      if ($location.search().error) {
        return $location.search().error;
      } else {
        return false;
      }
    };

    $scope.avatars = [];
    AvatarService.getAvatars()
      .then(function(data) {
        $scope.avatars = data;
      });

   $scope.selectedRegion = "59b90186ad7d37a9fb7d3630";

   $scope.$watch('selectedRegion', () => {
    localStorage.setItem('regionId', $scope.selectedRegion);
   });

}]);