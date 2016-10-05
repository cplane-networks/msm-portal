require.config({
    baseUrl: 'content/js/apps/',
    urlArgs: 'v=1.0'
});

require(
        [
            'app',
            'config/appconfig',
            //Utility
            'utility/routes',
            //Services
            'services/initService',
            'services/storageService',
            'services/msmService',
            'services/graphService',
            'services/queueService',
            //Controller
            'controllers/customController',
            'controllers/baseController',
            //'directives/addUser',
        ],
        function (app) {
            app.init();
        });