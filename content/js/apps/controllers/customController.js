'use strict';

define(['app'], function (app){
    var injectParams = ['$scope','$state','$rootScope', '$timeout', '$interval', 'AppConfig', '$uibModalInstance', 'dialogs', '$mdDialog', 'InitService', 'StorageService', 'MSMService', 'GraphService', 'QueueService'];
    var customDialogController = function ($scope, $state, $rootScope, $timeout, $interval, AppConfig, $uibModalInstance, dialogs, $mdDialog, InitService, StorageService, MSMService, GraphService, QueueService){
        var _dialog_path  = "content/js/apps/templates/";
        
        $scope.customerName = /^[a-zA-Z0-9]*$/; 
        $scope.customerName = /^[a-zA-Z0-9-_]+$/;
        
        $scope.ExSiteNamePattern = /^[a-zA-Z0-9]*$/;
        $scope.ExAsNumPattern = /^[0-9]{1,6}$/;
        //$scope.FloatingIpQuotaPattern = /^[1-9]$/;
        $scope.FloatingIpQuotaPattern = /^\d{1,6}$/;
        
//        $scope.ExIpRange = /^([1-2][0-5][0-5]|[1-2][0-4][0-9]|[1-1][0-9][0-9]|[1-9][0-9]|[1-9])\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([1-9]|[12]\d|3[0-2])$/;
        $scope.ExIpRange = /^([1-2][0-5][0-5]|[1-2][0-4][0-9]|[1-1][0-9][0-9]|[1-9][0-9]|[1-9])\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(1[6-9]|2[0-4])$/;
//        $scope.ExGateway = /^([1-2][0-5][0-5]|[1-2][0-4][0-9]|[1-1][0-9][0-9]|[1-9][0-9]|[1-9])\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        //$scope.ExGateway = /^([1-2][0-5][0-5]|[1-2][0-4][0-9]|[1-1][0-9][0-9]|[1-9][0-9]|[1-9])\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])$/;
        $scope.ExGateway = /^([1-2][0-5][0-5]|[1-2][0-4][0-9]|[1-1][0-9][0-9]|[1-9][0-9]|[1-9])\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.([1-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/;
        
        $rootScope.openstack_site = "";
        $rootScope.external_site = "";
        $rootScope.saved_external_site = "";
        $rootScope.connection = "";
        $rootScope.vm = "";
        
        $scope.ShowAddIp = true;
        init();
        function init(){
            InitService.GetLocalData($scope);
        }
        
        var isError = false;
        $scope.ipArr = [];
        $scope.siteNameExist = false;
        $scope.AsNumExist = false;
        $scope.siteNameArr = [];
        $scope.AsNumArr = [];
        $scope.exSiteName = "";
        $scope.AsNumber = "";
        $scope.IpRangeArr = [];
        $scope.GatwayAddArr = [];
        
        $scope.openstack_details = [];
        $scope.external_sites_details = [];
        $scope.VMs = {};
        
        $scope.IsSubnet_editable = AppConfig.subnet_mandatory;
        $scope.IR_mandatory = AppConfig.internal_resource_mandatory;
        
        
        //console.log("46", $scope.IsSubnet_editable);
        
//        $scope.bbSubnet1Checked = true;
//        $scope.inteResSubnet1Checked = true;
//        $scope.floatInterSubnet1Checked = true;
//        $scope.bbSubnet2Checked = true;
//        $scope.inteResSubnet2Checked = true;
//        $scope.floatInterSubnet2Checked = true;
        
        //$rootScope.subnetStatus = {site1:{bbSubnetChecked:true,inteResSubnetChecked:true,floatInterSubnetChecked:true},
                              // site2:{bbSubnetChecked:true,inteResSubnetChecked:true,floatInterSubnetChecked:true}}
        
//        $scope.inputClick = function(){
//            console.log("56", $scope.bbSubnet1Checked); 
//            $scope.bbSubnet1Checked = $scope.bbSubnet1Checked;
//        }
        
        
        function disableMouseEvents(){
            $("body").css("pointer-events", "none");
            //$("body").append("<div class='overlay'></div>")
        }
        
        function enableMouseEvents(){
            $("body").css("pointer-events", "");
            //$(".overlay").remove();
        }    
        
        var node_details = StorageService.Get("node_details");
        if (node_details){
            angular.forEach(node_details, function(site, index){
                if (site.type == 'external_site'){
                    $scope.external_sites_details.push(site);
                }
                else{
                    
                    $scope.openstack_details.push(site);
                    $scope.VMs[site.site_name] = [];
                    $scope.bbSubnetVal = "";
                    
                    if(site.VM){
                        angular.forEach(site.VM, function(vm, vm_index){
                            $scope.VMs[site.site_name].push({'site_name' : site.site_name,
                                                             'index': vm_index + 1,
                                                             'name' : vm.name,
                                                             'imageRefList' : $rootScope.images[site.site_name],
                                                             'number' : '1',
                                                             'flavorRefList': $rootScope.flavors[site.site_name],
                                                             'networks' : $rootScope.networks_map[site.site_name], /* Need to work on this */
                                                             'addresses': vm.addresses,
                                                             'srId': vm.srId,
                                                             'excessVm':false})
                        });
                            $scope.VMs[site.site_name].push({'site_name' : site.site_name,
                                                       'index': site.VM.length + 1,
                                                       'name' : '',
                                                       'imageRefList' : $rootScope.images[site.site_name],
                                                       'number' : '1',
                                                       'flavorRefList': $rootScope.flavors[site.site_name],
                                                       'networks' : $rootScope.networks_map[site.site_name], /* Need to work on this */
                                                       'addresses': [],
                                                       'srId': ''});
                    }                                   
                    else{
                        $scope.VMs[site.site_name].push({'site_name' : site.site_name,
                                                       'index': 1,
                                                       'name' : '',
                                                       'imageRefList' : $rootScope.images[site.site_name],
                                                       'number' : '1',
                                                       'flavorRefList': $rootScope.flavors[site.site_name],
                                                       'networks' : $rootScope.networks_map[site.site_name],
                                                       'addresses': [],
                                                       'srId': '',
                                                       'subnets': $rootScope.subnetStatus});
                    } 
                }
            });
        }
        
        /// temp function for testing
        $scope.test = function()
        {
            var index1 = 1;
            var index2 = 2;
//            console.log("bbSubnetChecked1", $scope.subnetStatus['site'+index1].bbSubnetChecked);
//            console.log("bbSubnetChecked2", $scope.subnetStatus['site'+index2].bbSubnetChecked);
        }
        if($scope.external_sites_details != []){
            for(var i=0;i<$scope.external_sites_details.length;i++)
            {
                $scope.siteNameArr.push($scope.external_sites_details[i].site_name);
                $scope.AsNumArr.push($scope.external_sites_details[i].as_number);
                $scope.IpRangeArr.push($scope.external_sites_details[i].ip_range);
                $scope.GatwayAddArr.push($scope.external_sites_details[i].gateway_ip_address);
            }
        }
        
        $scope.ExSiteNameUpdate = function(){
            if($scope.siteNameArr !== [] && $scope.exSiteName !== "" && $scope.exSiteName !== null && typeof $scope.exSiteName !== "undefined"){
                for(var i=0; i<$scope.siteNameArr.length; i++){
                    if($scope.siteNameArr[i].toLowerCase() === $scope.exSiteName.toLowerCase()){
                        $scope.siteNameExist = true;
                    }
                    else{
                        $scope.siteNameExist = false;
                    }
                }
            }
        }
        
        $scope.ExASNumUpdate = function(){
            if($scope.AsNumArr !== [] && $scope.AsNumber !== "" && $scope.AsNumber !== null && typeof $scope.AsNumber !== "undefined"){
                if($scope.AsNumArr.indexOf($scope.AsNumber)!== -1){
                    $scope.AsNumExist = true;
                }
                else{
                    $scope.AsNumExist = false;
                }
            }
        }
        
        $scope.ExIpRangeUpdate = function(){
            if($scope.IpRangeArr !== []){
                for(i=0; i<$scope.IpRangeArr.length; i++)
                {
                    if($scope.IpRangeArr[i].indexOf($scope.IpRange1)!== -1){
                        $scope.Ip1Exist = true;
                    }
                    else{
                        $scope.Ip1Exist = false;
                    }
                    if($scope.IpRangeArr[i].indexOf($scope.IpRange2)!== -1){
                        $scope.Ip2Exist = true;
                    }
                    else{
                        $scope.Ip2Exist = false;
                    }
                }
            }
        }
        
        $scope.ExGatewayUpdate = function(){
            if($scope.GatwayAddArr !== []){
                for(i=0; i<$scope.GatwayAddArr.length; i++)
                {
                    if($scope.GatwayAddArr[i].indexOf($scope.gatewayAdd1)!== -1){
                        $scope.gateway1Exist = true;
                    }
                    else{
                        $scope.gateway1Exist = false;
                    }
                    if($scope.GatwayAddArr[i].indexOf($scope.gatewayAdd2)!== -1){
                        $scope.gateway2Exist = true;
                    }
                    else{
                        $scope.gateway2Exist = false;
                    }
                }
            }
        }
        
        $scope.addExtSite = function(){
           //scope.externalSite.push({id:$scope.externalSite.length+1})
           $scope.ShowAddIp = false;
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
            
            if(customer.max_vms_per_site > 5 ){
                $scope.custSites = 5;
            }
            else if(customer.max_vms_per_site <= 0){
                $scope.custSites = 1;
            }
            else{
                $scope.custSites = customer.max_vms_per_site;
            }

            $scope.maxVmsNoChange = function(){
                $scope.custSites = $scope.custSites;
            }
            // Add OpenStack Template - Input value generation
            $scope.OsSitesNames = [];
            var openstack_data  = result.openstack;  // get data from json
            for (var i = 0; i < openstack_data.length; i++){
                $scope.site_name = openstack_data[i].site_name ;
                $scope.OsSitesNames.push($scope.site_name);
            }
            
            $scope.getway_data  = result.cpe;
            $scope.gatewayList_PaloAlto = [];
            $scope.gatewayList_Frankfurt = [];
            
            $scope.$on("OnListVsiteOGREvent", function (event, result, error) {
                if (result == null && error == null){
                    if (AppConfig.environment !== 'development'){
                        $uibModalInstance.close();
                        $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .clickOutsideToClose(false)
                            .title('Connection Error!')
                            .textContent("Could not connect to the MSM Server.")
                            .ariaLabel('Error Dialog')
                            .ok('ok')
                        );
                    } 
                }
                else {
                    if (result.site_name == "PaloAlto"){
                        $scope.gatewayList_PaloAlto = [];
                    }
                    else if(result.site_name == "Frankfurt"){
                        $scope.gatewayList_Frankfurt = [];
                    }
                    
                    var gatewayData = $scope.getway_data[result.site_name];
                    var site_ogr = result.cpe;
                    
                    for(var m=0; m < gatewayData.length; m++){
                        var used = false;
                        for(var l=0; l < site_ogr.length; l++){
                            if (site_ogr[l].cpeIpAddr == gatewayData[m].cpeIpAddr || site_ogr[l].cpeSegmentationId == gatewayData[m].cpeSegmentationId){
                                used = true;
                                break;
                            }    
                        }  
                        if (!used){
                            if (result.site_name == "PaloAlto"){
                                $scope.gatewayList_PaloAlto.push(gatewayData[m].cpeName);
                            }
                            else if(result.site_name == "Frankfurt"){
                                $scope.gatewayList_Frankfurt.push(gatewayData[m].cpeName);
                            }
                        }
                    }
                }    
            });
            
            $scope.fip_data  = result.fip;
            $scope.fipList_PaloAlto = [];
            $scope.fipList_Frankfurt = [];
            
            $scope.$on("OnListVsiteFIPEvent", function (event, result) {
                if (result.site_name == "PaloAlto"){
                    $scope.fipList_PaloAlto = [];
                }
                else if(result.site_name == "Frankfurt"){
                    $scope.fipList_Frankfurt = [];
                }
                
                var fipData = $scope.fip_data[result.site_name];
                var site_fip = result.fip.subnetworks;
                
                for(var m=0; m < fipData.length; m++){
                    var used = false;
                    for(var l=0; l < site_fip.length; l++){
                        if (site_fip[l].allocationPools[0].start == fipData[m].subnetworks[0].allocationPools[0].start || site_fip[l].allocationPools[0].end == fipData[m].subnetworks[0].allocationPools[0].end){
                            used = true;
                            break;
                        }    
                    }  
                    if (!used){
                        if (result.site_name == "PaloAlto"){
                            $scope.fipList_PaloAlto.push(fipData[m].fipRange);
                        }
                        else if(result.site_name == "Frankfurt"){
                            $scope.fipList_Frankfurt.push(fipData[m].fipRange);
                        }
                    }
                }
            });
            
            
            var getOGRData = function(site_name){
                MSMService.ListVsiteOGR($scope, site_name);
                return $scope.gatewayList;
            }
            
            $scope.update = function() {
                $scope.subnetDataList1 = [];
                $scope.subnetDataList2 = [];
                $scope.gatewayDataList1 = [];
                $scope.gatewayDataList2 = [];
                $scope.subnetInternal1 = [];
                $scope.subnetInternal2 = [];
                $scope.subnetFIP1 = [];
                $scope.subnetFIP2 = [];
                $scope.fipDataList1 = [];
                $scope.fipDataList2 = [];
                
                if($scope.siteField1 == "PaloAlto"){
                    $scope.siteField1 = "PaloAlto";
                    var openstack_data_List = result.openstack;
                    for(var i = 0; i < openstack_data_List.length; i++){
                        if(openstack_data_List[i].site_name == $scope.siteField1){
                            $scope.subnetDataList1 = openstack_data_List[i].default_subnet_site;
                            $scope.subnetInternal1 = openstack_data_List[i].internal_resource_subnet;
                            $scope.subnetFIP1 = openstack_data_List[i].fip_subnet;
                            //for(var j=0; j<openstack_data_List[i].default_subnet_site.length; j++){
                            //    $scope.subnetDataList1.push(openstack_data_List[i].default_subnet_site[j]);
                            //}
                            if (AppConfig.environment === 'production' || AppConfig.environment === 'redirection'){
                                MSMService.ListVsiteOGR($scope, $scope.siteField1);
                                $timeout(function() { 
                                    if ($scope.gatewayList_PaloAlto.length == 0){
                                        $uibModalInstance.close();
                                        $mdDialog.show(
                                            $mdDialog.alert()
                                            .parent(angular.element(document.body))
                                            .clickOutsideToClose(false)
                                            .title('Connection Error!')
                                            .textContent("One of OpenStack Site's Gateway(OGR) is used up completely.\nCouldn't add any more OpenStack Site(s).")
                                            .ariaLabel('Error Dialog')
                                            .ok('ok')
                                        );
                                    }
                                    else {
                                        $scope.gatewayValList1 = $scope.gatewayList_PaloAlto;
                                        MSMService.ListVsiteFIP($scope, $scope.siteField1);
                                    }    
                                }, 1000);
                                
                                $timeout(function() { 
                                    $scope.fipRangeList1 = $scope.fipList_PaloAlto;
                                }, 2000);
                                
                            }    
                            else {
                                for(var m=0; m<openstack_data_List[i].cpeName.length; m++){
                                    $scope.gatewayDataList1.push(openstack_data_List[i].cpeName[m]);
                                }
                                $scope.gatewayValList1 = $scope.gatewayDataList1;
                                
                                for(var n=0; n<openstack_data_List[i].fipRange.length; n++){
                                    $scope.fipDataList1.push(openstack_data_List[i].fipRange[n]);
                                }
                                $scope.fipRangeList1 = $scope.fipDataList1;
                            }
                        }
                        $scope.subnetValList1 = $scope.subnetDataList1;
                        $scope.subnetInternalList1 = $scope.subnetInternal1;
                        $scope.subnetFIPList1 = $scope.subnetFIP1;
                        
                        $scope.siteField2 = "Frankfurt";
                        if(openstack_data_List[i].site_name == $scope.siteField2){
                            $scope.subnetDataList2 = openstack_data_List[i].default_subnet_site;
                            $scope.subnetInternal2 = openstack_data_List[i].internal_resource_subnet;
                            $scope.subnetFIP2 = openstack_data_List[i].fip_subnet;
                            //for(var k=0; k<openstack_data_List[i].default_subnet_site.length; k++){
                            //    $scope.subnetDataList2.push(openstack_data_List[i].default_subnet_site[k]);                      
                            //}
                            if (AppConfig.environment === 'production' || AppConfig.environment === 'redirection'){
                                MSMService.ListVsiteOGR($scope, $scope.siteField2);
                                $timeout(function() {
                                    if ($scope.gatewayList_Frankfurt.length == 0){
                                        $uibModalInstance.close();
                                        $mdDialog.show(
                                            $mdDialog.alert()
                                            .parent(angular.element(document.body))
                                            .clickOutsideToClose(false)
                                            .title('Connection Error!')
                                            .textContent("One of OpenStack Site's Gateway(OGR) is used up completely.\nCouldn't add any more OpenStack Site(s).")
                                            .ariaLabel('Error Dialog')
                                            .ok('ok')
                                        );
                                    }
                                    else {    
                                        $scope.gatewayValList2 = $scope.gatewayList_Frankfurt;
                                        MSMService.ListVsiteFIP($scope, $scope.siteField2);
                                    }    
                                }, 1000);
                                
                                $timeout(function() { 
                                    $scope.fipRangeList2 = $scope.fipList_Frankfurt;
                                }, 2000);
                            }    
                            else {
                                for(var m=0; m<openstack_data_List[i].cpeName.length; m++){
                                    $scope.gatewayDataList2.push(openstack_data_List[i].cpeName[m]);
                                }
                                $scope.gatewayValList2 = $scope.gatewayDataList2;
                                
                                for(var n=0; n<openstack_data_List[i].fipRange.length; n++){
                                    $scope.fipDataList2.push(openstack_data_List[i].fipRange[n]);
                                }
                                $scope.fipRangeList2 = $scope.fipDataList2;
                            }    
                        }
                        $scope.subnetValList2 = $scope.subnetDataList2;
                        $scope.subnetInternalList2 = $scope.subnetInternal2;
                        $scope.subnetFIPList2 = $scope.subnetFIP2;
                    }
                }
                else if($scope.siteField1 == "Frankfurt"){
                    $scope.siteField1 = "Frankfurt";
                    var openstack_data_List = result.openstack;
                    for(var i = 0; i < openstack_data_List.length; i++){
                        if(openstack_data_List[i].site_name == $scope.siteField1){
                            $scope.subnetDataList1 = openstack_data_List[i].default_subnet_site;
                            $scope.subnetInternal1 = openstack_data_List[i].internal_resource_subnet;
                            $scope.subnetFIP1 = openstack_data_List[i].fip_subnet;
                            //for(var j=0; j<openstack_data_List[i].default_subnet_site.length; j++){
                            //    $scope.subnetDataList1.push(openstack_data_List[i].default_subnet_site[j]);
                            ///}
                            if (AppConfig.environment === 'production' || AppConfig.environment === 'redirection'){
                                MSMService.ListVsiteOGR($scope, $scope.siteField2);
                                $timeout(function() { 
                                    if ($scope.gatewayList_Frankfurt.length == 0){
                                        $uibModalInstance.close();
                                        $mdDialog.show(
                                            $mdDialog.alert()
                                            .parent(angular.element(document.body))
                                            .clickOutsideToClose(false)
                                            .title('Connection Error!')
                                            .textContent("One of OpenStack Site's Gateway(OGR) is used up completely.\nCouldn't add any more OpenStack Site(s).")
                                            .ariaLabel('Error Dialog')
                                            .ok('ok')
                                        );
                                    }
                                    else { 
                                        $scope.gatewayValList1 = $scope.gatewayList_Frankfurt;
                                        MSMService.ListVsiteFIP($scope, $scope.siteField2);
                                    }    
                                }, 1000);
                                
                                $timeout(function() { 
                                    $scope.fipRangeList1 = $scope.fipList_Frankfurt;
                                }, 2000);
                            }    
                            else {
                                for(var m=0; m<openstack_data_List[i].cpeName.length; m++){
                                    $scope.gatewayDataList1.push(openstack_data_List[i].cpeName[m]);
                                }
                                $scope.gatewayValList1 = $scope.gatewayDataList1;
                                
                                for(var n=0; n<openstack_data_List[i].fipRange.length; n++){
                                    $scope.fipDataList1.push(openstack_data_List[i].fipRange[n]);
                                }
                                $scope.fipRangeList1 = $scope.fipDataList1;
                            }    
                        }
                        $scope.subnetValList1 = $scope.subnetDataList1;
                        $scope.subnetInternalList1 = $scope.subnetInternal1;
                        $scope.subnetFIPList1 = $scope.subnetFIP1;
                        
                        $scope.siteField2 = "PaloAlto";
                        if(openstack_data_List[i].site_name == $scope.siteField2){
                            $scope.subnetDataList2 = openstack_data_List[i].default_subnet_site;
                            $scope.subnetInternal2 = openstack_data_List[i].internal_resource_subnet;
                            $scope.subnetFIP2 = openstack_data_List[i].fip_subnet;
                            //for(var k=0; k<openstack_data_List[i].default_subnet_site.length; k++){
                            //    $scope.subnetDataList2.push(openstack_data_List[i].default_subnet_site[k]);
                            //}
                            if (AppConfig.environment === 'production' || AppConfig.environment === 'redirection'){
                                MSMService.ListVsiteOGR($scope, $scope.siteField1);
                                $timeout(function() { 
                                    if ($scope.gatewayList_PaloAlto.length == 0){
                                        $uibModalInstance.close();
                                        $mdDialog.show(
                                            $mdDialog.alert()
                                            .parent(angular.element(document.body))
                                            .clickOutsideToClose(false)
                                            .title('Connection Error!')
                                            .textContent("One of OpenStack Site's Gateway(OGR) is used up completely.\nCouldn't add any more OpenStack Site(s).")
                                            .ariaLabel('Error Dialog')
                                            .ok('ok')
                                        );
                                    }
                                    else { 
                                        $scope.gatewayValList2 = $scope.gatewayList_PaloAlto;
                                        MSMService.ListVsiteFIP($scope, $scope.siteField1);
                                    }    
                                }, 1000);
                                
                                $timeout(function() { 
                                    $scope.fipRangeList2 = $scope.fipList_PaloAlto;
                                }, 2000);
                            }    
                            else {
                                for(var m=0; m<openstack_data_List[i].cpeName.length; m++){
                                    $scope.gatewayDataList2.push(openstack_data_List[i].cpeName[m]);
                                }
                                $scope.gatewayValList2 = $scope.gatewayDataList2;
                                
                                for(var n=0; n<openstack_data_List[i].fipRange.length; n++){
                                    $scope.fipDataList2.push(openstack_data_List[i].fipRange[n]);
                                }
                                $scope.fipRangeList2 = $scope.fipDataList2;
                            }    
                        }
                        $scope.subnetValList2 = $scope.subnetDataList2;
                        $scope.subnetInternalList2 = $scope.subnetInternal2;
                        $scope.subnetFIPList2 = $scope.subnetFIP2;
                    }
                }
            }
        
            $rootScope.maxExSites = result.maxexternalsite;
            $scope.externalSiteNameList = $scope.siteNameArr;
            $scope.exSitesNamesList = [];
            var openstack_data  = result.openstack;  // get data from json
            for (var i = 0; i < openstack_data.length; i++){
                $scope.site_name = openstack_data[i].site_name ;
                $scope.exSitesNamesList.push($scope.site_name);
            }
            $scope.sites =[{'index':1,
                            'CloudSiteField1' : $scope.exSitesNamesList,
                            'CloudSubnetField1' : "",
                            'exSiteName1' : $scope.externalSiteNameList,
                            'exSiteIpRange1' : "",
                            'externalSiteIpRangeList':[],
                            'isDuplicate':false}]
			
			//for connection data which are disabled and already done
            var existConnections = StorageService.Get("connections");
            $scope.connectionsData = [];
            angular.forEach(existConnections, function(value, index){
                var obj ={'index': $scope.connectionsData.length+1,
                'CloudSiteField1' : value.site_name,
                'CloudSubnetField1' :value.subnet,
                'exSiteName1' : value.connect_to,
                'exSiteIpRange1' :value.ip_range,
                'externalSiteIpRangeList':value.ip_range
                };
                $scope.connectionsData.push(obj);
            });
            
            $scope.exSitesNamesList = [];
            var openstack_data  = result.openstack;  // get data from json
            for (var i = 0; i < openstack_data.length; i++){
                $scope.site_name = openstack_data[i].site_name ;
                $scope.exSitesNamesList.push($scope.site_name);
            }
            
            $scope.changeCloud = function(num){
                for(var i=0; i<$rootScope.cloudsCreated.length; i++){
                    if($rootScope.cloudsCreated[i].site_name == $scope.sites[num].CloudSiteField1){
                        $scope.sites[num].CloudSubnetField1 = $rootScope.cloudsCreated[i].defaultSubnet;
                    }
                }
            }

            // For selecting the External Site in Connect Site
            $scope.exSiteNameSelect = function(num){
                if($scope.external_sites_details != [])
                {
                    for(var i=0;i<$scope.external_sites_details.length;i++)
                    {   
                        if($scope.sites[num].exSiteName1.toLowerCase() == $scope.external_sites_details[i].site_name.toLowerCase()){
                            $scope.sites[num].externalSiteIpRangeList = $scope.external_sites_details[i].ip_range;
                        }
                    }
                }
            }
                
            // For selecting the IP Range in Connect Site            
            $scope.isDup = false;
            $scope.exSiteIpSelect = function(num){
                if($scope.sites.length>0 || $scope.connectionsData.length > 0){
                    $scope.sites[num].isDuplicate = false;
                    $scope.isDup = false;
                    
                    for(var i=$scope.sites.length-1;i>=0;i--)
                    {
                        if( $scope.sites[num].exSiteIpRange1 == $scope.sites[i].exSiteIpRange1 && i != num)
                        {
                            $scope.sites[num].isDuplicate = true;
                            $scope.isDup = true;
                            $scope.lastDupId = num;
                        }
                    }
                    if(!$scope.isDup)
                    {
                        for(var j=0;j<$scope.connectionsData.length;j++)
                        {
                            if($scope.sites[num].exSiteIpRange1 == $scope.connectionsData[j].exSiteIpRange1 && i != num)
                            {
                                $scope.sites[num].isDuplicate = true;
                                $scope.isDup = true;
                                $scope.lastDupId = num;  
                            }

                        }  
                    }
                    
                }
            }
            
            $scope.addConnection = function(){
            $scope.connectionsAllowed = $rootScope.maxConnections - $scope.connectionsData.length
                if($scope.sites.length<$scope.connectionsAllowed){
                   var num = $scope.sites.length+1;
                    var obj = {
                        'index':num,
                        'CloudSiteField1' : $scope.exSitesNamesList,
                        'CloudSubnetField1' : "",
                        'exSiteName1' : $scope.externalSiteNameList,
                        'exSiteIpRange1' : "",
                        'isDuplicate':false
                        };
                    $scope.sites.push(obj);  
                }
            }
            
            $scope.deleteConnectionRow = function(index){
                index = index - 1;
                $scope.sites.splice(index, 1);
                angular.forEach($scope.sites, function(value, i){
                    $scope.sites[i].index = i+1;
                });  
            }
            
            // Add VM Row
            $scope.addVms = function(site_name){
                var existing_vms = [];
                var subnet = '';
                var node_details = StorageService.Get("node_details");
                angular.forEach(node_details, function(site, index){
                    if (site.site_name == site_name){
                        subnet = site.defaultSubnet;
                        if(site.VM){
                            existing_vms = existing_vms.concat(site.VM);
                        }    
                    } 
                }); 
                    
                $scope.maxVMsAllowed = StorageService.Get("customer").max_sites_vms;
                
                var vm_length = 0;
                angular.forEach($scope.VMs[site_name], function(vm, index){
                    vm_length += parseInt(vm.number, 10);
                });
                
                if(vm_length < $scope.maxVMsAllowed){
                    var vmobj = {'site_name' : site_name,
                                 'index' : $scope.VMs[site_name].length + 1,
                                 'name' : '',
                                 'imageRefList' : $rootScope.images[site_name],
                                 'number' : '1',
                                 'flavorRefList': $rootScope.flavors[site_name],
                                 'networks' : $rootScope.networks_map[site_name],
                                 'addresses': [],
                                 'srId': '',
                                 'excessVm':false};
                    $scope.VMs[site_name].push(angular.copy(vmobj));  
                }
            }
            
            var max_sites_vms = customer.max_vms_per_site;
            try{
                max_sites_vms = StorageService.Get("customer").max_sites_vms;
            }
            catch(e){
                //e
            }
            
            var vmLeftPA =  max_sites_vms - $rootScope.vmsVal['PaloAlto'];
            var vmLeftFF = max_sites_vms - $rootScope.vmsVal['Frankfurt'];
            $scope.vmLeft = {"PaloAlto":vmLeftPA,"Frankfurt":vmLeftFF};
            $scope.vmNumUpdate = function(index, site){
                var count = 0;
                var number = 0;
                for (var i = 0; i < $scope.VMs[site].length; i++ ){
                    if (isNaN($scope.VMs[site][i].number) || $scope.VMs[site][i].number.trim() == ""){
                        continue;
                    }
                    if ($scope.VMs[site][i].name || $scope.VMs[site][i].imageRef || $scope.VMs[site][i].flavorRef || $scope.VMs[site][i].backboneRef || $scope.VMs[site][i].floatingipRef || $scope.VMs[site][i].internal_resourcesRef){
                        number += parseInt($scope.VMs[site][i].number, 10);
                    }
                }
                
                var MaxSites = max_sites_vms;
                var ExistingVMs = $rootScope.vmsVal[site];
                count = MaxSites - number;
                
                if ($scope.VMs[site].length > 0){
                    if(number > max_sites_vms || count > max_sites_vms){
                        $scope.VMs[site][index].excessVm = true;
                    }
                    else{
                        $scope.VMs[site][index].excessVm = false;
                    }                
                }
                
                if (count < 0 || count == NaN){
                    count = 0;
                }
                $scope.vmLeft[site] = count;
            }
            
            // Delete VM Row
            $scope.deleteVMrow = function(site_name, index){
                
                index = index - 1;
                $scope.VMs[site_name].splice(index, 1);
                angular.forEach($scope.VMs[site_name], function(value, i){
                    $scope.VMs[site_name][i].index = i+1;
                });    
                if(index > 0){
                   $scope.vmNumUpdate(index-1, site_name); 
                }
                else{
                    $scope.vmNumUpdate(index, site_name); 
                }   
            }
        });
        
        
        $scope.submitForm = function(param){
            GraphService.graph.clear();
            StorageService.RemoveAll();
            
            $rootScope.zoomValue = AppConfig.default_zoom;
            GraphService.zoomValue = AppConfig.default_zoom;
            GraphService.scaleGraph(0, 0, AppConfig.default_zoom/100);
            
            
            $rootScope.action = "";
            $rootScope.notification = "";
            $rootScope.apiCalls = [];
            $rootScope.activeSites = [];
            $rootScope.customer_details = "";
            $rootScope.images = {};
            $rootScope.flavors = {};
            $rootScope.action = "";
            $rootScope.CPE = {};
            $rootScope.vmsVal = {};
            delete $rootScope.external_data;
            QueueService.removeAll()
            
            if ($scope.userForm.$valid) {
                var isError = false;            
                var data = {customer_name:$scope.custName, 
                            service_level:$scope.serviceLevel, 
                    	    max_cloud_sites:$scope.custClouds, 
                            max_sites_vms: $scope.custSites}
                
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
			
                if (!StorageService.GetCustomer($scope.custName)){
                    if(!isError)
                    {
                        var existing_customer = false;
                        angular.forEach($rootScope.ExistingCustomer, function(customer, index){
                            if (customer == $scope.custName){
                                existing_customer = true;
                                return false
                            }
                        });
                        
                        if (existing_customer){
                            $rootScope.LoadCustomer($scope.custName);
                            //close the dialog
                            $uibModalInstance.close();
                        }
                        else {
                            // call MSMService createCustomer service to create a customer
                            MSMService.CreateCustomer($scope,{name:$scope.custName});    
                        }
                        
                        $rootScope.currentState = 1;
                    }
                }
                else {
                     $uibModalInstance.close();
                }
                
                $scope.$on("OnCreateCustomerEvent", function (event, response, error_msg)
                {
                    data = $.extend(data, response);
                    StorageService.AddCustomer(data);
                    MSMService.SaveCustomerData($scope, $scope.custName, data);
                    //close the dialog
                    $uibModalInstance.close();
                });
            }    
        };

        $scope.submitOsForm = function(param){
            if ($scope.cloudForm.$valid) {
                $rootScope.notification = "Adding OpenStack Site..."
                $scope.backboneSubnetVal1 = $scope.subnetField1;
                $scope.backboneSubnetVal2 = $scope.subnetField2;
                if($rootScope.subnetStatus.site1.bbSubnetChecked == false){
                    $scope.backboneSubnetVal1 = '';
                }
                else{
                    $scope.backboneSubnetVal1 = $scope.subnetField1;
                }
                if($rootScope.subnetStatus.site2.bbSubnetChecked == false){
                    $scope.backboneSubnetVal2 = '';
                }
                else{
                    $scope.backboneSubnetVal2 = $scope.subnetField2;
                }
                if (StorageService.GetCustomer()){
                    var data = [{'site_name': $scope.siteField1,
                                 'type': 'openstack_site',
                                 'status': 'inactive',
                                 'defaultSubnet': $scope.internalSubnetField1 ? $scope.internalSubnetField1 : '', 
                                 'cpe':[],
                                 'fip':{}},
                                {'site_name': $scope.siteField2,
                                 'type': 'openstack_site',
                                 'status': 'inactive',
                                 'defaultSubnet': $scope.internalSubnetField2 ? $scope.internalSubnetField2 : '', 
                                 'cpe':[],
                                 'fip':{}}]
                    
                    $scope.cloudsCreated = [{'site_name': $scope.siteField1,
                                             'defaultSubnet':$scope.backboneSubnetVal1},
                                            {'site_name': $scope.siteField2,
                                             'defaultSubnet': $scope.backboneSubnetVal2}]
                    
                    $rootScope.cloudsCreated = $scope.cloudsCreated;
                    var cpe_data = $scope.getway_data;
                    var customer_name = StorageService.GetCustomer().customer_name;
                    
                    var cpe_data_1 = $scope.getway_data[$scope.siteField1];
                    var cpe_data_2 = $scope.getway_data[$scope.siteField2];
                    
                    for (var i = 0; i < cpe_data_1.length; i++){
                        if ($scope.gatewayField1 == cpe_data_1[i].cpeName){
                            cpe_data_1[i]['subnetCidr'] = $scope.backboneSubnetVal1;
                            data[0]['cpe'] = [cpe_data_1[i]];
                        }
                    }    
                    for (var j = 0; j < cpe_data_2.length; j++){    
                        if ($scope.gatewayField2 == cpe_data_2[j].cpeName){
                            cpe_data_2[j]['subnetCidr'] = $scope.backboneSubnetVal2;
                            data[1]['cpe'] = [cpe_data_2[j]];
                        }
                    }

                    var fip_data = $scope.fip_data;
                    var fip_data_1 = $scope.fip_data[$scope.siteField1];
                    var fip_data_2 = $scope.fip_data[$scope.siteField2];
                    
                    for (var m = 0; m < fip_data_1.length; m++){
                        if ($scope.fipRangeField1 == fip_data_1[m].fipRange){
                      //      fip_data_1[m]['subnetCidr'] = $scope.fipSubnetField1 ? $scope.fipSubnetField1 : '';
                            fip_data_1[m]['subnetCidr'] = '10.10.1.0/24';
                            data[0]['fip'] = fip_data_1[m];
                        }
                    }    
                    for (var n = 0; n < fip_data_2.length; n++){
                        if ($scope.fipRangeField2 == fip_data_2[n].fipRange){
                   //         fip_data_2[n]['subnetCidr'] = $scope.fipSubnetField2 ? $scope.fipSubnetField2 : '';  
		            fip_data_2[n]['subnetCidr'] = '10.10.1.0/24';
                            data[1]['fip'] = fip_data_2[n];
                        }
                    }    
                    
                    angular.forEach(data, function(value, index){
                        if (!StorageService.GetSite(value.site_name)){
                            $timeout(function() { 
                                MSMService.InitCustomerVsite($scope, customer_name, angular.copy(value));
                                $rootScope.currentState = 2;
                                $rootScope.openstack_site = value;
                            }, AppConfig.environment === 'development' ? index * 500 : index * 10000);
                        }
                    });
                }
                $uibModalInstance.close();
            }
            else{
//                alert("Please choose the options required.")
            }
        };
        
        $scope.submitExternalSiteForm = function(param){
            if ($scope.externalSiteForm.$valid ){
                var isValidationError = false;
                if($scope.AsNumExist || $scope.Ip1Exist || $scope.gateway1Exist
                    || $scope.IpRange1 == $scope.IpRange2 || $scope.Ip2Exist
                    || $scope.gatewayAdd1 == $scope.gatewayAdd2 || $scope.gateway2Exist)
                {
                    isValidationError = true;
                    
                }
                
                
                var ipArr = [];
                ipArr[0] = $scope.IpRange1;
                if($scope.IpRange2 != "" && $scope.IpRange2 != undefined)
                {
                    ipArr[1] = $scope.IpRange2;
                }
                var gatewayArr = [];
                gatewayArr[0] = $scope.gatewayAdd1;
                if($scope.gatewayAdd2 != "" && $scope.gatewayAdd2 != undefined)
                {
                    gatewayArr[1] = $scope.gatewayAdd2;
                }
                
                var customer_name = StorageService.GetCustomer().customer_name;
                
                var data = {'site_name': $scope.exSiteName,
                            'type': 'external_site',
                            'as_number': $scope.AsNumber,
                            'ip_range': ipArr,
                            'gateway_ip_address':gatewayArr,
                            } 
                if(!isValidationError)
                {
                    $rootScope.notification = "Adding External Site...";
                    MSMService.GetExternalVsite($scope, customer_name);
                
                    $timeout(function() { 
                        MSMService.InitExternalVsite($scope, customer_name, data);
                        $rootScope.currentState = 3;
                        $rootScope.external_site = data;
                    }, AppConfig.environment === 'development' ? 500 : 3000);

                    $uibModalInstance.close();  
                }
                
            }
            else{
                console.log("Invalid");
                
            }
        }
        
        $scope.submitConnectSiteForm = function(param){
            
            if($scope.isDup)
            {
                return;
            }
            if ($scope.connectSiteForm.$valid) {
                $rootScope.notification = "Connecting Sites..."
                var arr = [];
                
                for(var i=0;i<$scope.sites.length;i++)
                {
                    var obj = {'site_name':$scope.sites[i].CloudSiteField1,
                             'subnet':$scope.sites[i].CloudSubnetField1,
                             'connect_to':$scope.sites[i].exSiteName1,
                             'ip_range':$scope.sites[i].exSiteIpRange1};
                         arr.push(obj);
                         
                }
                var data = arr;
                var customer_name = StorageService.GetCustomer().customer_name;
                $rootScope.connection = angular.copy(data);
                angular.forEach(data, function(items, index){
                    items.connect_to = "00000";
                });
                MSMService.AssociateRoutes($scope, customer_name, angular.copy(data));
                
				$uibModalInstance.close();
                
            }
            else{
                alert("not submitted");
            }
        }    
        
        $scope.submitAddVMsForm = function(param){
            var excessVm = false;
            angular.forEach($scope.VMs, function(value, site_name) {
                if (value){
                    angular.forEach(value, function(vm, index){
                        try{
                            if (vm.excessVm){
                                excessVm = true;
                                return false;
                            }    
                        }
                        catch(e){
                            //e
                        }
                    });
                }   
            });
            
            //console.log("excessVm", excessVm);
            
            if ($scope.addVMsForm.$valid && excessVm == false) {
                var customer_name = StorageService.Get("customer").customer_name;
                var node_details = StorageService.Get("node_details");
                var total_vmData = {};
                angular.forEach(node_details, function(site, index){
                    if(site.VM){
                        total_vmData[site.site_name] = site.VM.length;
                    }
                    else {
                        total_vmData[site.site_name] = 0;
                    }
                });
                
                var VMs = [];
                angular.forEach($scope.VMs, function(value, site_name) {
                    var middle_name = (site_name == 'PaloAlto') ? '_PA_VM_' : '_FF_VM_';
                    if (value){
                        angular.forEach(value, function(vm, index){
                            var address = [];
                            if (vm.backboneRef){
                                var dict = {"fixedIP": {"subnetUuid": vm.backboneRef,
                                                        "autoGenerate": true}};
                                if (AppConfig.environment === 'development'){
                                    dict.fixedIP["ip"]  =  "11.1.2.6";
                                }
                                address.push(dict);            
                            }
                            
                            if (vm.floatingipRef){
                                var dict = {"fixedIP": {"subnetUuid": vm.floatingipRef,
                                                        "autoGenerate": true},
                                            "floatingIP": {"autoGenerate": true,
                                                           "quota": vm.floatingipQuotaRef ? parseInt(vm.floatingipQuotaRef, 10) : 0}};
                                if (AppConfig.environment === 'development'){
                                    dict.fixedIP["ip"]  =  "11.1.2.10";
                                    dict.floatingIP["ip"]  =  "10.10.12.20";
                                }
                                address.push(dict);
                            }
                            
                            if (vm.internal_resourcesRef || $scope.IR_mandatory){
                                var dict = {"fixedIP": {"subnetUuid": vm.internal_resourcesRef ? vm.internal_resourcesRef : vm.networks.internal_resources,
                                                         "autoGenerate": true}};
                                if (AppConfig.environment === 'development'){
                                    dict.fixedIP["ip"]  =  "11.10.11.10";
                                }
                                address.push(dict);
                            }
                            
                            for (var i=0; i < vm.number.trim(); i++) {
                                var obj = {'name': customer_name + middle_name + (total_vmData[site_name] + i + 1),
                                           'imageRef': vm.imageRef,
                                           'flavorRef': vm.flavorRef,
                                           'addresses' : address,
                                           'srId': (vm.srId != '') ? vm.srId : ''};
                                VMs.push(angular.copy(obj));
                            }
                            total_vmData[site_name] += (vm.srId != '') ? 0 : parseInt(vm.number.trim(), 10);
                        });
                    }   
                });
                
                var valid = true;
                angular.forEach(total_vmData, function(total_vm, site_name) {
                    if (total_vm > StorageService.Get("customer").max_sites_vms){
                        valid = false;
                        return false;
                    }
                });   
                
                if (valid){
                    angular.forEach(VMs, function(value, index){
                        if (!value.srId){
                            disableMouseEvents();
                            $rootScope.notification = "Creating VMs..."
                            /*
                            if (value.name.includes('PA_VM')){
                                MSMService.CreateVM($scope, customer_name, "PaloAlto", angular.copy(value));
                                $rootScope.vm = angular.copy(value);
                            }
                            else{
                                MSMService.CreateVM($scope, customer_name, "Frankfurt", angular.copy(value));
                                $rootScope.vm = angular.copy(value);
                            }
                            */
                            $timeout(function() {
                                if (value.name.includes('PA_VM')){
                                    MSMService.CreateVM($scope, customer_name, "PaloAlto", angular.copy(value));
                                    $rootScope.vm = angular.copy(value);
                                }
                                else{
                                    MSMService.CreateVM($scope, customer_name, "Frankfurt", angular.copy(value));
                                    $rootScope.vm = angular.copy(value);
                                }
                            }, AppConfig.environment === 'development' ? index * 500 : index * 500);
                            
                            //}, AppConfig.environment === 'development' ? index * 2000 : index == 0 ? index * 15000 : 15000);
                        }    
                    });
                    
                    $scope.checkVM = $interval(function() {
                        var node_details = StorageService.Get("node_details");
                        var savedVMs = [];
                        angular.forEach(node_details, function(site, index){
                            if (site.type == 'openstack_site' && site.VM){
                                savedVMs = savedVMs.concat(site.VM);
                            }
                        });
                        if (savedVMs.length == VMs.length) {
                            $rootScope.notification = "";
                            enableMouseEvents();
                            $interval.cancel($scope.checkVM);
                        }
                    }, AppConfig.environment === 'development' ? 1000 : 5000);
                }
                
                $uibModalInstance.close();
                
            }
        }    
        
        $scope.CloseClipCancelReportDiag = function(){
            $uibModalInstance.dismiss('Canceled');
        }
	};
    customDialogController.$inject = injectParams;
    app.controller('customController', customDialogController);
});
