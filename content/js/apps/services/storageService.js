'use strict';

define(['app'], function (app) {

    var injectParams = ['localStorageService', '$rootScope'];

    var storageServiceFactory = function (localStorageService, $rootScope) {
        
        var storageFactory = {};
        var storageType = "";
        var storage = null;
        
        // Helper method
        var check_exist = function(storageKey, obj){
            var exist = -1;
            var site_details = storage.get(storageKey);
            $.each(site_details, function(index, siteObj){
                $.each(obj, function(key, value){
                    if (angular.equals(siteObj[key], value)){
                        exist = index;
                    }
                    else {
                        exist = -1;
                    }
                })
                if (exist > -1)
                    return false;
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
            return storage.get("customer");
        };
        
        storageFactory.RemoveCustomer = function () {
            storageFactory.Init();
            storage.remove("customer");
            $rootScope.$broadcast("OnStorageRemoveCustomer");
        };
        
        storageFactory.AddSite = function (data) {
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
            var site_details = storage.get("node_details");
            
            return $.map(site_details, function(val) {
                if( val.site.toLowerCase() == site_name.toLowerCase() ) return val;
            })[0];
        };
        
        storageFactory.RemoveSite = function (site_name) {
            storageFactory.Init();
            var site_details = storage.get("node_details");
            var site_data = storageFactory.GetSite(site_name);
            var index = check_exist("node_details", site_data);
            
            if (index != -1){
                site_details.splice(index, 1);
                storage.set("node_details", site_details);
            }
            
            $rootScope.$broadcast("OnStorageRemoveCustomer");
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
            var site_data = storageFactory.GetSite(site_name);
            storageFactory.AddOrUpdateSubKey("node_details", site_data, "VM", data);
            $rootScope.$broadcast("OnStorageAddVM");
        }
        
        storageFactory.GetVM = function(site_name){
            var site_data = storageFactory.GetSite(site_name);
            storageFactory.GetSubKey("node_details", site_data, "VM");
            return true;
        }
        
        storageFactory.RemoveVM = function(site_name){
            var site_data = storageFactory.GetSite(site_name);
            storageFactory.RemoveSubKey("node_details", site_data, "VM");    
            $rootScope.$broadcast("OnStorageRemoveVM");
        }
        
        storageFactory.AddOrUpdateConnections = function(data){
            storageFactory.Init();
            storage.set("connections", data);
            $rootScope.$broadcast("OnStorageAddConnections");
        }
        
        storageFactory.GetConnections = function(site_name){
            return storage.get("connections");
        }
        
        storageFactory.RemoveConnections = function(site_name){
            storageFactory.Init();
            storage.remove("connections");
            $rootScope.$broadcast("OnStorageRemoveConnections");
        }
        
        return storageFactory;
    };
    
    storageServiceFactory.$inject = injectParams;

    app.factory('StorageService', storageServiceFactory).config(['localStorageServiceProvider', function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setNotify(true, true);
    }]);
    
});