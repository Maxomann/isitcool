<?php
header('Access-Control-Allow-Origin: http://isitcool.net');
header('Access-Control-Allow-Origin: http://localhost:4000');

include 'vote_functions.php';

$action = $_REQUEST['action'];
/*requestId, getVoteState, vote*/

$ip = getAnonymousIp();

if( $action == 'requestId' ){
    $returnId = lookupIdForIp($ip);
    if($returnId==false){
        $returnId = generateId();
        linkIpToId($returnId, $ip);
    }

    $result = array(
        'status' => 'success',
        'id' => (string)$returnId
    );
}else if( $action == 'getVoteState' ){

}else if( $action == 'vote' ){

}

if(!isset($result)){
    $result = array(
        'status' => 'error'
    );
}
echo json_encode($result);

?>
