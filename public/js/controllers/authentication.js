angular.module('mean.system')
  .controller('AuthenticationController', [
    '$scope', '$http', '$location', '$window', ($scope, $http, $location, $window) => {
      $scope.user = {};

      $scope.serverErrorMessage = '';

      $scope.serverErrorExists = () => $scope.serverErrorMessage.length > 0;

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
            $scope.serverErrorMessage = message;
          });
      };
    }
  ]);
