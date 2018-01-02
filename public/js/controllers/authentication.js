angular.module('mean.system')
  .controller('AuthenticationController', [
    '$scope', '$http', '$location', '$window', '$log', ($scope, $http, $location, $window, $log) => {
      $scope.user = {};

      $scope.signup = () => {
        const newUser = {
          name: $scope.user.name,
          email: $scope.user.email,
          password: $scope.user.password
        };
        $http.post('/api/auth/signup', newUser)
          .then((response) => {
            const { data: { data } } = response,
              { token } = data;
            $window.localStorage.setItem('token', token);
            $location.path('/');
            $window.location.reload();
          }, (error) => {
            const { data: { message } } = error;
            $log.error(message);
            $location.search(`error=${message}`);
          });
      };
    }
  ]);
