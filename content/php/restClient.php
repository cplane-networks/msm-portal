<?php

/**
 * PHP REST Client to avoid CORS issue.
 * @example This acts a controller for XHR request through cURL, All AJAX call URL (GET,POST,PUT & DELETE) should pass the url and any data needs to be sent.
 */

######################################################################
#   This acts a controller for XHR request through cURL
#   Read ajaxData and process as per the request_url and request_method
######################################################################

$ajaxData = isset($_POST) ? json_decode(file_get_contents("php://input"), true) : "";

$method = $ajaxData["method"];
$ajaxReqURL = $ajaxData["ajaxReqURL"];
$requestData = $ajaxData["requestData"];
//echo gettype($requestData);
//print_r($requestData);
switch ($method) {
    case 'POST':
        $service_url = $ajaxReqURL;
        $curl = curl_init();
        $curl_post_data = $requestData;
        curl_setopt($curl, CURLOPT_URL, $service_url);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $curl_post_data);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8',));
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        $curl_response = curl_exec($curl);
        echo $curl_response;
        break;
    case 'GET':
        $service_url = $ajaxReqURL;
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $service_url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8',));
        $curl_response = curl_exec($curl);
        echo $curl_response;
        break;
    case 'PUT':
        $service_url = $ajaxReqURL;
        $curl = curl_init();
        $curl_post_data = $requestData;
        curl_setopt($curl, CURLOPT_URL, $service_url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "PUT");
        curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8',));
        curl_setopt($curl, CURLOPT_POSTFIELDS, $curl_post_data);
        $response = curl_exec($curl);
        echo $response;
        break;
    case 'DELETE':
        $service_url = $ajaxReqURL;
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $service_url);
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8',));
        curl_setopt($curl, CURLOPT_POSTFIELDS, '{}');
        $response = curl_exec($curl);
        echo $response;
        break;
    default:
        $message = "[method : " . $method . "]  No case found for this \"$method\" at ajax.php";
        echo $message;
        break;
}

######################################################################
#   End of XHR request process controller through cURL
######################################################################
?>