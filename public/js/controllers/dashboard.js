angular.module('mean.system')
  .controller(
    'DashboardController',
    ['$scope', '$http',
      function ($scope, $http) {
        const userToken = window.localStorage.getItem('token');

        $scope.activeTab = 'game-log';
        $scope.showLoader = true;

        $scope.activeTabSelector = ($event) => {
          $scope.activeTab = $event.target.id;
        };

        $http.get('/api/games/history', {
          headers: { 'x-access-token': `${userToken}` }
        }).then((response) => {
          $scope.showLoader = false;
          $scope.userGamesHistory = response.data.userGamesHistory;
        }, (error) => {
          if (error.status === 401) {
            // if the user is not signed in, or token has expired,
            // redirect user to sign in page
            window.location = '/#!/signin';
          }
        });

        $scope.$watch('activeTab', () => {
          if ($scope.activeTab === 'leaderboard' && !$scope.leaderboard) {
            $scope.showLoader = true;
            $http.get('/api/leaderboard', {
              headers: { 'x-access-token': `${userToken}` }
            }).then((response) => {
              $scope.showLoader = false;
              const { leaderboard } = response.data;
              // convert leaderboard obejct to an array for sorting
              const leaderboardArray = [];
              Object.keys(leaderboard).forEach((key) => {
                const record = [key, leaderboard[key]];
                leaderboardArray.push(record);
              });
              leaderboardArray.sort((a, b) => b[1] > a[1]);

              $scope.leaderboard = leaderboardArray;
            }, (error) => {
              if (error.status === 401) {
                // if the user is not signed in, or token has expired,
                // redirect user to sign in page
                window.location = '/#!/signin';
              }
            });
          }

          if ($scope.activeTab === 'donations-board' &&
            !$scope.userDonations) {
            $scope.showLoader = true;
            $http.get('/api/donations', {
              headers: { 'x-access-token': `${userToken}` }
            }).then((response) => {
              $scope.showLoader = false;
              $scope.userDonations = response.data.user.donations;
            }, (error) => {
              if (error.status === 401) {
                // if the user is not signed in, or token has expired,
                // redirect user to sign in page
                window.location = '/#!/signin';
              }
            });
          }
        });
      }]
  );
