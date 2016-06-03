<?php
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
