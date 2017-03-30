'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope', '$rootScope', '$state', '$timeout', '$interval', 'AppConfig', 'dialogs', '$mdDialog', 'InitService', 'StorageService', 'MSMService', 'GraphService', 'QueueService', '$window', '$sce'];   
   
    var controller_test = function ($scope, $rootScope, $state, $timeout, $interval, AppConfig, dialogs, $mdDialog, InitService, StorageService, MSMService, GraphService, QueueService, $window, $sce){      
        var _dialog_path  = "content/js/apps/templates/dialog-share/";
        StorageService.RemoveAll();
        
        $rootScope.currentState = 0;
        $rootScope.subnetStatus = {site1:{bbSubnetChecked:true,inteResSubnetChecked:true,floatInterSubnetChecked:true},
                               site2:{bbSubnetChecked:true,inteResSubnetChecked:true,floatInterSubnetChecked:true}};
        
        $(window).resize(function() {
            $scope.main_box_height = ($(window).height()-139) + "px";
            $timeout(function() {
                GraphService.paper.setDimensions($('.draw-canvas-box').width(), $('.draw-canvas-box').height());
            }, 1);
        });
        
        $scope.$on('$viewContentLoaded', function(event){
            $scope.main_box_height = ($(window).height()-139) + "px";
            $timeout(function() {
                GraphService.paper.setDimensions($('.draw-canvas-box').width(), $('.draw-canvas-box').height());
            }, 1);
        });
        
        
        $scope.showApi = false;
        $scope.closeApiCalls = function(){
            $scope.showApi = true;
        }
        $scope.openApiCalls = function(){
            $scope.showApi = false;
        }
        $scope.clearApiCalls = function(){
            $rootScope.apiCalls = [];
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
        
        $rootScope.notification = "";
        $rootScope.apiCalls = [];
        $rootScope.activeSites = [];
        $rootScope.customer_details = "";
        $rootScope.customer_data = {};
        $rootScope.images = {};
        $rootScope.flavors = {};
        $rootScope.networks_map = {};
        $rootScope.networks = {};

        $rootScope.action = "";
		$rootScope.ExistingCustomer = [];
		$rootScope.CPE = {};
		$rootScope.FIP = {};
        $rootScope.vmsVal = {};
        $rootScope.customer_del_retry_count = 0;
        
        //polling
        $rootScope.polling = AppConfig.vm_polling.toLowerCase() === "on" ? true : false;
        $rootScope.vm_polling = function(){
            $rootScope.polling = $scope.polling;
            if ($scope.polling && AppConfig.environment !== 'development'){
                //console.log($scope.polling);
                var node_details = StorageService.Get("node_details");
                if (node_details){
                    angular.forEach(node_details, function(site, index){
                        if (site.type == 'openstack_site'){
                            var site_name = site.site_name;
                            var site_details = StorageService.GetSite(site_name);
                            if(site.VM){
                                angular.forEach(site.VM, function(vm, vm_index){
                                    QueueService.add(pollVM, {'timeout': 500, 'groupingId': vm.srId, 'params':{'site_name' : site_name, 'uuid' : vm.uuid, 'vm_name' : vm.name, 'vm_srId' : vm.srId}});
                                });
                            }    
                        }
                    });
                }
            }
            else {
                QueueService.removeAll();
            }
        }
        
        // Scale
        $rootScope.zoomValue = AppConfig.default_zoom;
        $rootScope.minZoomValue = AppConfig.min_zoom;
        $rootScope.maxZoomValue = AppConfig.max_zoom;
        $rootScope.zoomStep = AppConfig.zoom_step;
        
        
        $rootScope.zoom = function(delta){
            var vbox = V(GraphService.paper.viewport).bbox(true, GraphService.paper.svg);
            var offsetX = vbox.x + vbox.width / 2;
            var offsetY = vbox.y + vbox.height / 2;
            var newScale = null;
            
            if (delta == undefined){
                newScale = $scope.zoomValue / 100;
            }
            else {
                var currentScale = V(GraphService.paper.viewport).scale().sx;
                newScale = currentScale + parseInt(delta, 10) / 100;
                $scope.zoomValue = Math.floor(currentScale*100 + parseInt(delta, 10));
            }    
            $rootScope.zoomValue = $scope.zoomValue;
            GraphService.scaleGraph(offsetX, offsetY, newScale);
        }
        
        $rootScope.$on("mouseZoomEvent", function (event, zoomValue){
            $rootScope.zoomValue = zoomValue;
        });
        
        $interval(function() {
            $scope.zoomValue = $rootScope.zoomValue;
        }, 50);
        //Scale
        
        $rootScope.resetVMs = function(){
            $rootScope.action = "resetVM";
            $scope.closeApiCalls();
            $rootScope.notification = "Resetting VMs..."
            var customer_name = StorageService.Get("customer").customer_name;
            if (customer_name){
                disableMouseEvents();
                if (AppConfig.environment === "development"){
                    $rootScope.action = "";
                    var node_details = StorageService.Get("node_details");
                    var VMs = [];
                    angular.forEach(node_details, function(site, index){
                        if (site.type == 'openstack_site' && site.VM){
                            VMs = VMs.concat(site.VM);
                        }
                    });
                    angular.forEach(VMs, function(vm, index){
                        $timeout(function() {
                            MSMService.DeleteVM($scope, customer_name, vm.vSiteId, vm.name, vm.uuid, vm.srId)
                        }, index * 1000);
                    }); 
                }
                else{
                    MSMService.GetCustomer($scope, customer_name)
                }
                
                $scope.checkVM = $interval(function() {
                    var node_details = StorageService.Get("node_details");
                    var VMs = [];
                    angular.forEach(node_details, function(site, index){
                        if (site.type == 'openstack_site' && site.VM){
                            VMs = VMs.concat(site.VM);
                        }
                    });
                    if (VMs.length == 0 && angular.isDefined($scope.checkVM)) {
                        enableMouseEvents();
                        $scope.clearApiCalls();
                        $scope.openApiCalls();
                        $rootScope.notification = "";
                        $rootScope.vmsVal = {};
                        $rootScope.vm = "";
                        $interval.cancel($scope.checkVM);
                    }
                }, 5000);
            }
        }    
        
        $rootScope.resetALL = function(){
            $rootScope.action = "resetALL";
            $scope.closeApiCalls();
            $rootScope.notification = "Resetting All..."
            var customer_name = StorageService.Get("customer").customer_name;
            if (customer_name){
                if (AppConfig.environment === "development"){
                    GraphService.graph.clear();
                    StorageService.RemoveAll();
                    
                    $rootScope.action = "";
                    $scope.customerName = '';
                    $scope.serviceLevel = '';
                    $scope.clouds = '';
                    $scope.sites = '';
                    $scope.clearApiCalls();
                    $scope.openApiCalls();
                    $scope.cpe = {};
                    $scope.fip = {};
                    $scope.routes = {};
                    $scope.VMs = [];
                
                    $rootScope.notification = "";
                    $rootScope.apiCalls = [];
                    $rootScope.activeSites = [];
                    $rootScope.customer_details = "";
                    $rootScope.images = {};
                    $rootScope.flavors = {};
                    $rootScope.action = "";
                    $rootScope.ExistingCustomer = [];
                    $rootScope.CPE = {};
                    $rootScope.FIP = {};
                    $rootScope.maxExSites = '';
                    $rootScope.Iplength = '';
                    $rootScope.openstack_site = "";
                    $rootScope.external_site = "";
                    $rootScope.saved_external_site = "";
                    $rootScope.connection = "";
                    $rootScope.vmsVal = {};
                    $rootScope.vm = "";
                    $rootScope.cloudsCreated = [];
                    $rootScope.maxConnections = '';
                    $rootScope.currentState = 0;
                    $rootScope.customer_del_retry_count = 0;
                }
                else{
                    disableMouseEvents();
                    
                    MSMService.GetCustomer($scope, customer_name)
                    
                    $scope.checkVMs = $interval(function() {
                        var node_details = StorageService.Get("node_details");
                        var VMs = [];
                        angular.forEach(node_details, function(site, index){
                            if (site.type == 'openstack_site' && site.VM){
                                VMs = VMs.concat(site.VM);
                            }
                        });
                        
                        if (VMs.length == 0 && angular.isDefined($scope.checkVMs)) {
                            MSMService.GetExternalVsite($scope, customer_name);
                            $interval.cancel($scope.checkVMs);
                        }
                    }, 5000);
                    
                    $scope.checkExternalSites = $interval(function() {
                        var node_details = StorageService.Get("node_details");
                        var external_sites = [];
                        angular.forEach(node_details, function(site, index){
                            if (site.type == 'external_site'){
                                external_sites.push(site);
                            }
                        });
                        
                        var VMs = [];
                        angular.forEach(node_details, function(site, index){
                            if (site.type == 'openstack_site' && site.VM){
                                VMs = VMs.concat(site.VM);
                            }
                        });
                        
                        if (VMs.length == 0 && external_sites.length == 0 && angular.isDefined($scope.checkExternalSites)) {
                            deleteOpenStackSites(customer_name, $rootScope.customer_details.vSite);
                            $interval.cancel($scope.checkExternalSites);
                        }
                    }, 5000);
                }    
            }
            
        }
        
        $rootScope.LoadCustomer = function(customer_name){
            $rootScope.action = "loadCustomer";
            $rootScope.notification = "Retrieving Customer..."
            if (AppConfig.environment === "development"){
                $rootScope.action = "";
                $rootScope.notification = "";
            }
            else{
                $rootScope.zoomValue = AppConfig.default_zoom;
                GraphService.zoomValue = AppConfig.default_zoom;
                GraphService.scaleGraph(0, 0, AppConfig.default_zoom/100);
                disableMouseEvents();
                
                $scope.cpe = {"PaloAlto" : [], "Frankfurt" : []};
                $scope.fip = {"PaloAlto" : {}, "Frankfurt" : {}};
                $scope.routes = {"PaloAlto" : [], "Frankfurt" : []};
                $scope.VMs = [];
                
                InitService.GetLocalData($scope);
                $rootScope.$on("OnGetLocalData", function (event, result, error_msg) {
                    if ($rootScope.action == "loadCustomer"){
                        $rootScope.CPE = result.cpe;
                        $rootScope.FIP = result.fip;
                    }    
                });
                
                MSMService.GetCustomer($scope, customer_name);
            }
        }
        
        function sleep(milliseconds) {
            var start = new Date().getTime();
            for (var i = 0; i < 1e7; i++) {
                if ((new Date().getTime() - start) > milliseconds){
                    break;
                }
            }
        }
        
        function calculate_position(node_type, node_level){
            var node_x = 1000 / 3;
            var node_y = 50;
            var result = { x : node_x, y : node_y };
            
            if (node_type == "openstack_site"){
                if (node_level == 0)
                    result = {x : parseFloat(node_x), y : parseFloat(node_y)};
                else if (node_level == 1)
                    result = {x : parseFloat(node_x), y : parseFloat(node_y * 8)};
            }
            else if (node_type == "openstack_subnet"){
                if (node_level == 0)
                    result = {x : parseFloat(node_x + 100), y : parseFloat(node_y * 3)};
                else if (node_level == 1)
                    result = {x : parseFloat(node_x + 100), y : parseFloat(node_y * 6.8)};
            }
            else if (node_type == "openstack_ogr"){
                if (node_level == 0)
                    result = {x : parseFloat(node_x + 25), y : parseFloat(node_y * 3.5)};
                else if (node_level == 1)
                    result = {x : parseFloat(node_x + 25), y : parseFloat(node_y * 6.2)};
            }
            else if (node_type == "external_site"){
                node_x = 10;
                node_y = 50;
                if (node_level == 0)
                    result = {x : parseFloat(node_x), y : parseFloat(node_y)};
                else if (node_level > 0)
                    result = {x : parseFloat(node_x), y : parseFloat(node_y) + (125 * parseFloat(node_level))};
            }
            else if (node_type == "connect_site"){
                node_x = 140;
                node_y = 30;
                if (node_level == 0)
                    result = {x : parseFloat(node_x), y : parseFloat(node_y)};
                else if (node_level > 0)
                    result = {x : parseFloat(node_x), y : parseFloat(node_y) + (30 * parseFloat(node_level))};
            }
            else if (node_type == "openstack_wan_cloud"){
                result = {x : parseFloat(node_x + 100), y : parseFloat(node_y * 4.8)};
            }
            else if (node_type == "openstack_internal_subnet"){
                if (node_level == 0){
                    result = {x : parseFloat(node_x + 500), y : parseFloat(node_y - 40)};
                }
                else if (node_level == 1){
                    result = {x : parseFloat(node_x + 500), y : parseFloat(node_y - 30 + (40 * 8.5))};
                }
            }    
            else if (node_type == "openstack_fip_subnet"){
                if (node_level == 0){
                    result = {x : parseFloat(node_x + 500), y : parseFloat((node_y - 40) * 16.1)};
                }
                else if (node_level == 1){
                    result = {x : parseFloat(node_x + 500), y : parseFloat((node_y - 40) + (40 * 12.6))};
                }
            }    
            else if (node_type == "openstack_internet_cloud"){
                if (node_level == 0){
                    result = {x : parseFloat(node_x + 620), y : parseFloat((node_y - 40) * 16.1)};
                }
                else if (node_level == 1){
                    result = {x : parseFloat(node_x + 620), y : parseFloat(node_y - 40 + (40 * 12.6))};
                }
            }
            
            return result
        };
        
        function GetExistingCustomer(){
            $rootScope.ExistingCustomer = [];
            MSMService.ListCustomers($scope);
        }
        
        function disableMouseEvents(){
            $("body").css("pointer-events", "none");
            //$("body").append("<div class='overlay'></div>")
        }
        
        function enableMouseEvents(){
            $("body").css("pointer-events", "");
            //$(".overlay").remove();
        }    
        
        function connectOpenStackSites(){
            var node_details = StorageService.Get("node_details");
            var node_data = [];
            angular.forEach(node_details, function(value, index){
                if (value.type == 'openstack_site'){
                    node_data.push(value);
                }
            });
            
            var data = {'site_name':node_data[0].site_name,
                         'subnet':node_data[0].cpe[0].subnetCidr,
                         'connect_to':node_data[1].site_name,
                         'ip_range':node_data[1].cpe[0].subnetCidr}
            var customer_name = StorageService.GetCustomer().customer_name;
            
            var connection_exist = false;
            if ($scope.routes && $scope.routes[data.site_name]){
                angular.forEach($scope.routes[data.site_name], function(connection, index){
                    if (connection.subnet == data.ip_range){
                        connection_exist = true;
                        return false;
                    }
                });
            }
            
            if (!connection_exist){
                MSMService.AssociateRoutes($scope, customer_name, data);
            }    
        }
        
        function disconnectOpenStackSites(){
            var node_details = StorageService.Get("node_details");
            var node_data = [];
            angular.forEach(node_details, function(value, index){
                if (value.type == 'openstack_site'){
                    node_data.push(value);
                }
            });
            var data = {'site_name':node_data[0].site_name,
                         'subnet':node_data[0].defaultSubnet,
                         'connect_to':node_data[1].site_name,
                         'ip_range':node_data[1].defaultSubnet}
            var customer_name = StorageService.GetCustomer().customer_name;
            MSMService.DisAssociateRoutes($scope, customer_name, data);
        }
        
        function deleteCustomer(customer_name){
            MSMService.DeleteCustomer($scope, customer_name);
        }
        /*
        function getVMs(vSite_details){
            var VMs = {};
            angular.forEach(vSite_details, function(vSite, index){
                VMs[vSite.vSiteId] = [];
                angular.forEach(vSite.subnets, function(subnet, index){
                    VMs[vSite.vSiteId] = removeDuplicates(VMs[vSite.vSiteId].concat(subnet.vms), 'uuid');;
                });   
            });
            return VMs;  
        }
        */
        
        function getVMs(node_details){
            var VMs = {};
            angular.forEach(node_details, function(vSite, index){
                if (vSite.type == 'openstack_site'){
                    VMs[vSite.site_name] = vSite.VM;
                }
            });
            return VMs;  
        }
        
        function deleteVMs(customer_name, VMs){
            angular.forEach(VMs, function(value, site_name) {
                if (value){
                    angular.forEach(value, function(vm, index){
                        $timeout(function() {
                            MSMService.DeleteVM($scope, customer_name, site_name, vm.name, vm.uuid, vm.srId)
                        }, index * 10000);
                    });    
                }    
            });
        }
        
        function deleteExternalSites(customer_name, external_site_details){
            angular.forEach(external_site_details, function(external_site, index){
                $timeout(function() { 
                    var site_name = external_site.site_name;
                    var site_details = StorageService.GetSite(site_name);
                    var site_node = GraphService.graph.getCell(site_details.site_data.site_node.id);
                    var connections = GraphService.graph.getNeighbors(site_node);
                    angular.forEach(connections, function(connection, index){
                        connection.remove();
                    });    
                    site_node.remove();
                    StorageService.RemoveNode(site_name);
                }, index * 3000);
            });
        }
        
        function deleteOpenStackSites(customer_name, vSite_details){
            if (vSite_details.length == 0){
                var customer_name = StorageService.Get("customer").customer_name;
                deleteCustomer(customer_name);
            }
            else{
                angular.forEach(vSite_details, function(vSite, index){
                    $timeout(function() { 
                        MSMService.DeleteCustomerVsite($scope, customer_name, vSite.vSiteId);
                    }, index * 3000);
                });
            }    
        }
        
        function getWANcloud(){
            var node = null;
            GraphService.graph.getElements().forEach(function(element){
                if (element.attributes.cplane_type.toLowerCase() === "openstack_wan_cloud"){
                    node = element;
                    return false;
                }
            });
            
            if (node == null){
                node = GraphService.AddOpenStackWanCloud(calculate_position("openstack_wan_cloud"));
            }
            
            return node;
        }
        
        function invert(obj) {
            var new_obj = {};
            
            for (var prop in obj) {
                if(obj.hasOwnProperty(prop)) {
                    new_obj[obj[prop]] = prop;
                }
            }
            return new_obj;
        };

        function removeDuplicates(arr, prop) {
            var new_arr = [];
            var lookup  = {};
         
            for (var i in arr) {
                lookup[arr[i][prop]] = arr[i];
            }
         
            for (i in lookup) {
                new_arr.push(lookup[i]);
            }
         
            return new_arr;
        }
        
        var pollOpenStackSite = function pollOpenStackSite(param){
            $rootScope.notification = "Waiting for sites to be active..."
            var site_name = param.site_name;
            var customer = StorageService.GetCustomer().customer_name;
            MSMService.ListCustomerVsite($scope, customer, site_name);
        }
        
        var pollOpenStackOGR = function pollOpenStackOGR(param){
            var site_name = param.site_name;
            var customer = StorageService.GetCustomer().customer_name;
            MSMService.ListCustomerVsiteOGR($scope, customer, site_name);
        }
        
        var pollVM = function pollVM(param){
            var site_name = param.site_name;
            var customer = StorageService.GetCustomer().customer_name;
            var uuid = param.uuid;
            var vm_name = param.vm_name;
            var vm_srId = param.vm_srId;
            MSMService.GetVM($scope, customer, site_name, vm_name, uuid, vm_srId);
        }
        
        $rootScope.$on("OnGetCustomerDataEvent", function (event, response, error_msg){
            if (_.isEmpty(response)){
                response =  {"customer_name": $rootScope.customer_data.custId,
                             "service_level": "Gold",
                             "max_cloud_sites": 2,
                             "max_sites_vms": 5,
                            }
            }                                        
            StorageService.AddCustomer(response);
            $rootScope.currentState = 1;
            if ($rootScope.action == "loadCustomer"){
                $scope.checkExternalSites = $interval(function() {
                    var node_details = StorageService.Get("node_details");
                    var external_sites = [];
                    var connections = [];
                    angular.forEach(node_details, function(site, index){
                        if (site.type == 'external_site'){
                            var ip_range = site.ip_range.map(function(x) { return x.split(".").splice(0,2).join(".");});
                            external_sites.push(site);
                            angular.forEach($scope.routes, function(routes, site_name) {
                                if (routes){
                                    angular.forEach(routes, function(route, index){
                                        var subnet = route.subnet.split(".").splice(0,2).join(".");
                                        if(ip_range.indexOf(subnet) !== -1) {
                                            var connection = {'site_name':site_name,
                                                               'subnet':route.vSubnet,
                                                               'connect_to':site.site_name,
                                                               'ip_range':route.subnet};
                                            connections.push(angular.copy(connection));                   
                                        }
                                    });    
                                }    
                            });
                        }
                    });
                    
                    if ((external_sites.length == $rootScope.maxExSites) || ($rootScope.external_data != undefined && external_sites.length == $rootScope.external_data.length)) {
                        StorageService.AddOrUpdateConnections(connections);
                        $interval.cancel($scope.checkExternalSites);
                    }
                }, 1000);
            }
        });

        $rootScope.$on("OnQueryRoutesEvent", function (event, result, error_msg) {
            if ($rootScope.action == "loadCustomer"){
                $scope.routes[result.site_name] = result.routes;
            }    
        });
        
        $rootScope.$on("OnGetCustomerEvent", function (event, response, error_msg){
            if ($rootScope.action == "resetVM"){
                var customer_name = StorageService.GetCustomer().customer_name;
                $rootScope.action = "";
                $rootScope.customer_details = response;
                var node_details = StorageService.Get("node_details");
                var VMs = getVMs(node_details);
                deleteVMs(customer_name, VMs);
            }
            else if ($rootScope.action == "resetALL"){
                var customer_name = StorageService.GetCustomer().customer_name;
                $rootScope.customer_details = response;
                var node_details = StorageService.Get("node_details");
                var VMs = getVMs(node_details);
                deleteVMs(customer_name, VMs);
            }
            else if ($rootScope.action == "loadCustomer"){
                if (response.vSite && response.vSite.length == 1){
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .clickOutsideToClose(false)
                        .title('Error!')
                        .textContent("Customer doesn't have both instances of OpenStack Site(s). Load a different customer instance.")
                        .ariaLabel('Error Dialog')
                        .ok('ok')
                    ); 
                    enableMouseEvents();
                    $rootScope.notification = "";
                    $rootScope.action = "";
                    $scope.customerName = "";
                    $scope.serviceLevel = "";
                    $scope.clouds = "";
                    $scope.sites = "";
                    $rootScope.currentState = 0;
                    $rootScope.customer_del_retry_count = 0;
                }
                else{
                    if (response.vSite.length != 0 && (response.vSite[0].status.indexOf("error") > -1 || response.vSite[1].status.indexOf("error") > -1)){
                        $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .clickOutsideToClose(false)
                            .title('Error!')
                            .textContent("One or both the OpenStack Site(s) are in error state. Load a different customer instance.")
                            .ariaLabel('Error Dialog')
                            .ok('ok')
                        ); 
                        enableMouseEvents();
                        $rootScope.notification = "";
                        $rootScope.action = "";
                        $scope.customerName = "";
                        $scope.serviceLevel = "";
                        $scope.clouds = "";
                        $scope.sites = "";
                        $rootScope.currentState = 0;
                        $rootScope.customer_del_retry_count = 0;
                    }
                    else{
                        $rootScope.customer_data = response;
                        $timeout(function() {
                            MSMService.GetCustomerData($scope, response.custId);
                            $rootScope.notification = "Retrieving External Connections..."
                        }, 2000); 
                    }    
                }    
            }
        });
        
        $rootScope.$on("OnListCustomerEvent", function(event, result, error){
            if ($rootScope.action == ""){
                if (result != null){
                    angular.forEach(result.customers, function(customer, index){
                        $rootScope.ExistingCustomer.push(customer.name);
                    });
                }    
            }    
        })
        
        $rootScope.$on("OnStorageAddCustomer", function(event){
            if ($rootScope.action == "loadCustomer"){
                // add openstack site
                var customer_name = StorageService.GetCustomer().customer_name;
                if ($rootScope.customer_data.vSite.length > 0){
                    angular.forEach($rootScope.customer_data.vSite, function(site, index){
                        var VMs = []
                        MSMService.ListCustomerVsiteOGR($scope, customer_name, site.vSiteId);
                        MSMService.ListCustomerVsiteFIP($scope, customer_name, site.vSiteId);
                        MSMService.QueryRoutes($scope, customer_name, site.vSiteId);
                        MSMService.ListCustomerVsiteNetworks($scope, customer_name, site.vSiteId);
                        angular.forEach(site.subnets, function(subnet, index){
                            VMs = removeDuplicates(VMs.concat(subnet.vms), 'uuid');
                        });
                        
                        angular.forEach(VMs, function(vm, index){
                            $rootScope.notification = "Retrieving VMs..."
                            $timeout(function() {
                                MSMService.GetVM($scope, customer_name, site.vSiteId, vm.name, vm.uuid);
                            }, 4000);
                        });
                    });
                }
                else{
                    enableMouseEvents();
                    $rootScope.notification = "";
                    $rootScope.action = "";
                }
                
                $scope.checkVMs = $interval(function() {
                    var VMs = []
                    angular.forEach($rootScope.customer_data.vSite, function(site, index){
                        angular.forEach(site.subnets, function(subnet, index){
                            VMs = removeDuplicates(VMs.concat(subnet.vms), 'uuid');
                        });
                    });
                   
                    if (VMs.length == $scope.VMs.length) {
                        $rootScope.cloudsCreated = []
                        angular.forEach($rootScope.customer_data.vSite, function(site, index){
                            $rootScope.cloudsCreated.push(angular.copy({'site_name': site.vSiteId,
                                                                       'defaultSubnet': $rootScope.networks[site.vSiteId].backbone}));
                            $timeout(function() {
                                if ($scope.cpe[site.vSiteId].length > 0 && $scope.fip[site.vSiteId]){
                                    $scope.cpe[site.vSiteId][0]['subnetCidr'] = $rootScope.networks[site.vSiteId].backbone;
                                    $scope.fip[site.vSiteId]['subnetCidr'] = $rootScope.networks[site.vSiteId].floatingip;
                                    var site_data = {'site_name': site.vSiteId,
                                                     'type': 'openstack_site',
                                                     'status': site.status,
                                                     'defaultSubnet': $rootScope.networks[site.vSiteId].internal_resources, 
                                                     'cpe':$scope.cpe[site.vSiteId],
                                                     'fip':$scope.fip[site.vSiteId]};
                                    StorageService.AddSite(angular.copy(site_data));
                                }    
                            }, 1000);
                            
                        });
                        
                        angular.forEach($scope.VMs, function(vm, index){
                            $timeout(function() {
                                StorageService.AddOrUpdateVM(vm.site_name, vm);
                            }, 2000);
                        });
                        $interval.cancel($scope.checkVMs);
                    }
                }, 1000);
            }
            var res = StorageService.GetCustomer();
            $scope.customerName = res['customer_name'];
            $scope.serviceLevel = res['service_level'];
            $scope.clouds = res['max_cloud_sites'];
            $scope.sites = res['max_sites_vms'];
        })
        
        $rootScope.$on("OnStorageAddSite", function (event, site_name) {
            if ($rootScope.action == "loadCustomer"){
                var node_details = StorageService.Get("node_details");
                var openstack_sites = [];
                var external_sites = [];
                angular.forEach(node_details, function(site, index){
                    if (site.type == 'openstack_site'){
                        openstack_sites.push(site);
                    }
                    else if (site.type == 'external_site'){
                        external_sites.push(site);
                    }
                });
                    
                if(openstack_sites.length > 1 && external_sites.length == 0){
                    $rootScope.currentState = 2;
                    var customer_name = StorageService.GetCustomer().customer_name;
                    MSMService.GetExternalVsite($scope, customer_name);
                }
            }
            
            var site_details = StorageService.GetSite(site_name);
            if (site_details.site_data.type === 'openstack_site'){
                //add node
                var node_count = 0;
                GraphService.graph.getElements().forEach(function(element){
                    if (element.attributes.cplane_type.toLowerCase() === "openstack_site"){
                        node_count++;
                    }
                })
                var site_node = GraphService.AddOpenStackSite(site_name, calculate_position("openstack_site", site_details.site_level), node_count > 0 ? 'bottom' : 'top');
                
                //add subnet
                if(site_details.site_data.cpe[0].subnetCidr){
                    var site_subnet = GraphService.AddOpenStackSubnet(site_name, site_details.site_data.cpe[0].subnetCidr, calculate_position("openstack_subnet", site_details.site_level));
                }
                
                //add ogr
                var site_ogr = GraphService.AddOpenStackOgr(site_name, calculate_position("openstack_ogr", site_details.site_level));
                
                //add wan cloud
                var wan_cloud = getWANcloud();
                
                //add internal subnet
                if(site_details.site_data.defaultSubnet){
                    var internal_subnet = GraphService.AddOpenStackInternalSubnet(site_name, site_details.site_data.defaultSubnet, calculate_position("openstack_internal_subnet", site_details.site_level))
                }    
                
                //add fip subnet
                if(site_details.site_data.fip.subnetCidr){
                    var fip_subnet = GraphService.AddOpenStackFipSubnet(site_name, site_details.site_data.fip.subnetCidr, calculate_position("openstack_fip_subnet", site_details.site_level))
                    //add internet cloud
                    var internet_cloud = GraphService.AddOpenStackInternetCloud(site_name, calculate_position("openstack_internet_cloud", site_details.site_level))
                }
                
                //link node ogr
                var link_site = GraphService.AddLink(site_node, site_ogr, "ogr");
                
                //link node backbone subnet
                if(site_details.site_data.cpe[0].subnetCidr){
                    var link_subnet = GraphService.AddLink(site_node, site_subnet, "backbone");
                    //link wan subnet
                    var link_wan = GraphService.AddLink(site_subnet, wan_cloud, "backbone");
                }
                
                //link fip internet cloud
                if(site_details.site_data.fip.subnetCidr){
                    var link_internet = GraphService.AddLink(fip_subnet, internet_cloud, "fip");
                }
                
                StorageService.AddOrUpdateSubKey("node_details", site_details.site_data, "site_node", site_node.toJSON());
                site_details = StorageService.GetSite(site_name);
                
                if(site_details.site_data.cpe[0].subnetCidr){
                    StorageService.AddOrUpdateSubKey("node_details", site_details.site_data, "site_subnet_node", site_subnet.toJSON());
                    site_details = StorageService.GetSite(site_name);
                }
                
                StorageService.AddOrUpdateSubKey("node_details", site_details.site_data, "site_ogr_node", site_ogr.toJSON());
                site_details = StorageService.GetSite(site_name);
                
                if(site_details.site_data.defaultSubnet){
                    StorageService.AddOrUpdateSubKey("node_details", site_details.site_data, "site_internal_subnet_node", internal_subnet.toJSON());
                    site_details = StorageService.GetSite(site_name);
                }
                
                if(site_details.site_data.fip.subnetCidr){
                    StorageService.AddOrUpdateSubKey("node_details", site_details.site_data, "site_fip_subnet_node", fip_subnet.toJSON());
                    site_details = StorageService.GetSite(site_name);
                }
                
                if (site_details.site_level > 0){
                    var prev_site = StorageService.Get("node_details")[site_details.site_level - 1];
                    var prev_ogr = StorageService.GetNode(prev_site.site_name, "site_ogr_node");
                    //link ogr prev_ogr
                    var link_ogr = GraphService.AddLink(site_ogr, prev_ogr, "ogr");
                }

                //Added polling mechanism for status of cloud site and ogr
                QueueService.add(pollOpenStackSite, {'timeout':AppConfig.environment === 'development' ? (site_details.site_level * 500) + 1000 : 1000, 'groupingId': site_name, 'params':{'site_name' : site_name}});
                QueueService.add(pollOpenStackOGR, {'timeout':AppConfig.environment === 'development' ? (site_details.site_level * 500) + 1000 : 1000, 'groupingId': site_name+'_ogr', 'params':{'site_name' : site_name}});
                disableMouseEvents();
            }
            else if (site_details.site_data.type === 'external_site'){
                //add node
                var site_level = site_details.site_level;
                if (site_level > 1){
                    site_level -= 2
                }
                var site_node = GraphService.AddExternalSite(site_name, calculate_position("external_site", site_level))
                StorageService.AddOrUpdateSubKey("node_details", site_details.site_data, "site_node", site_node.toJSON());
            }
            
            GraphService.paper.scaleContentToFit();
            GraphService.paper.setOrigin(0, 0);
            var newScale = Math.round(V(GraphService.paper.viewport).scale().sx * 100);
            newScale = newScale > 100 ? 100: newScale;
            $rootScope.zoomValue = newScale;
            GraphService.zoomValue = newScale;
            GraphService.scaleGraph(0, 0, newScale/100);
        });
        
        $rootScope.$on("OnInitCustomerVsiteEvent", function (event, response, error_msg){
            if ($rootScope.action == ""){
                $rootScope.notification = ""
                StorageService.AddSite($rootScope.openstack_site);
            }    
        });
           
        $rootScope.$on("OnGetExternalVsiteEvent", function (event, response, error_msg){
            if ($rootScope.action == ""){
                $rootScope.saved_external_site = response;
            }
            else if ($rootScope.action == "resetALL"){
                var customer_name = StorageService.GetCustomer().customer_name;
                $rootScope.action = ""
                var external_sites = response.values[0]['external_sites'];
                deleteExternalSites(customer_name, external_sites);
            }
            else if ($rootScope.action == "loadCustomer"){
                $rootScope.external_data = response.values[0]['external_sites'];
                angular.forEach(response.values[0]['external_sites'], function(site, index){
                    $timeout(function() {
                        StorageService.AddSite(site);
                    }, 1000);    
                });
            }
        });
           
        $rootScope.$on("OnInitExternalVsiteEvent", function (event, response, error_msg){
            if ($rootScope.action == ""){
                StorageService.AddSite($rootScope.external_site);
                var customer_name = StorageService.GetCustomer().customer_name;
                MSMService.GetExternalVsite($scope, customer_name);
                $rootScope.notification = "";
            }    
        });
            
        $rootScope.$on("OnListCustomerVsiteEvent", function (event, result, error_msg) {
            try{
                var site_name = result.vSite.vSiteId
                if (result.vSite.status == 'active'){
                    var site_node = StorageService.GetNode(site_name, 'site_node');
                    site_node.attr('image/xlink:href', AppConfig.SVGIconPath + 'Cloud Site-OpenStack-Green.svg');    
                    //var site_subnet_node = StorageService.GetNode(site_name, 'site_subnet_node');
                    //site_subnet_node.attr('ellipse/stroke', 'green');
                    var site_details = StorageService.GetSite(site_name);
                    StorageService.AddOrUpdateSubKey("node_details", site_details.site_data, "status", "active");
                    $rootScope.activeSites.push(site_node);
                    if ($rootScope.activeSites.length == 4){
                        enableMouseEvents();
                        $rootScope.notification = "";
                        connectOpenStackSites();
                    }
                    else {
                        disableMouseEvents();
                    }
                }
                else if(result.vSite.status.indexOf("error") != -1){
                    var site_node = StorageService.GetNode(site_name, 'site_node');
                    var site_details = StorageService.GetSite(site_name);
                    StorageService.AddOrUpdateSubKey("node_details", site_details.site_data, "status", "error");
                    $rootScope.activeSites.push(site_node);
                    if ($rootScope.activeSites.length == 2){
                        enableMouseEvents();
                        $rootScope.notification = "";
                        connectOpenStackSites();
                    }
                    else {
                        disableMouseEvents();
                    }
                }
                else{
                    disableMouseEvents();
                    var site_details = StorageService.GetSite(site_name);
                    QueueService.add(pollOpenStackSite, {'timeout':AppConfig.environment === 'development' ? (site_details.site_level * 500) + 1000 : 30000, 'groupingId': site_name, 'params':{'site_name' : site_name}});
                }
            }
            catch(e){
                disableMouseEvents();
                var site_details = StorageService.GetSite(site_name);
                QueueService.add(pollOpenStackSite, {'timeout':AppConfig.environment === 'development' ? (site_details.site_level * 500) + 1000 : 30000, 'groupingId': site_name, 'params':{'site_name' : site_name}});
            }    
        });
        
        $rootScope.$on("OnListCustomerVsiteOGREvent", function (event, result, error_msg) {
            if ($rootScope.action == "loadCustomer"){
                if (result.cpe[0].cpeSegmentationId == null || result.cpe[0].cpeIpAddr == null || result.cpe[0].cpeASN == null || result.cpe[0].peerIP == null || result.cpe[0].peerASN == null){
                    enableMouseEvents();
                    $rootScope.notification = "";
                    $rootScope.action = "";
                    $scope.customerName = "";
                    $scope.serviceLevel = "";
                    $scope.clouds = "";
                    $scope.sites = "";
                    $rootScope.currentState = 0;
                    $rootScope.customer_del_retry_count = 0;
                    
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .clickOutsideToClose(false)
                        .title('Error!')
                        .textContent("Unexpected Error, while retreiving customer data. Load a different customer instance.")
                        .ariaLabel('Error Dialog')
                        .ok('ok')
                    ); 
                    return;
                }
                else {    
                    angular.forEach($rootScope.CPE[result.site_name], function(cpe, index){
                        if (cpe.cpeSegmentationId == result.cpe[0].cpeSegmentationId && cpe.cpeIpAddr == result.cpe[0].cpeIpAddr && cpe.cpeASN == result.cpe[0].cpeASN && cpe.peerIP == result.cpe[0].peerIP && cpe.peerASN == result.cpe[0].peerASN){
                            cpe['subnetCidr']
                            $scope.cpe[result.site_name] = [cpe];
                        }
                    });
                }    
            }
            
            var site_name = result.site_name;
            try{
                if (result.cpe[0].status == 'active' || result.cpe[0].status == 'online'){
                    var site_ogr_node = StorageService.GetNode(site_name, 'site_ogr_node');
                    site_ogr_node.attr('image/xlink:href', AppConfig.SVGIconPath + 'OGR - Green.svg');
                    $rootScope.activeSites.push(site_ogr_node);
                    if ($rootScope.activeSites.length == 4){
                        enableMouseEvents();
                        $rootScope.notification = "";
                        connectOpenStackSites();
                    }
                    else {
                        disableMouseEvents();
                    }
                }
                else{
                    var site_details = StorageService.GetSite(site_name);
                    if(site_details.site_data.status.indexOf("error") != -1){
                        var site_ogr_node = StorageService.GetNode(site_name, 'site_ogr_node');
                        $rootScope.activeSites.push(site_ogr_node);
                        if ($rootScope.activeSites.length == 2){
                            enableMouseEvents();
                            $rootScope.notification = "";
                            connectOpenStackSites();
                        }
                        else {
                            disableMouseEvents();
                        }
                    }
                    else{
                        disableMouseEvents();
                        QueueService.add(pollOpenStackOGR, {'timeout':AppConfig.environment === 'development' ? (site_details.site_level * 500) + 1000 : 30000, 'groupingId': site_name+'_ogr', 'params':{'site_name' : site_name}});
                    }    
                }
            }
            catch(e){
                disableMouseEvents();
                var site_details = StorageService.GetSite(site_name);
                QueueService.add(pollOpenStackOGR, {'timeout':AppConfig.environment === 'development' ? (site_details.site_level * 500) + 1000 : 30000, 'groupingId': site_name+'_ogr', 'params':{'site_name' : site_name}});
            }
        });
        
        $rootScope.$on("OnListCustomerVsiteFIPEvent", function (event, result, error_msg) {
            if ($rootScope.action == "loadCustomer"){
                angular.forEach($rootScope.FIP[result.site_name], function(fip, index){
                    if (result.fip.subnetworks.length > 0){
                        if(fip.subnetworks[0].gateway_ip == result.fip.subnetworks[0].gateway_ip && fip.subnetworks[0].cidr == result.fip.subnetworks[0].cidr && fip.subnetworks[0].allocationPools[0].start == result.fip.subnetworks[0].allocationPools[0].start && fip.subnetworks[0].allocationPools[0].end == result.fip.subnetworks[0].allocationPools[0].end){
                            $scope.fip[result.site_name] = fip;
                        }
                    }    
                });
            }
        });
        
        $rootScope.$on("OnDeleteCustomerVsiteEvent", function (event, result, error_msg) {
            if ($rootScope.action == ""){
                var site_name = result.site_name;
                var site_details = StorageService.GetSite(site_name);
                
                GraphService.graph.getCell(site_details.site_data.site_ogr_node.id).remove();;
                GraphService.graph.getCell(site_details.site_data.site_subnet_node.id).remove();;
                GraphService.graph.getCell(site_details.site_data.site_node.id).remove();;
                StorageService.RemoveNode(site_name);
                
                var node_details = StorageService.Get("node_details");
                var openstack_sites = [];
                angular.forEach(node_details, function(site, index){
                    if (site.type == 'openstack_site'){
                        openstack_sites.push(site);
                    }
                });
                
                if (openstack_sites.length == 0){
                    var customer_name = StorageService.Get("customer").customer_name;
                    deleteCustomer(customer_name)
                }
            }    
        });
        
        $rootScope.$on("OnDeleteCustomerEvent", function (event, result, error_msg) {
            if('message' in result && result.message.toLowerCase() == "customer site exist"){
                if ($rootScope.customer_del_retry_count == 20)
                {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .clickOutsideToClose(false)
                        .title('Error!')
                        .textContent("Unexpected Error, while deleting Customer Data.")
                        .ariaLabel('Error Dialog')
                        .ok('ok')
                    ); 
                    GraphService.graph.clear();
                    StorageService.RemoveAll();
                    enableMouseEvents();
                    $scope.clearApiCalls();
                    $scope.openApiCalls();
                    
                    $scope.customerName = '';
                    $scope.serviceLevel = '';
                    $scope.clouds = '';
                    $scope.sites = '';
                    $scope.custSites = 0;
                    
                    $rootScope.notification = "";
                    $rootScope.apiCalls = [];
                    $rootScope.activeSites = [];
                    $rootScope.customer_details = "";
                    $rootScope.images = {};
                    $rootScope.flavors = {};
                    $rootScope.action = "";
                    $rootScope.ExistingCustomer = [];
                    $rootScope.CPE = {};
                    $rootScope.maxExSites = '';
                    $rootScope.Iplength = '';
                    $rootScope.openstack_site = "";
                    $rootScope.external_site = "";
                    $rootScope.saved_external_site = "";
                    $rootScope.connection = "";
                    $rootScope.vmsVal = {};
                    $rootScope.vm = "";
                    $rootScope.cloudsCreated = [];
                    $rootScope.maxConnections = '';
                    $rootScope.customer_del_retry_count = 0;
                    $rootScope.zoomValue = AppConfig.default_zoom;
                    GraphService.zoomValue = AppConfig.default_zoom;
                    GraphService.scaleGraph(0, 0, AppConfig.default_zoom/100);
                }
                else {
                    QueueService.add(deleteCustomer, {'timeout':AppConfig.environment === 'development' ? (site_details.site_level * 500) : 5000, 'groupingId': result.customer_name, 'params':result.customer_name});
                    $rootScope.customer_del_retry_count += 1;
                }
            }
            else{
                GraphService.graph.clear();
                StorageService.RemoveAll();
                enableMouseEvents();
                $scope.clearApiCalls();
                $scope.openApiCalls();
                
                $scope.customerName = '';
                $scope.serviceLevel = '';
                $scope.clouds = '';
                $scope.sites = '';
                $scope.custSites = 0;
                $scope.cpe = {};
                $scope.fip = {};
                $scope.routes = {};
                $scope.VMs = [];
                    
                $rootScope.notification = "";
                $rootScope.apiCalls = [];
                $rootScope.activeSites = [];
                $rootScope.customer_details = "";
                $rootScope.images = {};
                $rootScope.flavors = {};
                $rootScope.action = "";
                $rootScope.ExistingCustomer = [];
                $rootScope.CPE = {};
                $rootScope.maxExSites = '';
                $rootScope.Iplength = '';
                $rootScope.openstack_site = "";
                $rootScope.external_site = "";
                $rootScope.saved_external_site = "";
                $rootScope.connection = "";
                $rootScope.vmsVal = {};
                $rootScope.vm = "";
                $rootScope.cloudsCreated = [];
                $rootScope.maxConnections = '';
                delete $rootScope.external_data;
                $rootScope.customer_del_retry_count = 0;
                $rootScope.zoomValue = AppConfig.default_zoom;
                GraphService.zoomValue = AppConfig.default_zoom;
                GraphService.scaleGraph(0, 0, AppConfig.default_zoom/100);
            } 
        });
        
        $rootScope.$on('OnAssociateRouteEvent', function (event, result, error_msg) {
            if ($rootScope.action == ""){
                if ($rootScope.connection){
                    $rootScope.notification = "";
                    StorageService.AddOrUpdateConnections($rootScope.connection);
                }
            }    
        });  
        
        $rootScope.$on("OnStorageAddConnections", function (event, connection_data) {
            /*if ($rootScope.action == "loadCustomer"){
                var data = [];
                angular.forEach($scope.VMs, function(vm, index){
                    $timeout(function() {
                        StorageService.AddOrUpdateVM(vm.site_name, vm);
                    }, 2000);
                });
            }*/
            var connections = StorageService.GetConnections();
            var node_wise = {}
            for( var x=0; x < connections.length; x++ ){
                var connect_to_position = {x:0, y:0}
                var site_ogr_node = StorageService.GetNode(connections[x].site_name, "site_ogr_node")
                var external_node = StorageService.GetNode(connections[x].connect_to, "site_node")
                
                var existing_connections = GraphService.graph.getNeighbors(external_node);
                var exist = false;
                angular.forEach(existing_connections, function(connection, index){
                    if (connection.attributes.attrs.text.text == connections[x].ip_range){
                        exist = true;
                        return false;
                    }
                });
                
                try{
                    if (node_wise[connections[x].connect_to]){
                        node_wise[connections[x].connect_to] += 1;
                    }
                    else {
                        node_wise[connections[x].connect_to] = 1;
                    }
                }
                catch(e){
                    //pass
                }
                
                if (!exist){
                    var node_position = external_node.attributes.position;
                    connect_to_position.x = node_position.x + 130;
                    connect_to_position.y = node_position.y - 40;
                    connect_to_position.y += (30 * (node_wise[connections[x].connect_to] + 1));
                    
                    var connect_site = GraphService.AddConnectSite(connections[x].ip_range, connect_to_position)
                    var link_1 = GraphService.AddLink(external_node, connect_site, "external_site");
                    var link_2 = GraphService.AddLink(connect_site, site_ogr_node, "external_site");
                    
                }    
            }    
        });
        
        $rootScope.$on("OnCreateVMEvent", function (event, response, error_msg){
            var site_name = response.vSiteId;
            delete response.custId;
            delete response.name;
            response = $.extend($rootScope.vm, response);
            StorageService.AddOrUpdateVM(site_name, response);
        });
        
        $rootScope.$on("OnStorageAddVM", function (event, site_name, data) {
            var VMs = []
            angular.forEach($rootScope.customer_data.vSite, function(site, index){
                VMs = VMs.concat(site.subnets[0].vms);
            });
            
            var node_details = StorageService.Get("node_details");
            var localVMs = [];
            angular.forEach(node_details, function(site, index){
                if (site.type == 'openstack_site' && site.VM){
                    localVMs = localVMs.concat(site.VM);
                }
            });
                                   
            if (VMs.length == localVMs.length){
               $rootScope.action = "";
               enableMouseEvents();
               $rootScope.notification = "";
            }
                
            var vm_details = StorageService.GetVM(site_name, data.srId, data.name);
            var site_node = StorageService.GetNode(site_name, "site_node")
            var vm_name = vm_details.vm_data.name;
            var vm_position = {x:0, y:0}
            var node_position = site_node.attributes.position;
            vm_position.x = node_position.x;
            vm_position.y = node_position.y - 40;
            vm_position.x += 280;
            vm_position.y += (40 * vm_details.vm_level);
            
            //var vm_node = GraphService.AddVM(site_name, vm_name, vm_details.vm_data.uuid, vm_details.vm_data.srId, "VM - " + vm_details.vm_data.fixedIP + "\n" + vm_details.vm_data.imageRef + " - " + vm_details.vm_data.flavorRef, vm_position);
            var vSiteNetworks = _.invert($rootScope.networks_map[site_name], true);
            var vm_ip = "";
            angular.forEach(vm_details.vm_data.addresses, function(network, index) {
                if (vSiteNetworks[network.fixedIP.subnetUuid] == "internal_resources"){
                    vm_ip = network.fixedIP.ip;
                }
                
                if (!vm_ip && vSiteNetworks[network.fixedIP.subnetUuid] == "backbone"){
                    vm_ip = network.fixedIP.ip;
                }

                if ((!vm_ip) && (vSiteNetworks[network.fixedIP.subnetUuid] == "floatingip") && (index == (vm_details.vm_data.addresses.length - 1))){
                    vm_ip = network.floatingIP.ip;
                }
            });
            
            var vm_node = GraphService.AddVM(site_name, vm_name, vm_details.vm_data.uuid, vm_details.vm_data.srId, vm_details.vm_data.name + "\n" + vm_ip, vm_position);
            
            var site_details = StorageService.GetSite(site_name);
            var vm_data = angular.copy(site_details.site_data.VM);
            vm_data[vm_details.vm_level]["vm_node"] = vm_node;
            
            /* Update VM data */
            var vSiteNetworks = _.invert($rootScope.networks_map[site_name], true);
            //console.log(_.invert(networks, true)) /* reverse a hashmap */
            
            angular.forEach(data.addresses, function(network, index) {
                data.addresses[index]["subnet_type"] = vSiteNetworks[network.fixedIP.subnetUuid][0];
                vm_data[vm_details.vm_level].addresses[index]["subnet_type"] = vSiteNetworks[network.fixedIP.subnetUuid][0];
            })
            
            StorageService.AddOrUpdateSubKey("node_details", site_details.site_data, "VM", vm_data);
            var link1 = GraphService.AddLink(site_node, vm_node, "vm");
            
            /* Based on check boxes link VM*/
            
            angular.forEach(data.addresses, function(network, index) {
                if (network.subnet_type == "backbone"){
                    var site_subnet_node = StorageService.GetNode(site_name, "site_subnet_node")
                    var link2 = GraphService.AddLink(site_subnet_node, vm_node, "backbone");
                }
                else if (network.subnet_type == "internal_resources"){
                    var site_internal_subnet_node = StorageService.GetNode(site_name, "site_internal_subnet_node")
                    site_internal_subnet_node.attr({ ellipse: { 'stroke-dasharray': '2,0' }});
                    var link3 = GraphService.AddLink(site_internal_subnet_node, vm_node, "internal");
                }    
                else if (network.subnet_type == "floatingip"){
                    var site_fip_subnet_node = StorageService.GetNode(site_name, "site_fip_subnet_node")
                    site_fip_subnet_node.attr({ ellipse: { 'stroke-dasharray': '2,0' }});
                    var link4 = GraphService.AddLink(site_fip_subnet_node, vm_node, "fip");    
                }
            })
            
            //Added polling mechanism for state of VM
            QueueService.add(pollVM, {'timeout':AppConfig.environment === 'development' ? 500 : 1000, 'groupingId': data.srId, 'params':{'site_name' : site_name, 'uuid' : vm_details.vm_data.uuid, 'vm_name' : vm_name, 'vm_srId' : data.srId}});
        });
        
        $rootScope.$on("OnGetVMEvent", function (event, result, error_msg) {
            if ($rootScope.action == "" || $rootScope.action == "resetALL"){
                var site_name = result.site_name;
                var vm_name = result.name;
                var vm_srId = result.srId;
                if (AppConfig.environment === 'development'){
                    var vm_details = StorageService.GetVM(site_name, vm_srId, vm_name);
                }
                else{
                    var vm_details = StorageService.GetVM(site_name, vm_srId, vm_name);
                }
                
                if (result.state == 'on'){
                    var vm_node = GraphService.graph.getCell(vm_details.vm_data.vm_node.id);
                    vm_node.attr('rect/fill', '#548235');  
                    vm_node.attr('rect/stroke', '#548235');  
                    vm_node.attr('text/text', vm_name + "\n" + vm_node.attr('text/text').split('\n')[1])
                    vm_node.attributes.vm_name = vm_name
                    GraphService.paper.findViewByModel(vm_node).options.interactive = true;
                    //console.log($rootScope.polling);
                    if ($rootScope.polling && AppConfig.environment !== 'development'){
                        var site_details = StorageService.GetSite(site_name);
                        QueueService.add(pollVM, {'timeout': 5000, 'groupingId': vm_srId, 'params':{'site_name' : site_name, 'uuid' : vm_details.vm_data.uuid, 'vm_name' : vm_name, 'vm_srId' : vm_srId}});
                    }
                    if ($rootScope.action == ""){
                        $rootScope.notification = "";
                    }    
                }
                else if (result.state == 'off'){
                    var vm_node = GraphService.graph.getCell(vm_details.vm_data.vm_node.id);
                    vm_node.attr('rect/fill', 'red');  
                    vm_node.attr('rect/stroke', 'red');
                    vm_node.attr('text/text', vm_name + "\n" + vm_node.attr('text/text').split('\n')[1])
                    vm_node.attributes.vm_name = vm_name
                    GraphService.paper.findViewByModel(vm_node).options.interactive = true;
                    //console.log($rootScope.polling);
                    if ($rootScope.polling && AppConfig.environment !== 'development'){
                        var site_details = StorageService.GetSite(site_name);
                        QueueService.add(pollVM, {'timeout': 5000, 'groupingId': vm_srId, 'params':{'site_name' : site_name, 'uuid' : vm_details.vm_data.uuid, 'vm_name' : vm_name, 'vm_srId' : vm_srId}});
                    }
                    if ($rootScope.action == ""){
                        $rootScope.notification = "";
                    } 
                }
                else if (result.state == 'error'){
                    var label = "!ERROR" +"\nVM - " + vm_name
                    var vm_node = GraphService.graph.getCell(vm_details.vm_data.vm_node.id);
                    vm_node.attr('rect/fill', '#B20000');  
                    vm_node.attr('rect/stroke', '#B20000'); 
                    vm_node.attr('text/text', label); 
                    vm_node.attributes.vm_name = vm_name
                    GraphService.paper.findViewByModel(vm_node).options.interactive = true;
                    //console.log($rootScope.polling);
                    if ($rootScope.polling && AppConfig.environment !== 'development'){
                        var site_details = StorageService.GetSite(site_name);
                        QueueService.add(pollVM, {'timeout': 5000, 'groupingId': vm_srId, 'params':{'site_name' : site_name, 'uuid' : vm_details.vm_data.uuid, 'vm_name' : vm_name, 'vm_srId' : vm_srId}});
                    }
                    if ($rootScope.action == ""){
                        $rootScope.notification = "";
                    }
                }
                else if('message' in result && result.message.toLowerCase() == "failed to get vm. please check parameters" && vm_details){
                    var vm_details = StorageService.GetVM(site_name, vm_srId, vm_name);
                    var vm_node = vm_details.vm_data.vm_node;
                    GraphService.graph.getCell(vm_node.id).remove();
                    StorageService.RemoveVM(site_name, vm_srId, vm_name);
                    if ($rootScope.action == ""){
                        $rootScope.notification = "";
                    }
                }
                else{
                    var site_details = StorageService.GetSite(site_name);
                    QueueService.add(pollVM, {'timeout':AppConfig.environment === 'development' ? 500 : 2000, 'groupingId': vm_srId, 'params':{'site_name' : site_name, 'uuid' : vm_details.vm_data.uuid, 'vm_name' : vm_name, 'vm_srId' : vm_srId}});
                }
            }
            else if ($rootScope.action == "loadCustomer"){
                $scope.VMs.push(result);
                $scope.VMs = removeDuplicates($scope.VMs, 'uuid');
            } 
        });
        
        $rootScope.$on("OnStartVMEvent", function (event, result, error_msg) {
            if ($rootScope.action == ""){
                var site_name = result.site_name;
                var vm_name = result.name;
                var vm_srId = result.srId;
                
                if (error_msg != null){
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .clickOutsideToClose(false)
                        .title('Error!')
                        .textContent('An external state change has occurred in OpenStack. Please reload the customer instance.')
                        .ariaLabel('Error Dialog')
                        .ok('ok')
                    );    
                    var vm_details = StorageService.GetVM(site_name, vm_srId, vm_name);
                    var vm_node = GraphService.graph.getCell(vm_details.vm_data.vm_node.id);
                    GraphService.paper.findViewByModel(vm_node).options.interactive = true;
                }
                else{
                    var vm_details = StorageService.GetVM(site_name, vm_srId, vm_name);
                    //Added polling mechanism for state of VM
                    QueueService.add(pollVM, {'timeout':AppConfig.environment === 'development' ? 500 : 2000, 'groupingId': vm_srId, 'params':{'site_name' : site_name, 'uuid' : vm_details.vm_data.uuid, 'vm_name' : vm_name, 'vm_srId' : vm_srId}}); 
                }    
            }    
        });
        
        $rootScope.$on("OnStopVMEvent", function (event, result, error_msg) {
            if ($rootScope.action == ""){
                var site_name = result.site_name;
                var vm_name = result.name;
                var vm_srId = result.srId;
                
                if (error_msg != null){
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .clickOutsideToClose(false)
                        .title('Error!')
                        .textContent('An external state change has occurred in OpenStack. Please reload the customer instance.')
                        .ariaLabel('Error Dialog')
                        .ok('ok')
                    );    
                    var vm_details = StorageService.GetVM(site_name, vm_srId, vm_name);
                    var vm_node = GraphService.graph.getCell(vm_details.vm_data.vm_node.id);
                    GraphService.paper.findViewByModel(vm_node).options.interactive = true;
                }
                else{
                    var vm_details = StorageService.GetVM(site_name, vm_srId, vm_name);
                    var vm_node = GraphService.graph.getCell(vm_details.vm_data.vm_node.id);
                    vm_node.attr('rect/fill', 'red');  
                    vm_node.attr('rect/stroke', 'red');
                    GraphService.paper.findViewByModel(vm_node).options.interactive = true;
                }    
            }
            $rootScope.notification = "";
        });
        
        $rootScope.$on("OnRebootVMEvent", function (event, result, error_msg) {
            if ($rootScope.action == ""){    
                var site_name = result.site_name;
                var vm_name = result.name;
                var vm_srId = result.srId;
                
                if (error_msg != null){
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .clickOutsideToClose(false)
                        .title('Error!')
                        .textContent('An external state change has occurred in OpenStack. Please reload the customer instance.')
                        .ariaLabel('Error Dialog')
                        .ok('ok')
                    );    
                    var vm_details = StorageService.GetVM(site_name, vm_srId, vm_name);
                    var vm_node = GraphService.graph.getCell(vm_details.vm_data.vm_node.id);
                    GraphService.paper.findViewByModel(vm_node).options.interactive = true;
                }
                else{
                    var vm_details = StorageService.GetVM(site_name, vm_srId, vm_name);
                    var vm_node = GraphService.graph.getCell(vm_details.vm_data.vm_node.id);
                    vm_node.attr('rect/fill', 'red');  
                    vm_node.attr('rect/stroke', 'red'); 
                    //Added polling mechanism for state of VM
                    QueueService.add(pollVM, {'timeout':AppConfig.environment === 'development' ? 500 : 2000, 'groupingId': vm_srId, 'params':{'site_name' : site_name, 'uuid' : vm_details.vm_data.uuid, 'vm_name' : vm_name, 'vm_srId' : vm_srId}});
                }    
            }
            $rootScope.notification = "";    
        });
        
        $rootScope.$on("OnDeleteVMEvent", function (event, result, error_msg) {
            var site_name = result.site_name;
            var vm_name = result.name;
            var vm_srId = result.srId;
            var vm_details = StorageService.GetVM(site_name, vm_srId, vm_name);
            
            var vm_node = GraphService.graph.getCell(vm_details.vm_data.vm_node.id);
            vm_node.attr('rect/fill', 'red');  
            vm_node.attr('rect/stroke', 'red'); 
            
            if (AppConfig.environment === "development"){
                var vm_details = StorageService.GetVM(site_name, vm_srId, vm_name);
                var vm_node = vm_details.vm_data.vm_node;
                GraphService.graph.getCell(vm_node.id).remove();
                StorageService.RemoveVM(site_name, vm_srId, vm_name);
                if ($rootScope.action == ""){
                    $rootScope.notification = ""; 
                }
            }
            else {
                //Added polling mechanism for state of VM
                QueueService.add(pollVM, {'timeout':AppConfig.environment === 'development' ? 500 : 2000, 'groupingId': vm_srId, 'params':{'site_name' : site_name, 'uuid' : vm_details.vm_data.uuid, 'vm_name' : vm_name, 'vm_srId' : vm_srId}});
            }
        });
        
        $rootScope.$on("OnGetVMConsoleEvent", function (event, result, error_msg) {
            var site_name = result.site_name;
            var vm_name = result.name;
            var vm_srId = result.srId;
            
            if (error_msg != null){
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .clickOutsideToClose(false)
                    .title('Error!')
                    .textContent('An external state change has occurred in OpenStack. Please reload the customer instance.')
                    .ariaLabel('Error Dialog')
                    .ok('ok')
                );    
                var vm_details = StorageService.GetVM(site_name, vm_srId, vm_name);
                var vm_node = GraphService.graph.getCell(vm_details.vm_data.vm_node.id);
                GraphService.paper.findViewByModel(vm_node).options.interactive = true;
            }
            else{
                var vm_uuid = result.uuid;
                var state = result.state;
                $scope.vncConsole = $sce.trustAsResourceUrl(result.vnc_console);
                $scope.vncTitle = site_name + " - " + vm_name + "(" + vm_uuid + ")";
                $scope.vncState = state;
                
                $mdDialog.show({
                    scope:$scope,
                    preserveScope:true,
                    controller: DialogController,
                    templateUrl: _dialog_path + "vnc_console.tpl.html",
                    parent: angular.element(document.body),
                    clickOutsideToClose:false,
                    // fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                })
                // .then(function(answer) {
                    // alert('You said the information was "' + answer + '".');
                // }, function() {
                    // alert('You cancelled the dialog.');
                // });
                function DialogController($scope, $rootScope, $mdDialog) {
                    $scope.hide = function() {
                      $mdDialog.hide();
                    };

                    $scope.closeDialog = function() {
                      $mdDialog.cancel();
                    };

                    // $scope.answer = function(answer) {
                      // $mdDialog.hide(answer);
                    // };
                }
            }
            $rootScope.notification = ""; 
        });
        
        $rootScope.$on("OnStorageRemoveVM", function (event, site_name, vm_srId) {
            //.set({ position: { x: 100, y: 50 }})
            var node_details = StorageService.Get("node_details");
            angular.forEach(node_details, function(site, index){
                if (site.type == 'openstack_site' && site.VM){
                    var site_subnet_node = StorageService.GetNode(site.site_name, "site_subnet_node")
                    var node_position = site_subnet_node.attributes.position;
                    angular.forEach(site.VM, function(vm, vm_index){
                        if (AppConfig.environment === 'development'){
                            var vm_details = StorageService.GetVM(site.site_name, vm.srId, vm.name);
                        }
                        else{
                            var vm_details = StorageService.GetVM(site.site_name, vm.srId, vm.name);
                        }
                        
                        var vm_position = {x:0, y:0}
                        vm_position.x = node_position.x;
                        vm_position.y = node_position.y - 80;
                        vm_position.x += 180;
                        vm_position.y += (40 * vm_details.vm_level);
                        
                        var vm_node = GraphService.graph.getCell(vm_details.vm_data.vm_node.id);
                        
                        $timeout(function() {
                            vm_node.set({ position: vm_position });
                        }, 1000);
                        
                    });
                    
                    if(!site.VM.length){
                        var site_internal_subnet_node = StorageService.GetNode(site.site_name, "site_internal_subnet_node")
                        site_internal_subnet_node.attr({ ellipse: { 'stroke-dasharray': '2,1' }});
                        
                        var site_fip_subnet_node = StorageService.GetNode(site.site_name, "site_fip_subnet_node")
                        site_fip_subnet_node.attr({ ellipse: { 'stroke-dasharray': '2,1' }});
                    }
                }
            });
        });
        
        
        $scope.toggleSlideMenu = function() {
            $scope.checked = !$scope.checked
        }
        
        $scope.addCustomer = function(){
           $rootScope.apiCalls = [];
           $rootScope.action = "";
           MSMService.ListVsiteOGR($scope, 'PaloAlto');
           MSMService.ListVsiteOGR($scope, 'Frankfurt');
           GetExistingCustomer();
           var dlg = dialogs.create(_dialog_path + "add_customer.tpl.html", 'customController', {data: "data", anotherVar: 'value', customer:'true'}, {backdrop: 'static', size: 'sm'}, 'ctrl');
            dlg.result.then(function (custObj){
                // Data from add customer form//
            }, function () {
                if (angular.equals($scope.name, ''))
                    $scope.name = 'You did not enter in your name!';
            });  
        }
        
        $scope.OpenCloudSiteView = function(){
            if($rootScope.currentState == 1)
            {
                $rootScope.action = "";
                var dlg = dialogs.create(_dialog_path + "add_cloud.tpl.html", 'customController', {data: "data", anotherVar: 'value'}, {backdrop: 'static', size: 'sm'}, 'ctrl');
                dlg.result.then(function (cloudObj){
                   // cloudObj.site ;
                }, function () {
                    if (angular.equals($scope.name, ''))
                        $scope.name = 'You did not enter in your name!';
                });  
            }
         };
        
        var getExternalSite = function(){
            var data = StorageService.Get("node_details");
            var localData = [];
            var OsSiteData = [];
            var totalIpData = [];
            angular.forEach(data, function(value, index){
                if (value.type == 'external_site'){
                    localData.push(value);
                }
                else if(value.type == 'openstack_site'){
                    OsSiteData.push(value);
                }
            });
            for(var i=0; i<localData.length; i++){
                for(var k=0; k<localData[i].ip_range.length; k++){
                    totalIpData.push(localData[i].ip_range[k]);
                }
            }
            $rootScope.Iplength = totalIpData.length;
            $rootScope.externalSiteNameList = localData.length;
            $rootScope.OsSiteNameList = OsSiteData.length;
            $rootScope.maxConnections = $rootScope.Iplength;
        }
        
        function getImagesFlavorsAndNetworks(){
            var node_details = StorageService.Get("node_details");
            angular.forEach(node_details, function(site, index){
                if(site.type == 'openstack_site'){
                    MSMService.GetImages('$rootScope', site.site_name);
                    MSMService.GetFlavors('$rootScope', site.site_name);
                    MSMService.ListCustomerVsiteNetworks('$rootScope', $scope.customerName, site.site_name);
                }
            });
        }
        
        $rootScope.$on("OnGetImagesEvent", function (event, result, error_msg) {
            $rootScope.images[result.site_name] = [];
            angular.forEach(result.images, function(image, index){
                $rootScope.images[result.site_name].push(image.name);
            });
        });
        
        $rootScope.$on("OnGetFlavorsEvent", function (event, result, error_msg) {
            $rootScope.flavors[result.site_name] = [];
            angular.forEach(result.flavors, function(flavor, index){
                $rootScope.flavors[result.site_name].push(flavor.name);
            });
        });
        
        $rootScope.$on("OnListCustomerVsiteNetworksEvent", function (event, result, error_msg) {
            $rootScope.networks_map[result.site_name] = {};
            $rootScope.networks[result.site_name] = {};
            var network_map = {"cpe" : "backbone",
                               "fip" : "floatingip",
                               "isolated" : "internal_resources"};
            
            angular.forEach(result.networks, function(network, index){
                if (network.type in network_map && network.subnets.length > 0){
                    $rootScope.networks_map[result.site_name][network_map[network.type]] = network.subnets[0].uuid;
                    $rootScope.networks[result.site_name][network_map[network.type]] = network.subnets[0].cidr;
                }    
            });
        });
        
        $scope.openExternalSite = function(){
            if($rootScope.currentState > 0)
            {
                $rootScope.action = "";
                getExternalSite();
                if($rootScope.externalSiteNameList < $rootScope.maxExSites)
                {
                    var dlg = dialogs.create(_dialog_path + "add_external_site.tpl.html", 'customController', {data: "data", anotherVar: 'value'}, {backdrop: 'static', size: 'sm'}, 'ctrl');
                    dlg.result.then(function (cloudObj){
                       // cloudObj.site ;
                    }, function () {
                        $scope.validSiteName = true;
                        if (angular.equals($scope.name, ''))
                            $scope.name = 'You did not enter in your name!';
                    });
                }
            }    
        };
        
        $scope.openConnectSites = function(){
            getExternalSite();
            if ($rootScope.externalSiteNameList && $rootScope.OsSiteNameList){
                $rootScope.action = "";
                var dlg = dialogs.create(_dialog_path + "connect_sites.tpl.html", 'customController', {data: "data", anotherVar: 'value'}, {backdrop: 'static', size: 'sm'}, 'ctrl');
                dlg.result.then(function (cloudObj){
                   // cloudObj.site ;
                }, function () {
                    $scope.validSiteName = true;
                    if (angular.equals($scope.name, ''))
                        $scope.name = 'You did not enter in your name!';
                });
            }
        };
        
        function createdVMs(){
            var node_details = StorageService.Get("node_details");
            angular.forEach(node_details, function(site, index){
                if(site.type == 'openstack_site' && site.VM){
                    $rootScope.vmsVal[site.site_name] = site.VM.length;
                }
                else{
                    $rootScope.vmsVal[site.site_name] = 0;
                }
            });
            
        }
         
        $scope.isVMOpen = false
        $scope.openAddVms = function(){
            if($scope.isVMOpen)
            {
                return;
            }
            if($rootScope.currentState > 1)
            {
                $scope.isVMOpen = true;
                $rootScope.action = "";
                getImagesFlavorsAndNetworks();
                createdVMs();
                $scope.checkImagesFlavors = $interval(function() {
                    var node_details = StorageService.Get("node_details");
                    var openstack_sites = [];
                    angular.forEach(node_details, function(site, index){
                        if(site.type == 'openstack_site'){
                            openstack_sites.push(site);
                        }
                    });
                    if (Object.keys($rootScope.images).length == openstack_sites.length && Object.keys($rootScope.flavors).length == openstack_sites.length) {
                        var dlg = dialogs.create(_dialog_path + "add_vms.tpl.html", 'customController', {data: "data", anotherVar: 'value'}, {backdrop: 'static', size:'lg'}, 'ctrl');
                           
                        dlg.result.then(function (cloudObj){
                                $scope.isVMOpen = false; // on submit
                            }, function (msg) {
                                $scope.isVMOpen = false; // on cancel
                                $scope.validSiteName = true;
                                if (angular.equals($scope.name, ''))
                                    $scope.name = 'You did not enter in your name!';
                            });
                        $interval.cancel($scope.checkImagesFlavors);
                    }
                }, 1000);
            }    
        };
    };
    //Calculation for dynamic Window Height and Width 
     app.directive('resize', function ($window) {
        return function (scope, element) {
            var w = angular.element($window);
            scope.getWindowDimensions = function () {
                return { 'h': w.height(), 'w': w.width() };
            };
            scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
                scope.windowHeight = newValue.h;
                scope.windowWidth = newValue.w;
                
                scope.style = function () {
                    return { 
                        'height': (newValue.h - 113) + 'px',
                        'width': (newValue.w - 125) + 'px' 
                    };
                };

            }, true);

            w.bind('resize', function () {
                scope.$apply();
            });
        }
    })
    //
    controller_test.$inject = injectParams;
    app.controller('baseController', controller_test);
});
