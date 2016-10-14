'use strict';

define(['app'], function (app) {

    var injectParams = ['$http', '$rootScope', 'AppConfig', 'StorageService', 'QueueService'];

    var msmFactory = function ($http, $rootScope, AppConfig, StorageService, QueueService) {

        var msmFactory = {};
        
        msmFactory.CreateCustomer = function (parent_scope, data) {
            // data = {"name": <string>}
            
            if (AppConfig.environment === 'production'){
                return $http.post(AppConfig.serviceUrl + 'customer', data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer', 'result': results, isCollapsed: true});
                        createCustomerEvent(parent_scope, results, null);
                    }).error(
                    function (error, status){
                        if (error != null)
                            createCustomerEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            createCustomerEvent(parent_scope, null, null);       
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer',
                                     'requestData': JSON.stringify(data),
                                     'method'     : 'POST'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer', 'result': results, isCollapsed: true});
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
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results["create_customer"], isCollapsed: true});
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
            $rootScope.$broadcast('OnCreateCustomerEvent', response, error);
        };
        
        msmFactory.SaveCustomerData = function (parent_scope, customer_name, customer_data) {
            // customer_name = <string>
            /* customer_data = {'customer_name': 'Demo',
                                'service_level': 'Gold',
                                'max_cloud_sites': 2,
                                'max_sites_vms': 5}
            */
            var additional_data = {'values' : [{'external_sites' : [], 'customer_details' : {}}]};
            additional_data.values[0]['customer_details'] = customer_data;
            
            if (AppConfig.environment === 'production'){
                return $http.put(AppConfig.serviceUrl + 'customer/' + customer_name + '/values', additional_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'PUT', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/values', 'result': results, isCollapsed: true});
                        //console.log(results);
                        saveCustomerDataEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            saveCustomerDataEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            saveCustomerDataEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/values',
                                     'requestData': JSON.stringify(additional_data),
                                     'method'     : 'PUT'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'PUT', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/values', 'result': results, isCollapsed: true});
                        //console.log(results);
                        saveCustomerDataEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            saveCustomerDataEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            saveCustomerDataEvent(parent_scope, null, null);
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        results = "";
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results, isCollapsed: true});
                        saveCustomerDataEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            saveCustomerDataEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            saveCustomerDataEvent(parent_scope, null, null);
                    });
            }
        };
        
        function saveCustomerDataEvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnSaveCustomerDataEvent', response, error);
        };
        
        msmFactory.GetCustomerData = function (parent_scope, customer_name) {
            // customer_name = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.get(AppConfig.serviceUrl + 'customer/' + customer_name + '/values').success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/values', 'result': results, isCollapsed: true});
                        getCustomerDataEvent(parent_scope, results.values[0]['customer_details'], null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            getCustomerDataEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            getCustomerDataEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/values',
                                     'requestData': '',
                                     'method'     : 'GET'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/values', 'result': results, isCollapsed: true});
                        getCustomerDataEvent(parent_scope, results.values[0]['customer_details'], null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            getCustomerDataEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            getCustomerDataEvent(parent_scope, null, null);
                    });
            }
            else {
                // Need to pull up from localstorage
            }
        };

        function getCustomerDataEvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnGetCustomerDataEvent', response, error);
        };
        
        msmFactory.ListCustomers = function (parent_scope) {
            
            if (AppConfig.environment === 'production'){
                return $http.get(AppConfig.serviceUrl + 'customer').success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'customer', 'result': results, isCollapsed: true});
                        listCustomerEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            listCustomerEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            listCustomerEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer',
                                     'requestData': '',
                                     'method'     : 'GET'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'customer', 'result': results, isCollapsed: true});
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
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results["list_customers"], isCollapsed: true});
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
            $rootScope.$broadcast('OnListCustomerEvent', response, error);
        };
        
        msmFactory.GetCustomer = function (parent_scope, customer_name) {
            // data = {"name": <string>}
            
            if (AppConfig.environment === 'production'){
                return $http.get(AppConfig.serviceUrl + 'customer/' + customer_name).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'customer/' + customer_name, 'result': results, isCollapsed: true});
                        getCustomerEvent(parent_scope, results, null);
                    }).error(
                    function (error, status){
                        if (error != null)
                            getCustomerEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            getCustomerEvent(parent_scope, null, null);       
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name,
                                     'requestData': '',
                                     'method'     : 'GET'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'customer/' + customer_name, 'result': results, isCollapsed: true});
                        getCustomerEvent(parent_scope, results, null);
                    }).error(
                    function (error, status){
                        if (error != null)
                            getCustomerEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            getCustomerEvent(parent_scope, null, null);       
                    });
            }
            else {
                // this is only test. This return data from stub_data.json
            }
        };
        
        function getCustomerEvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnGetCustomerEvent', response, error);
        }    
        
        msmFactory.DeleteCustomer = function (parent_scope, customer_name) {
            // customer_name = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.delete(AppConfig.serviceUrl + 'customer/' + customer_name).success(
                    function (results) {
                        if (results && 'message' in results){
                            results['customer_name'] = customer_name;
                        }
                        else {
                            results = {'customer_name' : customer_name};
                        }    
                        $rootScope.apiCalls.push({'method': 'DELETE', 'api': 'msm/v1.0/' + 'customer/' + customer_name, 'result': results, isCollapsed: true});
                        deleteCustomerEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null){
                            error['customer_name'] = customer_name;
                            deleteCustomerEvent(parent_scope, error, status + " : " + error.Message);
                        }    
                        else{
                            deleteCustomerEvent(parent_scope, null, null);
                        }    
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name,
                                     'requestData': '',
                                     'method'     : 'DELETE'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        if (results && 'message' in results){
                            results['customer_name'] = customer_name;
                        }
                        else {
                            results = {'customer_name' : customer_name};
                        }  
                        $rootScope.apiCalls.push({'method': 'DELETE', 'api': 'msm/v1.0/' + 'customer/' + customer_name, 'result': results, isCollapsed: true});
                        deleteCustomerEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null){
                            error['customer_name'] = customer_name;
                            deleteCustomerEvent(parent_scope, error, status + " : " + error.Message);
                        }    
                        else{
                            deleteCustomerEvent(parent_scope, null, null);
                        }   
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        results = {'customer_name' : customer_name};
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results, isCollapsed: true});
                        deleteCustomerEvent(parent_scope, results, null);
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
            $rootScope.$broadcast('OnDeleteCustomerEvent', response, error);
        };

        msmFactory.ListVsiteOGR = function (parent_scope, site_name) {
            // customer_name = <string>
            // site_name = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.get(AppConfig.serviceUrl + 'vSite/' + site_name + '/cpe').success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'vSite/' + site_name + '/cpe', 'result': results, isCollapsed: true});
                        results['site_name'] = site_name;
                        //console.log(results);
                        listVsiteOGREvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            listVsiteOGREvent(parent_scope, null, status + " : " + error.Message);
                        else
                            listVsiteOGREvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'vSite/' + site_name + '/cpe',
                                     'requestData': '',
                                     'method'     : 'GET'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'vSite/' + site_name + '/cpe', 'result': results, isCollapsed: true});
                        results['site_name'] = site_name;
                        //console.log(results);
                        listVsiteOGREvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            listVsiteOGREvent(parent_scope, null, status + " : " + error.Message);
                        else
                            listVsiteOGREvent(parent_scope, null, null);
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'init.json').success(
                    function (results) {
                        results = {"cpe" : results["cpe"], 'site_name' : site_name};
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results, isCollapsed: true});
                        listVsiteOGREvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            listVsiteOGREvent(parent_scope, null, status + " : " + error.Message);
                        else
                            listVsiteOGREvent(parent_scope, null, null);
                    });
            }
        };

        function listVsiteOGREvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnListVsiteOGREvent', response, error);
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
            var site_name = site_data.site_name;
            site_data["password"] = "DEMO123";
            delete site_data.site_name;
            delete site_data.type;
            delete site_data.status;
            delete site_data.cpe[0].cpeName;
            if (AppConfig.environment === 'production'){
                return $http.post(AppConfig.serviceUrl + 'customer/' + customer_name + '/vSite/' + site_name, site_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/vSite/' + site_name, 'result': results, isCollapsed: true});
                        initCustomerVsiteEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            initCustomerVsiteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            initCustomerVsiteEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/vSite/' + site_name,
                                     'requestData': JSON.stringify(site_data),
                                     'method'     : 'POST'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/vSite/' + site_name, 'result': results, isCollapsed: true});
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
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results["init_customer_vsite"], isCollapsed: true});
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
            $rootScope.$broadcast('OnInitCustomerVsiteEvent', response, error);
        };
        
        msmFactory.ListCustomerVsite = function (parent_scope, customer_name, site_name) {
            // customer_name = <string>
            // site_name = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.get(AppConfig.serviceUrl + 'customer/' + customer_name + '/vSite/' + site_name).success(
                    function (results) {
                        results['site_name'] = site_name;
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/vSite/' + site_name, 'result': results, isCollapsed: true});
                        //console.log(results);
                        listCustomerVsiteEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            listCustomerVsiteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            listCustomerVsiteEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/vSite/' + site_name,
                                     'requestData': '',
                                     'method'     : 'GET'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        results['site_name'] = site_name;
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/vSite/' + site_name, 'result': results, isCollapsed: true});
                        //console.log(results);
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
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results["list_customer_vsite"][site_name], isCollapsed: true});
                        listCustomerVsiteEvent(parent_scope, results["list_customer_vsite"][site_name], null);
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
            $rootScope.$broadcast('OnListCustomerVsiteEvent', response, error);
        };
        
        msmFactory.ListCustomerVsiteOGR = function (parent_scope, customer_name, site_name) {
            // customer_name = <string>
            // site_name = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.get(AppConfig.serviceUrl + 'customer/' + customer_name + '/vSite/' + site_name + '/cpe').success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/vSite/' + site_name + '/cpe', 'result': results, isCollapsed: true});
                        results['site_name'] = site_name;
                        //console.log(results);
                        listCustomerVsiteOGREvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            listCustomerVsiteOGREvent(parent_scope, null, status + " : " + error.Message);
                        else
                            listCustomerVsiteOGREvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/vSite/' + site_name + '/cpe',
                                     'requestData': '',
                                     'method'     : 'GET'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/vSite/' + site_name + '/cpe', 'result': results, isCollapsed: true});
                        results['site_name'] = site_name;
                        //console.log(results);
                        listCustomerVsiteOGREvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            listCustomerVsiteOGREvent(parent_scope, null, status + " : " + error.Message);
                        else
                            listCustomerVsiteOGREvent(parent_scope, null, null);
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results["list_customer_vsite_ogr"][site_name], isCollapsed: true});
                        listCustomerVsiteOGREvent(parent_scope, results["list_customer_vsite_ogr"][site_name], null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            listCustomerVsiteOGREvent(parent_scope, null, status + " : " + error.Message);
                        else
                            listCustomerVsiteOGREvent(parent_scope, null, null);
                    });
            }
        };

        function listCustomerVsiteOGREvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnListCustomerVsiteOGREvent', response, error);
        };
        
        msmFactory.DeleteCustomerVsite = function (parent_scope, customer_name, site_name) {
            // customer_name = <string>
            // site_name = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.delete(AppConfig.serviceUrl + 'customer/' + customer_name + '/vSite/' + site_name).success(
                    function (results) {
                        results = {"site_name" : site_name};
                        $rootScope.apiCalls.push({'method': 'DELETE', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/vSite/' + site_name, 'result': results, isCollapsed: true});
                        //console.log(results);
                        deleteCustomerVsiteEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            deleteCustomerVsiteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            deleteCustomerVsiteEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/vSite/' + site_name,
                                     'requestData': '',
                                     'method'     : 'DELETE'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        results = {"site_name" : site_name};
                        $rootScope.apiCalls.push({'method': 'DELETE', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/vSite/' + site_name, 'result': results, isCollapsed: true});
                        //console.log(results);
                        deleteCustomerVsiteEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            deleteCustomerVsiteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            deleteCustomerVsiteEvent(parent_scope, null, null);
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results["delete_customer_vsite"][site_name], isCollapsed: true});
                        deleteCustomerVsiteEvent(parent_scope, results["delete_customer_vsite"][site_name], null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            deleteCustomerVsiteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            deleteCustomerVsiteEvent(parent_scope, null, null);
                    });
            }
        };

        function deleteCustomerVsiteEvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnDeleteCustomerVsiteEvent', response, error);
        };
        
        msmFactory.InitExternalVsite = function (parent_scope, customer_name, site_data) {
            // customer_name = <string>
            /* site_data = {'site_name': 'AWS',
                            'type': 'external_site',
                            'as_number': 22,
                            'gateway_ip_address': '192.168.1.100',
                            'ip_range': ['192.168.1.0/24', '192.168.2.0/24', '192.168.3.0/24'],
                           }
            */
            var response = angular.copy($rootScope.saved_external_site);
            if (!response){
                response = {'values' : [{'external_sites' : [], 'customer_details' : {}}]};
            }
            response.values[0]['external_sites'].push(site_data);
            
            if (AppConfig.environment === 'production'){
                return $http.put(AppConfig.serviceUrl + 'customer/' + customer_name + '/values', response).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'PUT', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/values', 'result': results, isCollapsed: true});
                        //console.log(results);
                        initExternalVsiteEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            initExternalVsiteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            initExternalVsiteEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/values',
                                     'requestData': JSON.stringify(response),
                                     'method'     : 'PUT'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'PUT', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/values', 'result': results, isCollapsed: true});
                        //console.log(results);
                        initExternalVsiteEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            initExternalVsiteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            initExternalVsiteEvent(parent_scope, null, null);
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results["init_external_vsite"], isCollapsed: true});
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
            $rootScope.$broadcast('OnInitExternalVsiteEvent', response, error);
        };
        
        msmFactory.GetExternalVsite = function (parent_scope, customer_name) {
            // customer_name = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.get(AppConfig.serviceUrl + 'customer/' + customer_name + '/values').success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/values', 'result': results, isCollapsed: true});
                        if (results.values == null){
                            results.values = [{'external_sites' : [], 'customer_details' : {}}];
                        }
                        getExternalVsiteEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            getExternalVsiteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            getExternalVsiteEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/values',
                                     'requestData': '',
                                     'method'     : 'GET'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/values', 'result': results, isCollapsed: true});
                        if (results.values == null){
                            results.values = [{'external_sites' : [], 'customer_details' : {}}];
                        }
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results, isCollapsed: true});
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
            }
        };

        function getExternalVsiteEvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnGetExternalVsiteEvent', response, error);
        };
        
        msmFactory.AssociateRoutes = function (parent_scope, customer_name, connection) {
            // customer_name = <string>
            // connection = {"vSiteIdA": <id:string>, "subnetA": <cidr:string>, "vSiteIdB": <id:string>, "subnetB": <cidr:string>}
            
            var connection_data = { "connections" : [] };
            if (connection.constructor !== Array){
                connection = [connection];
            }
            angular.forEach(connection, function(value, index){
                var new_data_dict = { "vSiteIdA": value.site_name,
                                      "subnetA": value.subnet,
                                      "vSiteIdB": value.connect_to,
                                      "subnetB": value.ip_range };
                connection_data.connections.push(angular.copy(new_data_dict));
            });
            if (AppConfig.environment === 'production'){
                
                return $http.post(AppConfig.serviceUrl + 'customer/' + customer_name + '/associateRoute', connection_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/associateRoute', 'result': results, isCollapsed: true});
                        //console.log(results);
                        associateRouteEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            associateRouteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            associateRouteEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/associateRoute',
                                     'requestData': JSON.stringify(connection_data),
                                     'method'     : 'POST'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/associateRoute', 'result': results, isCollapsed: true});
                        //console.log(results);
                        associateRouteEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            associateRouteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            associateRouteEvent(parent_scope, null, null);
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results["associate_routes"], isCollapsed: true});
                        associateRouteEvent(parent_scope, results["associate_routes"], null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            associateRouteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            associateRouteEvent(parent_scope, null, null);
                    });
            }
        };

        function associateRouteEvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnAssociateRouteEvent', response, error);
        };
        
        msmFactory.DisAssociateRoutes = function (parent_scope, customer_name, connection) {
            // customer_name = <string>
            // connections = {"vSiteIdA": <id:string>, "subnetA": <cidr:string>, "vSiteIdB": <id:string>, "subnetB": <cidr:string>}
            
            var connection_data = { "connections" : [] };
            if (connection.constructor !== Array){
                connection = [connection];
            }
            angular.forEach(connection, function(value, index){
                var new_data_dict = { "vSiteIdA": value.site_name,
                                      "subnetA": value.subnet,
                                      "vSiteIdB": value.connect_to,
                                      "subnetB": value.ip_range };
                connection_data.connections.push(angular.copy(new_data_dict));
            });
            if (AppConfig.environment === 'production'){
                return $http.post(AppConfig.serviceUrl + 'customer/' + customer_name + '/disassociateRoute', connection_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/disassociateRoute', 'result': results, isCollapsed: true});
                        //console.log(results);
                        disassociateRouteEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            disassociateRouteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            disassociateRouteEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/disassociateRoute',
                                     'requestData': JSON.stringify(connection_data),
                                     'method'     : 'POST'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/disassociateRoute', 'result': results, isCollapsed: true});
                        //console.log(results);
                        disassociateRouteEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            disassociateRouteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            disassociateRouteEvent(parent_scope, null, null);
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results["associate_routes"], isCollapsed: true});
                        disassociateRouteEvent(parent_scope, results["associate_routes"], null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            disassociateRouteEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            disassociateRouteEvent(parent_scope, null, null);
                    });
            }
        };

        function disassociateRouteEvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnDisAssociateRouteEvent', response, error);
        };
        
        msmFactory.QueryRoutes = function (parent_scope, customer_name, site_name) {
            // customer_name = <string>
            // site_name = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.get(AppConfig.serviceUrl + 'customer/' + customer_name + '/routes/' + site_name).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/routes/' + site_name, 'result': results, isCollapsed: true});
                        results['site_name'] = site_name;
                        //console.log(results);
                        queryRoutesEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            queryRoutesEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            queryRoutesEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/routes/' + site_name,
                                     'requestData': '',
                                     'method'     : 'GET'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/routes/' + site_name, 'result': results, isCollapsed: true});
                        results['site_name'] = site_name;
                        //console.log(results);
                        queryRoutesEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            queryRoutesEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            queryRoutesEvent(parent_scope, null, null);
                    });
            }
            else {
                //pass
            }
        };

        function queryRoutesEvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnQueryRoutesEvent', response, error);
        };
        
        msmFactory.GetImages = function (parent_scope, site_name) {
            // site_name = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.get(AppConfig.serviceUrl + 'images/' + site_name).success(
                    function (results) {
                        for (var i = results.images.length - 1; i >= 0; i--) {
                            if (results.images[i].name.toLowerCase().includes('ogr')) {
                                results.images.splice(i, 1);
                            }
                        }
                        results['site_name'] = site_name;
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'images/' + site_name, 'result': results, isCollapsed: true});
                        getImagesEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            getImagesEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            getImagesEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'images/' + site_name,
                                     'requestData': '',
                                     'method'     : 'GET'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        for (var i = results.images.length - 1; i >= 0; i--) {
                            if (results.images[i].name.toLowerCase().includes('ogr')) {
                                results.images.splice(i, 1);
                            }
                        }
                        results['site_name'] = site_name;
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'images/' + site_name, 'result': results, isCollapsed: true});
                        getImagesEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            getImagesEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            getImagesEvent(parent_scope, null, null);
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        results = results["vm_images"][site_name];
                        results['site_name'] = site_name;
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results, isCollapsed: true});
                        getImagesEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            getImagesEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            getImagesEvent(parent_scope, null, null);
                    });
            }
        };

        function getImagesEvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnGetImagesEvent', response, error);
        };
        
        msmFactory.GetFlavors = function (parent_scope, site_name) {
            // site_name = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.get(AppConfig.serviceUrl + 'flavors/' + site_name).success(
                    function (results) {
                        for (var i = results.flavors.length - 1; i >= 0; i--) {
                            if (results.flavors[i].name.toLowerCase().includes('ogr')) {
                                results.flavors.splice(i, 1);
                            }
                        }
                        results['site_name'] = site_name;
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'flavors/' + site_name, 'result': results, isCollapsed: true});
                        getFlavorsEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            getFlavorsEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            getFlavorsEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'flavors/' + site_name,
                                     'requestData': '',
                                     'method'     : 'GET'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        for (var i = results.flavors.length - 1; i >= 0; i--) {
                            if (results.flavors[i].name.toLowerCase().includes('ogr')) {
                                results.flavors.splice(i, 1);
                            }
                        }
                        results['site_name'] = site_name;
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'flavors/' + site_name, 'result': results, isCollapsed: true});
                        getFlavorsEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            getFlavorsEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            getFlavorsEvent(parent_scope, null, null);
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        results = results["vm_flavors"][site_name];
                        results['site_name'] = site_name;
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results, isCollapsed: true});
                        getFlavorsEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            getFlavorsEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            getFlavorsEvent(parent_scope, null, null);
                    });
            }
        };

        function getFlavorsEvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnGetFlavorsEvent', response, error);
        };
        
        msmFactory.CreateVM = function (parent_scope, customer_name, site_name, vm_data) {
            /*
            // customer_name = <string>
            // site_name = <string>
            // vm_data = { "name": <string>,
                           "imageRef": <string>,
                           "flavorRef": <string>,
                           "fixedIP": <string>,
                           "floatingIP": <boolean>,
                           "srId": <string> }
            */
            vm_data['srId'] = Math.floor(100000 + Math.random() * 900000).toString();
            if (AppConfig.environment === 'production'){
                return $http.put(AppConfig.serviceUrl + 'customer/' + customer_name + '/createVM/' + site_name, vm_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'PUT', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/createVM/' + site_name, 'result': results, isCollapsed: true});
                        //console.log(results);
                        createVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            createVMEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            createVMEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/createVM/' + site_name,
                                     'requestData': JSON.stringify(vm_data),
                                     'method'     : 'PUT'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        $rootScope.apiCalls.push({'method': 'PUT', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/createVM/' + site_name, 'result': results, isCollapsed: true});
                        //console.log(results);
                        createVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            createVMEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            createVMEvent(parent_scope, null, null);
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        vm_data['uuid'] = "a0f8ded9-93c6-4ee6-bf75-8154b50e7014";
                        vm_data['vSiteId'] = site_name;
                        results = vm_data;
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results, isCollapsed: true});
                        createVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            createVMEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            createVMEvent(parent_scope, null, null);
                    });
            }
        };

        function createVMEvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnCreateVMEvent', response, error);
        };
        
        msmFactory.GetVM = function (parent_scope, customer_name, site_name, vm_name, vm_uuid, vm_srId) {
            // customer_name = <string>
            // site_name = <string>
            // vm_uuid = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.post(AppConfig.serviceUrl + 'customer/' + customer_name + '/getVM/' + vm_uuid + '/vSite/' + site_name, {}).success(
                    function (results) {
                        results["site_name"] = site_name;
                        results["name"] = vm_name;
                        if (AppConfig.vm_polling !== "on"){
                            $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/getVM/' + vm_uuid + '/vSite/' + site_name, 'result': results, isCollapsed: true});
                        }
                        //console.log(results);
                        getVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null){
                            $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/getVM/' + vm_uuid + '/vSite/' + site_name, 'result': error, isCollapsed: true});
                            error["site_name"] = site_name;
                            error["name"] = vm_name;
                            error["srId"] = vm_srId;
                            getVMEvent(parent_scope, error, status + " : " + error.Message);
                        }    
                        else {
                            getVMEvent(parent_scope, null, null);
                        }    
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/getVM/' + vm_uuid + '/vSite/' + site_name,
                                     'requestData': '{}',
                                     'method'     : 'POST'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        results["site_name"] = site_name;
                        results["name"] = vm_name;
                        if (AppConfig.vm_polling !== "on"){
                            $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/getVM/' + vm_uuid + '/vSite/' + site_name, 'result': results, isCollapsed: true});
                        }
                        //console.log(results);
                        getVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null){
                            $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/getVM/' + vm_uuid + '/vSite/' + site_name, 'result': error, isCollapsed: true});
                            error["site_name"] = site_name;
                            error["name"] = vm_name;
                            error["srId"] = vm_srId;
                            getVMEvent(parent_scope, error, status + " : " + error.Message);
                        }    
                        else {
                            getVMEvent(parent_scope, null, null);
                        }
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        results = {'uuid':"a0f8ded9-93c6-4ee6-bf75-8154b50e7014", 'name':vm_name, 'site_name':site_name, 'state':'on', 'srId' : vm_srId};
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results, isCollapsed: true});
                        getVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            getVMEvent(parent_scope, null, status + " : " + error.Message);
                        else
                            getVMEvent(parent_scope, null, null);
                    });
            }
        };

        function getVMEvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnGetVMEvent', response, error);
        };
        
        msmFactory.StartVM = function (parent_scope, customer_name, site_name, vm_name, vm_uuid, vm_srId) {
            // customer_name = <string>
            // site_name = <string>
            // vm_uuid = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.post(AppConfig.serviceUrl + 'customer/' + customer_name + '/bootVM/' + vm_uuid + '/vSite/' + site_name, {}).success(
                    function (results) {
                        results = {"site_name" : site_name, "name" : vm_name, "srId" : vm_srId};
                        $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/bootVM/' + vm_uuid + '/vSite/' + site_name, 'result': results, isCollapsed: true});
                        //console.log(results);
                        startVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null){
                            var results = {"site_name" : site_name, "name" : vm_name, "srId" : vm_srId};
                            startVMEvent(parent_scope, results, error.message);
                        }
                        else
                            startVMEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/bootVM/' + vm_uuid + '/vSite/' + site_name,
                                     'requestData': '{}',
                                     'method'     : 'POST'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        results = {"site_name" : site_name, "name" : vm_name, "srId" : vm_srId};
                        $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/bootVM/' + vm_uuid + '/vSite/' + site_name, 'result': results, isCollapsed: true});
                        //console.log(results);
                        startVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null){
                            var results = {"site_name" : site_name, "name" : vm_name, "srId" : vm_srId};
                            startVMEvent(parent_scope, results, error.message);
                        }    
                        else
                            startVMEvent(parent_scope, null, null);
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        results = results["get_vm"]
                        results.name = vm_name;
                        results["site_name"] = site_name;
                        results["srId"] = vm_srId;
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results, isCollapsed: true});
                        startVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            startVMEvent(parent_scope, null, error.message);
                        else
                            startVMEvent(parent_scope, null, null);
                    });
            }
        };

        function startVMEvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnStartVMEvent', response, error);
        };
        
        msmFactory.StopVM = function (parent_scope, customer_name, site_name, vm_name, vm_uuid, vm_srId) {
            // customer_name = <string>
            // site_name = <string>
            // vm_uuid = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.post(AppConfig.serviceUrl + 'customer/' + customer_name + '/shutdownVM/' + vm_uuid + '/vSite/' + site_name, {}).success(
                    function (results) {
                        results = {"site_name" : site_name, "name" : vm_name, "srId" : vm_srId};
                        $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/shutdownVM/' + vm_uuid + '/vSite/' + site_name, 'result': results, isCollapsed: true});
                        //console.log(results);
                        stopVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        console.log(error, status)
                        if (error != null){
                            var results = {"site_name" : site_name, "name" : vm_name, "srId" : vm_srId};    
                            stopVMEvent(parent_scope, results, error.message);
                        }    
                        else
                            stopVMEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/shutdownVM/' + vm_uuid + '/vSite/' + site_name,
                                     'requestData': '{}',
                                     'method'     : 'POST'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        results = {"site_name" : site_name, "name" : vm_name, "srId" : vm_srId};
                        $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/shutdownVM/' + vm_uuid + '/vSite/' + site_name, 'result': results, isCollapsed: true});
                        //console.log(results);
                        stopVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null){
                            var results = {"site_name" : site_name, "name" : vm_name, "srId" : vm_srId};    
                            stopVMEvent(parent_scope, results, error.message);
                        }    
                        else
                            stopVMEvent(parent_scope, null, null);
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        results = results["get_vm"]
                        results.name = vm_name;
                        results["site_name"] = site_name;
                        results["srId"] = vm_srId;
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results, isCollapsed: true});
                        stopVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            stopVMEvent(parent_scope, null, status + " : " + error.message);
                        else
                            stopVMEvent(parent_scope, null, null);
                    });
            }
        };

        function stopVMEvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnStopVMEvent', response, error);
        };
        
        msmFactory.RebootVM = function (parent_scope, customer_name, site_name, vm_name, vm_uuid, vm_srId) {
            // customer_name = <string>
            // site_name = <string>
            // vm_uuid = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.post(AppConfig.serviceUrl + 'customer/' + customer_name + '/rebootVM/' + vm_uuid + '/vSite/' + site_name, {}).success(
                    function (results) {
                        results = {"site_name" : site_name, "name" : vm_name, "srId" : vm_srId};
                        $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/rebootVM/' + vm_uuid + '/vSite/' + site_name, 'result': results, isCollapsed: true});
                        //console.log(results);
                        rebootVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null){
                            var results = {"site_name" : site_name, "name" : vm_name, "srId" : vm_srId};    
                            rebootVMEvent(parent_scope, results, error.message);
                        }    
                        else
                            rebootVMEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/rebootVM/' + vm_uuid + '/vSite/' + site_name,
                                     'requestData': '{}',
                                     'method'     : 'POST'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        results = {"site_name" : site_name, "name" : vm_name, "srId" : vm_srId};
                        $rootScope.apiCalls.push({'method': 'POST', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/rebootVM/' + vm_uuid + '/vSite/' + site_name, 'result': results, isCollapsed: true});
                        //console.log(results);
                        rebootVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null){
                            var results = {"site_name" : site_name, "name" : vm_name, "srId" : vm_srId};    
                            rebootVMEvent(parent_scope, results, error.message);
                        }    
                        else
                            rebootVMEvent(parent_scope, null, null);
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        results = results["get_vm"]
                        results.name = vm_name;
                        results["site_name"] = site_name;
                        results["srId"] = vm_srId;
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results, isCollapsed: true});
                        rebootVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            rebootVMEvent(parent_scope, null, status + " : " + error.message);
                        else
                            rebootVMEvent(parent_scope, null, null);
                    });
            }
        };

        function rebootVMEvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnRebootVMEvent', response, error);
        };
        
        msmFactory.DeleteVM = function (parent_scope, customer_name, site_name, vm_name, vm_uuid, vm_srId) {
            // customer_name = <string>
            // site_name = <string>
            // vm_uuid = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.delete(AppConfig.serviceUrl + 'customer/' + customer_name + '/deleteVM/' + vm_uuid + '/vSite/' + site_name, {}).success(
                    function (results) {
                        results = {"site_name" : site_name, "name" : vm_name, "srId" : vm_srId};
                        $rootScope.apiCalls.push({'method': 'DELETE', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/deleteVM/' + vm_uuid + '/vSite/' + site_name, 'result': results, isCollapsed: true});
                        //console.log(results);
                        deleteVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null){
                            error["site_name"] = site_name;
                            error["name"] = vm_name;
                            error["srId"] = vm_srId;
                            deleteVMEvent(parent_scope, error, status + " : " + error.message);
                        }    
                        else{
                            deleteVMEvent(parent_scope, null, null);
                        }
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/deleteVM/' + vm_uuid + '/vSite/' + site_name,
                                     'requestData': '{}',
                                     'method'     : 'DELETE'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        results = {"site_name" : site_name, "name" : vm_name, "srId" : vm_srId};
                        $rootScope.apiCalls.push({'method': 'DELETE', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/deleteVM/' + vm_uuid + '/vSite/' + site_name, 'result': results, isCollapsed: true});
                        //console.log(results);
                        deleteVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null){
                            error["site_name"] = site_name;
                            error["name"] = vm_name;
                            error["srId"] = vm_srId;
                            deleteVMEvent(parent_scope, error, status + " : " + error.message);
                        }    
                        else{
                            deleteVMEvent(parent_scope, null, null);
                        }    
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        results = {"site_name" : site_name, "name" : vm_name, "srId" : vm_srId};
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results, isCollapsed: true});
                        deleteVMEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            deleteVMEvent(parent_scope, null, status + " : " + error.message);
                        else
                            deleteVMEvent(parent_scope, null, null);
                    });
            }
        };

        function deleteVMEvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnDeleteVMEvent', response, error);
        };
        
        msmFactory.getVMConsole = function (parent_scope, customer_name, site_name, vm_name, vm_uuid, vm_srId) {
            // customer_name = <string>
            // site_name = <string>
            // vm_uuid = <string>
            
            if (AppConfig.environment === 'production'){
                return $http.get(AppConfig.serviceUrl + 'customer/' + customer_name + '/getVMVncConsole/' + vm_uuid + '/vSite/' + site_name, {}).success(
                    function (results) {
                        results["site_name"] = site_name;
                        results["srId"] = vm_srId;
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/getVMVncConsole/' + vm_uuid + '/vSite/' + site_name, 'result': results, isCollapsed: true});
                        //console.log(results);
                        getVMConsoleEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null){
                            var results = {"site_name" : site_name, "name" : vm_name, "srId" : vm_srId};
                            getVMConsoleEvent(parent_scope, results, error.message);
                        }    
                        else
                            getVMConsoleEvent(parent_scope, null, null);
                    });
            }
            else if (AppConfig.environment === 'redirection'){
                var redirect_data = {
                                     'ajaxReqURL' : AppConfig.serviceUrl + 'customer/' + customer_name + '/getVMVncConsole/' + vm_uuid + '/vSite/' + site_name,
                                     'requestData': '{}',
                                     'method'     : 'GET'
                                    }
                return $http.post(AppConfig.redirectUrl, redirect_data).success(
                    function (results) {
                        results["site_name"] = site_name;
                        results["srId"] = vm_srId;
                        $rootScope.apiCalls.push({'method': 'GET', 'api': 'msm/v1.0/' + 'customer/' + customer_name + '/getVMVncConsole/' + vm_uuid + '/vSite/' + site_name, 'result': results, isCollapsed: true});
                        //console.log(results);
                        getVMConsoleEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null){
                            var results = {"site_name" : site_name, "name" : vm_name, "srId" : vm_srId};
                            getVMConsoleEvent(parent_scope, results, error.message);
                        }    
                        else
                            getVMConsoleEvent(parent_scope, null, null);
                    });
            }
            else {
                return $http.get(AppConfig.localUrl + 'stub_data.json').success(
                    function (results) {
                        results = {"site_name" : site_name, "name" : vm_name, "state" : "on", "uuid" : "6de68d6a-08e1-410e-afe9-ff564cb12d0b", "vnc_console" : "https://en.wikipedia.org/wiki/Tutankhamun"};
                        $rootScope.apiCalls.push({'method': 'GET', 'api': AppConfig.localUrl + 'stub_data.json', 'result': results, isCollapsed: true});
                        getVMConsoleEvent(parent_scope, results, null);
                    }).error(
                    function (error, status) {
                        if (error != null)
                            getVMConsoleEvent(parent_scope, null, status + " : " + error.message);
                        else
                            getVMConsoleEvent(parent_scope, null, null);
                    });
            }
        };

        function getVMConsoleEvent(parent_scope, response, error) {
            $rootScope.$broadcast('OnGetVMConsoleEvent', response, error);
        };
        
        return msmFactory;
    };

    msmFactory.$inject = injectParams;

    app.factory('MSMService', msmFactory).config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
        $httpProvider.defaults.timeout = 10000;
        //$httpProvider.defaults.useXDomain = true;
        //delete $httpProvider.defaults.headers.common['X-Requested-With'];
        //$httpProvider.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
        //$httpProvider.defaults.headers.common['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS';
    }]);
});