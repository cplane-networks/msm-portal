'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope', '$rootScope', '$state', '$timeout', 'AppConfig', 'dialogs', 'InitService', 'StorageService', 'MSMService', 'GraphService'];   
   
    var controller_test = function ($scope, $rootScope, $state, $timeout, AppConfig, dialogs, InitService, StorageService, MSMService, GraphService){      
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
        
        function sleep(milliseconds) {
            var start = new Date().getTime();
            for (var i = 0; i < 1e7; i++) {
                if ((new Date().getTime() - start) > milliseconds){
                    break;
                }
            }
        }
        
        function calculate_position(node_type, node_level){
            var node_x = 1000 / 3 + 10;
            var node_y = 50;
            var result = { x : node_x, y : node_y };
            
            if (node_type == "openstack_site"){
                if (node_level == 0)
                    result = {x : parseFloat(node_x), y : parseFloat(node_y)};
                else if (node_level == 1)
                    result = {x : parseFloat(node_x), y : parseFloat(node_y * 6)};
            }
            else if (node_type == "openstack_subnet")
            {
                if (node_level == 0)
                    result = {x : parseFloat(node_x + 150), y : parseFloat(node_y * 1.7-1)};
                else if (node_level == 1)
                    result = {x : parseFloat(node_x + 150), y : parseFloat(node_y * 6.8-6)};
            }
            else if (node_type == "openstack_ogr"){
                if (node_level == 0)
                    result = {x : parseFloat(node_x + 40), y : parseFloat(node_y * 3.5)};
                else if (node_level == 1)
                    result = {x : parseFloat(node_x + 40), y : parseFloat(node_y * 4.8)};
            }
            else if (node_type == "external_site"){
                node_x = 10;
                node_y = 10;
                if (node_level == 0)
                    result = {x : parseFloat(node_x), y : parseFloat(node_y)};
                else if (node_level > 0)
                    result = {x : parseFloat(node_x), y : parseFloat(node_y +160) * parseFloat(node_level)};
            }
            
            return result
        };
        
        $rootScope.$on('OnStorageAddCustomer', function(event){
            var res = StorageService.GetCustomer();
            $scope.customerName = res['customer_name'];
            $scope.serviceLevel = res['service_level'];
            $scope.clouds = res['max_cloud_sites'];
            $scope.sites = res['max_sites_vms'];
        })
        
		$rootScope.$on("OnStorageAddSite", function (event, site_name) {
            var site_details = StorageService.GetSite(site_name);
            
            if (site_details.site_data.type === 'openstack_site'){
                //add node
                var site_node = GraphService.AddOpenStackSite(site_name, calculate_position("openstack_site", site_details.site_level))
                //add subnet
                var site_subnet = GraphService.AddOpenStackSubnet(site_details.site_data.defaultSubnet, calculate_position("openstack_subnet", site_details.site_level));
                //add ogr
                var site_ogr = GraphService.AddOpenStackOgr(calculate_position("openstack_ogr", site_details.site_level));
                //link node subnet
                var link_site = GraphService.AddLink(site_node, site_subnet);
                //link subnet ogr
                var link_subnet = GraphService.AddLink(site_subnet, site_ogr);
                
                GraphService.graph.addCells([site_node, site_subnet, site_ogr, link_site, link_subnet]);
                
                StorageService.AddOrUpdateSubKey("node_details", site_details.site_data, "site_node", site_node.toJSON());
                site_details = StorageService.GetSite(site_name);
                StorageService.AddOrUpdateSubKey("node_details", site_details.site_data, "site_subnet_node", site_subnet.toJSON());
                site_details = StorageService.GetSite(site_name);
                StorageService.AddOrUpdateSubKey("node_details", site_details.site_data, "site_ogr_node", site_ogr.toJSON());
                site_details = StorageService.GetSite(site_name);
                
                if (site_details.site_level > 0){
                    var prev_site = StorageService.Get("node_details")[site_details.site_level - 1];
                    var prev_ogr = StorageService.GetNode(prev_site.site_name, "site_ogr_node");
                    //link ogr prev_ogr
                    var link_ogr = GraphService.AddLink(site_ogr, prev_ogr);
                    GraphService.graph.addCells([link_ogr]);
                }    
            }
            else if (site_details.site_data.type === 'external_site'){
                //add node
                var site_level = site_details.site_level;
                if (site_level > 1){
                    site_level -= 2
                }
                
                var site_node = GraphService.AddExternalSite(site_name, calculate_position("external_site", site_level))
                
                GraphService.graph.addCells([site_node]);
                
                StorageService.AddOrUpdateSubKey("node_details", site_details.site_data, "site_node", site_node.toJSON());
            }
            
        });
		
        $scope.toggleSlideMenu = function() {
            $scope.checked = !$scope.checked
        }
        
        $scope.addCustomer = function(){
            
            var dlg = dialogs.create(_dialog_path + "add_customer.tpl.html", 'customController', {data: "data", anotherVar: 'value', customer:'true'}, {}, 'ctrl');
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






