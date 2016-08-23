var app = angular.module('pTask', ['ngRoute', 'ngResource', 'ngCookies']).run(function ($rootScope, $http, $cookies, checkCreds, $location) {
    if(!checkCreds()){
        $location.path('/login');
    };
    
    /*if (cookieUsername != '') {
        $rootScope.current_user = cookieUsername;
        //$rootScope.authenticated = true;
    }
    else {
        $rootScope.current_user = '';
        $rootScope.authenticated = false;
    }*/
    $rootScope.signout = function () {
        console.log('Logout'); //debug for logout
        $http.get('/auth/signout');
        userKeepService.clearCookieData;
        $rootScope.authenticated = false;
        $rootScope.current_user = '';
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
app.factory('userKeepService', ['$cookies', function ($cookies) {
    var userName = '';
    //var userAuth = false;
    return {
        setCookieData: function (username) {
            userName = username;
            //userAuth = auth;
            $cookies.put('userName', username);
            //$cookies.put('Auth', auth);
        }
        , getCookieData: function () {
            userName = $cookies.get('userName');
            //userAuth = $cookies.get('Auth');
            return userName;
        }
        , clearCookieData: function () {
            userName = '';
            $cookies.remove('userName');
        }
    }
}]);
// create a service to save user's credentials once authenticated
// The setCreds can be called as
// setCreds($scope.username, $scope.password);
app.factory('setCreds', ['$cookies', function ($cookies) {
    return function (un, pw) {
        var token = un.concat(":", pw); // combine user name as json object as username:password
        $cookies.appCreds = token;
        $cookies.appUsername = un;
    };
}]);
// create the service to check the user credentials
// Useage:
// if (checkCreds()) { do something } ;
app.factory('checkCreds', ['$cookies', function ($cookies) {
    return function () {
        var returnVal = false;
        var appCreds = $cookies.appCreds;
        if (appCreds !== undefined && appCreds !=="") {
            returnVal = true;
        };
    return returnVal;
    };
}]);
// create a service to delete user credentials
// Usage: delCreds();
app.factory('delCreds', ['$cookies', function($cookies) {
    return function() {
        $cookies.appCreds = "";
        $cookies.appUsername = "";
    };
}]);
app.factory('getToken', ['$cookies', function($cookies) {
    return function() {
        var returnVal = "";
        var appCreds = $cookies.appCreds;
        if (appCreds !== undefined && appCreds !==""){
            returnVal = btoa(appCreds);
        }
    return returnVal;
    };
}]);
app.controller('mainController', function (postService, userKeepService, $scope, $rootScope) {
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
app.controller('authController', function ($scope, $http, $rootScope, $location, $cookies, setCreds) {
    $scope.user = {
        username: ''
        , password: ''
    };
    $scope.error_message = '';
    $scope.login = function () {
        $http.post('/auth/login', $scope.user).success(function (data) {
            if (data.state == 'success') {
                $rootScope.authenticated = true;
                $rootScope.current_user = data.user.username;
                // set cookies
                setCreds($scope.user.username, $scope.user.password);
                // comment the set cookie
                //userKeepService.setCookieData(data.user.username);
                //console.log(userKeepService.getCookieData());
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