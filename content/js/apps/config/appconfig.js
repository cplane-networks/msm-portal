'use strict';

define(['app'], function (app) {
    app.constant("AppConfig", {
        "serviceUrl": "http://192.168.225.21:8080/msm/v1.1/",
        //"serviceUrl": "http://52.24.253.232:8080/msm/v1.1/",
        "redirectUrl": "content/php/restClient.php",
        "localUrl": "content/js/apps/local_data/",
        "templatePath": "content/js/apps/templates/",
        "defaultIconPath": "content/images/default/",
        "SVGIconPath": "content/images/svg_image/",
		"environment": "production", /*"production", "redirection", "development"*/
		"vm_polling": "off", /*"on", "off"*/
        "zoom_step" : 1,
        "max_zoom" : 150,
        "min_zoom" : 40,
        "default_zoom" : 100,
        "subnet_mandatory" : "true", /*"true", "false"*/
        "internal_resource_mandatory" : "true" /*"true", "false"*/
    })
});
