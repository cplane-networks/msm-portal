'use strict';

define(['app'], function (app){
    var injectParams = ['$scope', '$state', '$rootScope','$uibModalInstance', 'dialogs' ];
    var cloudController = function ($scope, $state, $rootScope,$uibModalInstance, dialogs){
        var _dialog_path  = "content/js/apps/templates/";

        var isError = false;
        var cloudObj = {};

        $scope.CloseClipCancelReportDiag = function()
        {
            $uibModalInstance.dismiss('Canceled');
         }

        $scope.submitForm = function(userForm) {

           /* if ($scope.userForm.$valid) {
                isError = false;


                if(!isError)
                {
                    // submit the data
                    cloudObj.site = $scope.cloud.site;
                    cloudObj.asNum =  $scope.cloud.asNum;
                    cloudObj.ip =  $scope.cloud.ip;
                    cloudObj.gip =  $scope.cloud.gip;


                    $uibModalInstance.close(cloudObj);
                }
            }*/

        };
    };
    cloudController.$inject = injectParams;
    app.controller('cloudController', cloudController);
});
