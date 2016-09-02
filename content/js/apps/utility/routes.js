'use strict';

define(['app'], function (app) {
    return app.config([
        '$stateProvider',
        '$urlRouterProvider',
        'AppConfig',
        function ($stateProvider, $urlRouterProvider, AppConfig){

            $stateProvider

                    .state('dashboard', {
                        url: "/dashboard",
                        templateUrl: AppConfig.templatePath + "dashboard.html",
                        controller: 'baseController'
                    })
                    .state('add_customer', {
                        url: "/add_customer",
                        templateUrl: AppConfig.templatePath + "add_customer.tpl.html",
                        controller: 'customController'
                    });        
               
            // if none of the above states are matched, use this as the fallback
            //$urlRouterProvider.otherwise('/modelView_controller');
            $urlRouterProvider.otherwise('/dashboard');
        }
        
    ]);
});
