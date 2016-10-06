'use strict';

define(['app'], function (app) {

    var injectParams = ['localStorageService', '$rootScope', 'GraphService'];

    var storageServiceFactory = function (localStorageService, $rootScope, GraphService) {
        
        var storageFactory = {};
        var storageType = "";
        var storage = null;
        
        // Helper method
        var check_exist = function(storageKey, obj){
            var exist = -1;
            var site_details = storage.get(storageKey);
            $.each(site_details, function(index, siteObj){
                if (angular.equals(siteObj, obj)){
                    exist = index;
                    return false;
                }
            });
            return exist;
        }
        
        // Init method
        storageFactory.Init = function () {
            storage = localStorageService;
            if (!localStorageService.isSupported && localStorageService.cookie.isSupported) {
                storageType = 'Cookie';
                storage = localStorageService.cookie;
            } else if (localStorageService.getStorageType().indexOf('session') >= 0) {
                storageType = 'SessionStorage';
            } else {
                storageType = 'LocalStore';
            }
        };
        
        storageFactory.Get = function(storage_name){
            storageFactory.Init();
            return storage.get(storage_name);
        }
        
        // Clean up method
        storageFactory.RemoveAll = function () {
            storageFactory.Init();
            storage.clearAll();
            return true;
        };
        
        storageFactory.AddCustomer = function (data) {
            storageFactory.Init();
            if (check_exist("customer", data) === -1){
                storage.set("customer", data);
                $rootScope.$broadcast("OnStorageAddCustomer");
            }
        };
        
        storageFactory.GetCustomer = function () {
            storageFactory.Init();
            try{
                return storage.get("customer");
            }
            catch(e){
                console.log(e)
                return false;
            }
        };
        
        storageFactory.RemoveCustomer = function () {
            storageFactory.Init();
            storage.remove("customer");
            $rootScope.$broadcast("OnStorageRemoveCustomer");
        };
        
        storageFactory.AddSite = function (data) {
            /* data = {'site_name': <string>,
                       'defaultSubnet': <string>,
                       'type': 'openstack_site',
                       'status' : 'inactive',
                       'cpe': [{"cpeSegmentationType" : <string>,
                                "cpeSegmentationId" : <string>,
                                "cpeIpAddr" : <string>,
                                "cpeMask" : <string>,
                                "cpeASN" : <string>,
                                "peerIP" : <string>,
                                "peerASN" : <string>}]}
            */
            storageFactory.Init();
            var site_details = storage.get("node_details");
            if (site_details == null || (site_details && site_details instanceof Array && !site_details.length)){
                storage.set("node_details", [data]);
            }
            else {
                if (check_exist("node_details", data) == -1){
                    site_details.push(data);
                    storage.set("node_details", site_details);
                }
            }
            
            $rootScope.$broadcast("OnStorageAddSite", data.site_name);
        };
        
        storageFactory.GetSite = function (site_name) {
            storageFactory.Init();
            try{
                var site_details = storage.get("node_details");
                return $.map(site_details, function(val) {
                    if( val.site_name.toLowerCase() == site_name.toLowerCase() ) return { site_data : val, site_level : site_details.indexOf(val) };
                })[0];
            }    
            catch(e){
                console.log(e)
                return false;    
            }    
        };
        
        storageFactory.RemoveSite = function (site_name) {
            storageFactory.Init();
            var node_details = storage.get("node_details");
            var site_details = storageFactory.GetSite(site_name);
            var index = check_exist("node_details", site_details.site_data);
            
            if (index != -1){
                node_details.splice(index, 1);
                storage.set("node_details", node_details);
            }
            
            $rootScope.$broadcast("OnStorageRemoveSite");
        };
        
        storageFactory.AddOrUpdateSubKey = function(storage_name, existing_data, key, value){
            storageFactory.Init();
            var details = storage.get(storage_name);
            var index = check_exist(storage_name, existing_data);
            if (index != -1){
                details[index][key] = value;
                storage.set(storage_name, details);
            }
            
            return true;
        }
        
        storageFactory.GetSubKey = function(storage_name, existing_data, key){
            storageFactory.Init();
            var details = storage.get(storage_name);
            var index = check_exist(storage_name, existing_data);
            return details[index][key];
        }
        
        storageFactory.RemoveSubKey = function(storage_name, existing_data, key){
            storageFactory.Init();
            var details = storage.get(storage_name);
            var index = check_exist(storage_name, existing_data);
            
            if (index != -1){
                delete(details[index][key]);
                storage.set(storage_name, details);
            }
            
            return true;
        }
        
        storageFactory.AddOrUpdateVM = function(site_name, data){
            storageFactory.Init();
            var site_details = storageFactory.GetSite(site_name);
            var vm_data = [];
            
            if("VM" in site_details.site_data){
                vm_data = angular.copy(site_details.site_data.VM);
            }
            
            vm_data.push(data);
            storageFactory.AddOrUpdateSubKey("node_details", site_details.site_data, "VM", vm_data);
            $rootScope.$broadcast("OnStorageAddVM", site_name, data);
        }
        
        storageFactory.GetVM = function(site_name, vm_srId, vm_name){
            storageFactory.Init();
            try{
                var site_details = storageFactory.GetSite(site_name);
                var vm_details = storageFactory.GetSubKey("node_details", site_details.site_data, "VM");
                return $.map(vm_details, function(val) {
                    if (vm_srId){
                        if( val.srId == vm_srId ) return { vm_data : val, vm_level : vm_details.indexOf(val) };
                    }
                    else{    
                        if( val.name.toLowerCase() == vm_name.toLowerCase() ) return { vm_data : val, vm_level : vm_details.indexOf(val) };
                    }    
                })[0];
            }    
            catch(e){
                console.log(e)
                return false;    
            }    
        }
        
        storageFactory.RemoveVM = function(site_name, vm_srId, vm_name){
            storageFactory.Init();
            var site_details = storageFactory.GetSite(site_name);
            var vm_data = storageFactory.GetSubKey("node_details", site_details.site_data, "VM");    
            var vm_details = storageFactory.GetVM(site_name, vm_srId, vm_name).vm_data;
            var exist = -1;
            $.each(vm_data, function(index, vmObj){
                if (angular.equals(vmObj, vm_details)){
                    exist = index;
                    return false;
                }
            });
            vm_data.splice(exist, 1);
            storageFactory.AddOrUpdateSubKey("node_details", site_details.site_data, "VM", vm_data);
            $rootScope.$broadcast("OnStorageRemoveVM", site_name, vm_srId);
        }
        
        storageFactory.AddOrUpdateConnections = function(data){
            storageFactory.Init();
            var connection_details = storage.get("connections");
            if(!connection_details){
                connection_details = [];
            }    
            
            if(data.constructor !== Array){
                data = [data];
            }
            
            connection_details = connection_details.concat(data);
            storage.set("connections", connection_details);
            $rootScope.$broadcast("OnStorageAddConnections", data);
        }
        
        storageFactory.GetConnections = function(data){
            storageFactory.Init();
            if (!data){
                return storage.get("connections");
            }
            else{
                try{
                    var connection_details = storage.get("connections");
                    return $.map(connection_details, function(val) {
                        if( angular.equals(val, data) ) return { connection_data : val, connection_level : connection_details.indexOf(val) };
                    })[0];
                }    
                catch(e){
                    console.log(e)
                    return false;    
                }    
            }    
        }
        
        storageFactory.RemoveConnections = function(){
            storageFactory.Init();
            storage.remove("connections");
            $rootScope.$broadcast("OnStorageRemoveConnections");
        }
        
        storageFactory.GetNode = function(site_name, node_type){
            // site_name = <string>, node_type = <string> e,g 'site_node'
            storageFactory.Init();
            var site_details = storageFactory.GetSite(site_name);
            var node_data = storageFactory.GetSubKey("node_details", site_details.site_data, node_type);
            var graph_elements = GraphService.graph.getElements();
            for (var i = 0; i < graph_elements.length; i++){
                var node_element_data = graph_elements[i].toJSON();
                if (node_data.id === node_element_data.id){
                    return graph_elements[i];
                }
            }
        }
        
        storageFactory.RemoveNode = function(site_name){
            storageFactory.Init();
            var node_details = storage.get("node_details");
            var site_details = storageFactory.GetSite(site_name).site_data;
            var exist = -1;
            $.each(node_details, function(index, siteObj){
                if (angular.equals(siteObj, site_details)){
                    exist = index;
                    return false;
                }
            });
            
            node_details.splice(exist, 1);
            storage.set("node_details", node_details);
            $rootScope.$broadcast("OnStorageRemoveNode", site_name);
        }
        
        return storageFactory;
    };
    
    storageServiceFactory.$inject = injectParams;

    app.factory('StorageService', storageServiceFactory).config(['localStorageServiceProvider', function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setNotify(true, true);
    }]);
    
});