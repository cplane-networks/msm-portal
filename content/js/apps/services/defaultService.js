'use strict';

define(['app'], function (app) {

    var injectParams = ['$http', '$rootScope', 'AppConfig'];

    var authFactory = function ($http, $rootScope, AppConfig) {

        var authFactory = {};

        authFactory.login = function ($scope, data) {
            return $http.get(AppConfig.serverUrl + 'members.json').then(
                    function (results) {
                        var isMatch = false;
                        var userList = results.data.members; // get data from json

                        for (var i = 0; i < userList.length; i++) {
                            if (data.username === results.data.members[i].username && data.password === results.data.members[i].password) {
                                isMatch = true;
                            }
                        }
                        loginEvent($scope, isMatch, null);
                    });
        };
        var loginEvent = function (parent_scope, data, error) {
            parent_scope.$broadcast('OnLoginDataReceived', data, error);
        };

        authFactory.logout = function (parent_scope) {
            return $http.get(AppConfig.serverUrl + 'members.json').then(
                    function (results) {
                        loginEvent(parent_scope, results);
                    });
        };

        return authFactory;
    };

    authFactory.$inject = injectParams;

    app.factory('DefaultService', authFactory);

});