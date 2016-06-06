<?php
header('Access-Control-Allow-Origin: http://isitcool.net');
header('Access-Control-Allow-Origin: http://localhost:4000');

include 'functions.php';
$word = getWordFromURL();

if( $word != "" ){
    $coolness = getCoolnessForWord($word);

    $result = array(
        'status' => 'success',
        'word' => $word,
        'coolness' => $coolness
    );
}else {
    $result = array(
        'status' => 'error'
    );
}

echo json_encode($result);
?>
