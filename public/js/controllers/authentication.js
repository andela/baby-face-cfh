angular.module('mean.system').controller('AuthenticationController', [
  '$scope',
  '$http',
  '$location',
  '$window',
  ($scope, $http, $location, $window) => {
    const onResponse = (response) => {
      const { data: { data } } = response,
        { token } = data;
      $window.localStorage.setItem('token', token);
      $location.path('/');
      $window.location.reload();
    };

    const onError = (error) => {
      const { data: { message } } = error;
      $scope.serverErrorMessage = message;
    };

    $scope.user = {};

    $scope.serverErrorMessage = '';

    $scope.serverErrorExists = () => $scope.serverErrorMessage.length > 0;

    $scope.signup = () => {
      const newUser = {
        name: $scope.user.name,
        email: $scope.user.email,
        password: $scope.user.password
      };
      $http.post('/api/auth/signup', newUser).then(onResponse, onError);
    };

    $scope.login = () => {
      const userInputs = {
        email: $scope.user.email,
        password: $scope.user.password
      };
      $http.post('/api/auth/login', userInputs).then(onResponse, onError);
    };

    $scope.signout = () => {
      $window.localStorage.removeItem('token');
      $http.get('/signout').then(onResponse, onError);
    };
  }
]);
