'use strict';

define(['app'], function (app){
    var injectParams = ['$scope','$state','$rootScope','$uibModalInstance','dialogs','InitService', 'StorageService', 'MSMService'];
    var customDialogController = function ($scope, $state, $rootScope, $uibModalInstance, dialogs, InitService, StorageService, MSMService){
        var _dialog_path  = "content/js/apps/templates/";
        
        init();
        function init(){
            
            InitService.GetLocalData($scope,'customer');
            
            $scope.$on("OnGetLocalData", function (event, result, error_msg) {
                $scope.custLevel = result.service_levels;
                $scope.serviceLevel = $scope.custLevel[0];
                
                if(result.max_cloud_sites !== 2){
                    $scope.custClouds = 2;
                }
                else{
                    $scope.custClouds = result.max_cloud_sites;
                }
                
                if(result.max_vms_per_site >5 ){
                    $scope.custSites = 5;
                }
                else if(result.max_vms_per_site <= 0){
                    $scope.custSites = 1;
                }
                else{
                    $scope.custSites = result.max_vms_per_site;
                }
            });
        };
        
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
