'use strict';

define(['app'], function (app) {
    app.constant("AppConfig", {
        "serviceUrl": "http://192.168.225.21:8080/msm/v1.0/",
        "redirectUrl": "content/php/restClient.php",
        "localUrl": "content/js/apps/local_data/",
        "templatePath": "content/js/apps/templates/",
        "defaultIconPath": "content/images/default/",
        "SVGIconPath": "content/images/svg_image/",
		"environment": "production", /*"production", "redirection", "development"*/
		"vm_polling": "off", /*"on", "off"*/
    })
});