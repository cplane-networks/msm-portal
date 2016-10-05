'use strict';

define([], function () {

    var app = angular.module('app', [
        'angular-logger',
        //'angular-md5',
        'LocalStorageModule',
        //'angulartics',
        //'angulartics.google.analytics',
        'ui.router', // Routing 
        //'oc.lazyLoad', // ocLazyLoad 
        'ui.bootstrap', // Ui Bootstrap
        'dialogs.main', //
        'ngIdle', // Idle timer
        'ngSanitize', // ngSanitize
        'ngMaterial', // ngDialog
        //'blockUI' //blockUI
    ]);    

    app.init = function () {
        angular.bootstrap(document, ['app']);
    };
    
    app.run(['$rootScope', function ($rootScope) {

            $rootScope
                    .$on('$stateChangeStart',
                            function (event, toState, toParams, fromState, fromParams) {
                                //console.log("State Change: transition begins!!!");
                                
                            });

            $rootScope
                    .$on('$stateChangeSuccess',
                            function (event, toState, toParams, fromState, fromParams) {
                                //console.log("State Change: State change success!");
                            });

            $rootScope
                    .$on('$stateChangeError',
                            function (event, toState, toParams, fromState, fromParams) {
                                //console.log("State Change: Error!");
                            });

            $rootScope
                    .$on('$stateNotFound',
                            function (event, toState, toParams, fromState, fromParams) {
                                //console.log("State Change: State not found!");
                            });

            $rootScope
                    .$on('$viewContentLoading',
                            function (event, viewConfig) {
                                //console.log("View Load: the view is loaded, and DOM rendered!");
                            });

            $rootScope
                    .$on('$viewcontentLoaded',
                            function (event, viewConfig) {
                                //console.log("View Load: the view is loaded, and DOM rendered!");
                            });
        }]);
    
    return app;
});