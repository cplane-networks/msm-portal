'use strict';

define(['app'], function (app) {

    var injectParams = ['$http', '$rootScope', 'AppConfig', 'StorageService'];

    var msmFactory = function ($http, $rootScope, AppConfig, StorageService) {

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

		msmFactory.InitCustomerVsite = function (parent_scope, customer_name, site_data) {
            // customer_name = <string>
            /* site_data = {'site_name': <string>,
                            'defaultSubnet': <string>,
                            'type': 'openstack_site',
                            'cpe': [{"cpeSegmentationType" : <string>,
                                    "cpeSegmentationId" : <string>,
                                    "cpeIpAddr" : <string>,
                                    "cpeMask" : <string>,
                                    "cpeASN" : <string>,
                                    "peerIP" : <string>,
                                    "peerASN" : <string>}]}
            */
            
            if (AppConfig.environment === 'production'){
                var site_name = site_data.site_name;
                delete site_data.site_name;
                delete site_data.type;
                
                return $http.post(AppConfig.serviceUrl + 'customer/' + customer_name + '/vSite/' + site_name, site_data).success(
                    function (results) {
                        console.log(results);
                        initCustomerVsiteEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            initCustomerVsiteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            initCustomerVsiteEvent(parent_scope, null, null);
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        initCustomerVsiteEvent(parent_scope, results["init_customer_vsite"], null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            initCustomerVsiteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            initCustomerVsiteEvent(parent_scope, null, null);
                    });
            }
        };

        function initCustomerVsiteEvent(parent_scope, response, error) {
            parent_scope.$broadcast('OnInitCustomerVsiteEvent', response, error);
        };
        
        msmFactory.ListCustomerVsite = function (parent_scope, customer_name, site_name) {
            // customer_name = <string>
            // site_name = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.get(AppConfig.serviceUrl + 'customer/' + customer_name + '/vSite/' + site_name).success(
                    function (results) {
                        console.log(results);
                        listCustomerVsiteEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            listCustomerVsiteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            listCustomerVsiteEvent(parent_scope, null, null);
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        listCustomerVsiteEvent(parent_scope, results["init_customer_vsite"], null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            listCustomerVsiteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            listCustomerVsiteEvent(parent_scope, null, null);
                    });
            }
        };

        function listCustomerVsiteEvent(parent_scope, response, error) {
            parent_scope.$broadcast('OnListCustomerVsiteEvent', response, error);
        };
        
        msmFactory.InitExternalVsite = function (parent_scope, customer_name, site_data) {
            // customer_name = <string>
            /* site_data = {'site_name': 'AWS',
                            'type': 'external_site'
                            'as_number': 22,
                            'gateway_ip_address': '192.168.1.100',
                            'ip_range': ['192.168.1.0/24', '192.168.2.0/24', '192.168.3.0/24'],
                           }
            */
            
            if (AppConfig.environment === 'production'){
                msmFactory.GetExternalVsite(parent_scope, customer_name);
                $scope.$on("OnGetExternalVsiteEvent", function (event, response, error_msg)
                {
                    console.log(response);
                    /*
                    response.values.append(site_data)
                    return $http.put(AppConfig.serviceUrl + 'customer/' + customer_name + '/values', response).success(
                        function (results) {
                            console.log(results);
                            initExternalVsiteEvent(parent_scope, results, null);
                        }).error(
                        function (error, status) {
                            if (error != null)
                                initExternalVsiteEvent(parent_scope, null, status + " : " + error.Message);
                            else
                                initExternalVsiteEvent(parent_scope, null, null);
                        });
                    */    
                });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        initExternalVsiteEvent(parent_scope, results["init_external_vsite"], null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            initExternalVsiteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            initExternalVsiteEvent(parent_scope, null, null);
                    });
            }
        };

        function initExternalVsiteEvent(parent_scope, response, error) {
            parent_scope.$broadcast('OnInitExternalVsiteEvent', response, error);
        };
        
        msmFactory.GetExternalVsite = function (parent_scope, customer_name) {
            // customer_name = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.get(AppConfig.serviceUrl + 'customer/' + customer_name + '/values').success(
                    function (results) {
                        console.log(results);
                        getExternalVsiteEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            getExternalVsiteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            getExternalVsiteEvent(parent_scope, null, null);
                    });
            }
            else {
                // Need to pull up from localstorage
                /*
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        getExternalVsiteEvent(parent_scope, results["init_external_vsite"], null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            getExternalVsiteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            getExternalVsiteEvent(parent_scope, null, null);
                    });
                */    
            }
        };

        function getExternalVsiteEvent(parent_scope, response, error) {
            parent_scope.$broadcast('OnGetExternalVsiteEvent', response, error);
        };
        
        
        return msmFactory;
    };

    msmFactory.$inject = injectParams;

    app.factory('MSMService', msmFactory);

});