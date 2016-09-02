'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope', '$state','$rootScope', 'AppConfig', 'dialogs', 'StorageService'];   
   
    var controller_test = function ($scope, $state,$rootScope, AppConfig, dialogs, StorageService){
        var _dialog_path  = "content/js/apps/templates/dialog-share/";
        StorageService.RemoveAll();
        
        $scope.showApi = false;
        $scope.closeApiCalls = function(){
            $scope.showApi = true;
        }
        $scope.openApiCalls = function(){
            $scope.showApi = false;
        }
        
        $scope.modalShown = false;
        $scope.toggleModal = function() {
          $scope.modalShown = !$scope.modalShown;
        };
        $scope.checked = false;
        $scope.size = '100px';
        $scope.customerName = "";
        $scope.serviceLevel = "";
        $scope.clouds = "";
        $scope.sites = "";
        
        $rootScope.$on('OnStorageAddCustomer', function(event)
        {
            var res = StorageService.GetCustomer();
            $scope.customerName = res['customer_name'];
            $scope.serviceLevel = res['service_level'];
            $scope.clouds = res['max_cloud_sites'];
            $scope.sites = res['max_sites_vms'];
        })
        
        $scope.toggleSlideMenu = function() {
            $scope.checked = !$scope.checked
        }
        
        $scope.addCustomer = function(){
            var dlg = dialogs.create(_dialog_path + "add_customer.tpl.html", 'customController', {data: "data", anotherVar: 'value'}, {}, 'ctrl');
            dlg.result.then(function (custObj){
                // Data from add customer form//
                // $scope.customerName = custObj.name;
                // $scope.clouds = custObj.clouds;
                // $scope.sites = custObj.sites;
                // $scope.level = custObj.level;
            }, function () {
                if (angular.equals($scope.name, ''))
                    $scope.name = 'You did not enter in your name!';
            });
        }
        
        $scope.OpenCloudSiteView = function(){
            var dlg = dialogs.create(_dialog_path + "add_cloud.tpl.html", 'customController', {data: "data", anotherVar: 'value'}, {}, 'ctrl');
            dlg.result.then(function (cloudObj){
               // cloudObj.site ;
               // cloudObj.asNum;
               // cloudObj.ip;
               // cloudObj.gip;
            }, function () {
                if (angular.equals($scope.name, ''))
                    $scope.name = 'You did not enter in your name!';
            });
        };
    };
    
    controller_test.$inject = injectParams;
    app.controller('baseController', controller_test);
});






