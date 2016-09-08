'use strict';

define(['app'], function (app){
    var injectParams = ['$scope','$state','$rootScope','$uibModalInstance','dialogs','InitService', 'StorageService', 'MSMService'];
    var customDialogController = function ($scope, $state, $rootScope, $uibModalInstance, dialogs, InitService, StorageService, MSMService){
        var _dialog_path  = "content/js/apps/templates/";
        
        init();
        function init(){
            InitService.GetLocalData($scope);
        }
            
        $scope.$on("OnGetLocalData", function (event, result, error_msg) {
            var customer  = result.customer;    // get data from json
            $scope.custLevel = customer.service_levels; 
            $scope.serviceLevel = $scope.custLevel[0];
            if(customer.max_cloud_sites !== 2){
                $scope.custClouds = 2;
            }
            else{
                $scope.custClouds = customer.max_cloud_sites;
            }
            if(customer.max_vms_per_site >5 ){
                $scope.custSites = 5;
            }
            else if(customer.max_vms_per_site <= 0){
                $scope.custSites = 1;
            }
            else{
                $scope.custSites = customer.max_vms_per_site;
            }
            
            
            // Add OpenStack Template - Input value generation
            $scope.OsSitesNames = [];
            $scope.subnetValList = [];
            var openstack_data  = result.openstack;  // get data from json
            for (var i = 0; i < openstack_data.length; i++){
                $scope.site_name = openstack_data[i].site_name ;
                $scope.OsSitesNames.push($scope.site_name);
                $scope.subnet_val = openstack_data[i].default_subnet_site;
                $scope.subnetValList.push($scope.subnet_val);
            }
            $scope.siteField1 = openstack_data[0].site_name;
            $scope.siteField2 = openstack_data[1].site_name;
            $scope.subnetField1 = openstack_data[0].default_subnet_site;
            $scope.subnetField2 = openstack_data[1].default_subnet_site;
            
            $scope.gatewayValList = [];
            var getway_data  = result.cpe;  // get data from json
            for (var i = 0; i < getway_data.length; i++){
                $scope.gateway_name = getway_data[i].cpeName ;
                $scope.gatewayValList.push($scope.gateway_name);
            }            
            $scope.gatewayField1 = getway_data[0].cpeName;
            $scope.gatewayField2 = getway_data[1].cpeName;
            
        });
        
        $scope.submitForm = function(param){
            // $scope.custName;
            // $scope.custLevel = $scope.serviceLevel;
            // $scope.custClouds = $scope.custClouds;
            // $scope.custSites = $scope.custSites;
        	if ($scope.userForm.$valid) {
                var isError = false;            
                var data = {customer_name:$scope.custName, 
                            service_level:$scope.serviceLevel, 
                    	    max_cloud_sites:$scope.custClouds, 
                            max_sites_vms: $scope.custSites}
                
                //$scope.custName = $scope.custName.replace(/^\s+|\s+$/g, '')
                if($scope.custName == ""){
                    alert("Please enter customer name!")
                }
                if($scope.custClouds !=2){
                    alert("Enter 2 clouds")
                    isError = true;
                }
                if($scope.custSites < 1 ||  $scope.custSites > 5 )
                {
                  alert("Enter sites between 1 to 5!")
                  isError = true;  
                }
			
                if(!isError)
                {
                    // call MSMService createCustomer service to create a customer
                    MSMService.CreateCustomer($scope,{name:$scope.custName});
                }
                
                $scope.$on("OnCreateCustomerEvent", function (event, response, error_msg)
                {
                    data = $.extend(data, response);
                    StorageService.AddCustomer(data);
                    //close the dialog
                    $uibModalInstance.close();
                });
            }    
        };
        
        
        $scope.CloseClipCancelReportDiag = function()
        {
            $uibModalInstance.dismiss('Canceled');
        }
	};
    customDialogController.$inject = injectParams;
    app.controller('customController', customDialogController);
});
