'use strict';

define(['app'], function (app) {
    app.constant("AppConfig", {
        "localUrl": "content/js/apps/local_data/",
        //"serviceUrl": "http://<server_address>/msm/v1.0/",
        "port": "80",
        "templatePath": "content/js/apps/templates/",
        "defaultIconPath": "content/images/default/",
        "environment": "development"
    })
});