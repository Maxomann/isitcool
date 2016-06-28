<?php
    function checkOrigin(){
        $request_headers        = apache_request_headers();
        $http_origin            = $request_headers['Origin'];
        $allowed_http_origins   = array(
                                    "http://isitcool.net"   ,
                                    "http://www.isitcool.net"  ,
                                    "http://localhost:4000"  ,
                                  );
        if (in_array($http_origin, $allowed_http_origins)){
            @header("Access-Control-Allow-Origin: " . $http_origin);
        }
    }

    /*returns true if NOT spam*/
    function spamcheck($ip){
        $timestamp = $_SERVER['REQUEST_TIME'];

        return true;
    }
?>
