<?php
header('Access-Control-Allow-Origin: http://isitcool.net');
header('Access-Control-Allow-Origin: http://localhost:4000');
session_start();

include 'functions.php';

$action = $_REQUEST['action'];

if($action == 'getLoginState'){
    $result = array(
        'status' => 'success',
        'loginState' => getLoginState()
    );
}else if($action == 'login'){
    if(isset($_REQUEST['idtoken'])){
        $idToken = $_REQUEST['idtoken'];
        if( login($idToken) ){
            $result = array(
                'status' => 'success',
                'loginState' => getLoginState()
            );
        }
    }
}else if($action == 'logout'){
    logout();
    $result = array(
        'status' => 'success',
        'loginState' => getLoginState()
    );
}

if(!isset($result)){
    $result = array(
        'status' => 'error'
    );
}
echo json_encode($result);
?>
