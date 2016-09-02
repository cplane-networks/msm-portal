'use strict';

define(['app'], function (app) {

    var injectParams = ['$http', '$rootScope', 'AppConfig'];

    var msmFactory = function ($http, $rootScope, AppConfig) {

        var msmFactory = {};

        msmFactory.CreateCustomer = function (parent_scope, data) {
            // data = {"name": <string>}
            
            if (AppConfig.environment === 'production'){
                return $http.post(AppConfig.serviceUrl +'customer', data).success(
                    function (results) {
                        createCustomerEvent(parent_scope, results, null);
                    }).error(
                    function (error, status){
                        if (error != null)
                            createCustomerEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            createCustomerEvent(parent_scope, null, null);       
                    });
            }
            else {
                // this is only test. This return data from stub_data.json
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        createCustomerEvent(parent_scope, results["create_customer"], null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            createCustomerEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            createCustomerEvent(parent_scope, null, null);
                    });
            }
        };
        
        function createCustomerEvent(parent_scope, response, error) {
            parent_scope.$broadcast('OnCreateCustomerEvent', response, error);
        };
        
        msmFactory.ListCustomers = function (parent_scope) {
            
            if (AppConfig.environment === 'production'){
                return $http.get(AppConfig.serviceUrl + 'customer').success(
                    function (results) {
                        listCustomerEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            listCustomerEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            listCustomerEvent(parent_scope, null, null);
                    });
            }
            else {
                
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        listCustomerEvent(parent_scope, results["list_customers"], null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            listCustomerEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            listCustomerEvent(parent_scope, null, null);
                    });
            }
        };
        
        function listCustomerEvent(parent_scope, response, error) {
            parent_scope.$broadcast('OnListCustomerEvent', response, error);
        };
        
        msmFactory.DeleteCustomer = function (parent_scope, customer_name) {
            // customer_name = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.delete(AppConfig.serviceUrl + 'customer/' + customer_name).success(
                    function (results) {
                        deleteCustomerEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            deleteCustomerEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            deleteCustomerEvent(parent_scope, null, null);
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        deleteCustomerEvent(parent_scope, results["delete_customer"], null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            deleteCustomerEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            deleteCustomerEvent(parent_scope, null, null);
                    });
            }
        };

        function deleteCustomerEvent(parent_scope, response, error) {
            parent_scope.$broadcast('OnDeleteCustomerEvent', response, error);
        };
        
        
        return msmFactory;
    };

    msmFactory.$inject = injectParams;

    app.factory('MSMService', msmFactory);

});