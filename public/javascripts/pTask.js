'use strict'
var app = angular.module('pTask', ['ngRoute', 'ngResource', 'ngCookies']).run(function ($rootScope, $http, $location, $cookies) {
             
    $rootScope.authenticated = false;
    $rootScope.current_user = '';
    // add a listen for the page refresh
    $rootScope.$on('$locationChangeStart', function(event, next, current){
        var user = '';
        if(typeof($cookies.get('user'))=='string'){
            user = JSON.parse($cookies.get('user'));
        };
        
        //if no user loged in, go to login.html
        if(user == '') {
            $rootScope.current_user='';
            $rootScope.authenticated = false;
            if (next.includes('register')) {
                //if link to resgister, allow
                
            } else {
                //Otherwise direct to login
            };
            
        } else {
            $rootScope.authenticated = true;
            $rootScope.current_user = user.username;
        };
    });
    // signout and clean the cookies
    $rootScope.signout = function () {
        console.log('Logout'); //debug for logout
        
        
        $cookies.remove('user');
        $rootScope.authenticated = false;
        $rootScope.current_user = '';
        $http.get('/auth/signout');
        $location.path('/');
    };
});
app.config(function ($routeProvider) {
    $routeProvider
    //the timeline display
        .when('/', {
            templateUrl: 'main.html'
            , controller: 'mainController'
        })
        //the login display
        .when('/login', {
            templateUrl: 'login.html'
            , controller: 'authController'
        })
        //the signup display
        .when('/register', {
            templateUrl: 'register.html'
            , controller: 'authController'
        });
});
app.factory('postService', function ($resource) {
    return $resource('/api/task/:id');
});

app.controller('mainController', function ($scope, $rootScope, postService) {
    // add cookies reader to keep user login
    // read the tasks from db
    $scope.tasks = postService.query();
    //console.log($scope.tasks); // debug1
    $scope.newTask = {
        created_by: ''
        , text: ''
        , created_at: ''
        , pilot: ''
    };
    $scope.pTask = function () {
        $scope.newTask.created_by = $rootScope.current_user;
        $scope.newTask.created_at = Date.now();
        postService.save($scope.newTask, function () {
            $scope.tasks = postService.query();
            console.log('Add new task');
            console.log($scope.tasks); //debug the db document saving
            $scope.newTask = {
                created_by: ''
                , text: ''
                , created_at: ''
                , pilot: ''
            };
        });
    };
    $scope.detailTask = function (task) {
        alert('check task ' + task._id);
        //$scope.tasks = postService.query(this.id);
    };
    $scope.delTask = function (task) {
        //var $scope.taskId = task.objectID;
        alert('Remove task ' + task._id);
        postService.remove({
            id: task._id
        });
        $scope.tasks = postService.query();
    };
});
app.controller('authController', function ($scope, $http, $rootScope, $location, $cookies) {
    $scope.user = {
        username: ''
        , password: ''
    };
    $scope.error_message = '';
    
    //show password function
    $scope.showpassword = true;
    $scope.showpass = function(){
        $scope.showpassword = !$scope.showpassword;
    };
    
    //login function
    $scope.login = function () {
        $http.post('/auth/login', $scope.user).success(function (data) {
            if (data.state == 'success') {
                $rootScope.authenticated = true;
                $rootScope.current_user = data.user.username;
                // set cookies
                $cookies.put('user', JSON.stringify(data.user));
                // redirect to '/'
                $location.path('/');
            }
            else {
                $scope.error_message = data.message;
            };
        });
    };
    $scope.register = function () {
        $http.post('/auth/signup', $scope.user).success(function (data) {
            if (data.state == 'success') {
                $rootScope.authenticated = true;
                $rootScope.current_user = data.user.username;
                $location.path('/');
            }
            else {
                $scope.error_message = data.message;
            }
        });
    };
});
/* Modified by https://github.com/hwz/chirp */