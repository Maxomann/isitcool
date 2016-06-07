<?php
header('Access-Control-Allow-Origin: http://isitcool.net');
header('Access-Control-Allow-Origin: http://localhost:4000');
session_start();

include 'functions.php';

$action = $_REQUEST['action'];
/*getVoteState, vote*/


if(!isset($result)){
    $result = array(
        'status' => 'error'
    );
}
echo json_encode($result);

?>
