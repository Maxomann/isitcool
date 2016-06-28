<?php
include_once 'functions.php';
include_once 'spam_protection.php';
checkOrigin();

$word = getWordFromURL();

if( $word != "" ){
    $coolness = getCoolnessForWord($word);

    $result = array(
        'status' => 'success',
        'word' => $word,
        'coolness' => $coolness
    );
}

if(!isset($result)){
    $result = array(
        'status' => 'error'
    );
}
echo json_encode($result);
?>
