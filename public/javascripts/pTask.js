var app = angular.module('pTask', ['ngRoute', 'ngResource']).run(function($rootScope, $http) {
	$rootScope.authenticated = false;
	$rootScope.current_user = '';
	
	$rootScope.signout = function(){
		console.log('Logout');  //debug for logout
    	$http.get('/auth/signout');
    	$rootScope.authenticated = false;
    	$rootScope.current_user = '';
	};
});

app.config(function($routeProvider){
	$routeProvider
		//the timeline display
		.when('/', {
			templateUrl: 'main.html',
			controller: 'mainController'
		})
		//the login display
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'authController'
		})
		//the signup display
		.when('/register', {
			templateUrl: 'register.html',
			controller: 'authController'
		});
});

app.factory('postService', function($resource){
	return $resource('/api/task/:id');
});

app.controller('mainController', function(postService, $scope, $rootScope){
	$scope.tasks = postService.query();
	$scope.newTask = {created_by: '', text: '', created_at: '', pilot: ''};
    //$scope.task.id = tasks.indexOF(task);
	
	$scope.pTask = function() {
	  $scope.newTask.created_by = $rootScope.current_user;
	  $scope.newTask.created_at = Date.now();
	  postService.save($scope.newTask, function(){
	    $scope.tasks = postService.query();
	    $scope.newTask = {created_by: '', text: '', created_at: '', pilot: ''};
	  });
      $scope.tasks = postService.query();
	};
});

app.controller('authController', function($scope, $http, $rootScope, $location){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };

  $scope.register = function(){
    $http.post('/auth/signup', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };
});

/* Modified by https://github.com/hwz/chirp */
