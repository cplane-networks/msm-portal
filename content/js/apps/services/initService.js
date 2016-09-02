'use strict';

define(['app'], function (app) {

    var injectParams = ['$http', '$rootScope', 'AppConfig'];

    var initFactory = function ($http, $rootScope, AppConfig) {

        var initFactory = {};

        initFactory.GetLocalData = function (parent_scope, key) {
            return $http.get(AppConfig.localUrl + 'init.json').success(
                    function (results) {
                        OnLocalData(parent_scope, results[key], null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            OnLocalData(parent_scope, null, status + " : " + error.Message);
                        else
                            OnLocalData(parent_scope, null, null);
                    });
        };

        function OnLocalData(parent_scope, response, error) {
            parent_scope.$broadcast('OnGetLocalData', response, error);
        };

        return initFactory;
    };

    initFactory.$inject = injectParams;

    app.factory('InitService', initFactory);

});