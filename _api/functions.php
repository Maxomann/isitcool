<?php
include_once 'secretConstants.php';
include_once 'vote_functions.php';

function cleanInput($input/*String*/){
    $input = mb_strimwidth($input, 0, 100);
    $input = filter_var($input, FILTER_SANITIZE_STRING);
    $input = strtolower($input);
    return trim($input);
}

function getWordFromURL(){
    if (isset($_REQUEST['q'])) {
        $param_q = (string)$_REQUEST['q'];
        return cleanInput($param_q);
    }else{
        return "";
    }
}

function generateCoolnessForWord($word){
    $hash = crc32((string)hash('fnv132', $word));
    if($hash<0){
        $hash*=-1;
    }
    $as_string = (string)$hash;
    $length = strlen($as_string);
    $retVal = substr($as_string, $length-2, $length);

    $as_int = intval($retVal);
    while( $as_int < 30 ){
        $as_int += 10;
    }
    while( $as_int > 70 ){
        $as_int -= 10;
    }
    return $as_int;
}

function doesWordExistInWordlist($word){
    $retVal = true;

    $conn = new mysqli( Constants::mySql_host,
                        Constants::mySql_user,
                        Constants::mySql_key,
                        Constants::mySql_dbname
                    );
    if( $mysqli->connect_errno ){
        die('Could not connect: ' . $mysqli->connect_errno);
    }
    $stmt = $conn->prepare("SELECT value FROM words WHERE word = ?");
    $stmt->bind_param("s", $word);
    $stmt->bind_result($sqlRetValue);

    $stmt->execute();
    $stmt->store_result();

    if( $stmt->error ){
        die('Could not get data: ' . $stmt->error);
    }
    else if( $stmt->num_rows<1 ){
        $retVal=false;
    }
    $stmt->free_result();
    $stmt->close();
    $conn->close();

    return $retVal;
}

function tryInsertWordIntoDb_default($word, $coolness){
    if(!doesWordExistInWordlist($word)){
        $conn = new mysqli( Constants::mySql_host,
                            Constants::mySql_user,
                            Constants::mySql_key,
                            Constants::mySql_dbname
                        );

        $randUp = rand(3, 15);
        $randDown = rand(3, 15);

        $stmt = $conn->prepare( "INSERT INTO words (word, value, value_default, upvotes, downvotes) VALUES ( ?, ?, ?, ?, ?)" );
        $stmt->bind_param("siiii", $word, $coolness, $coolness, $randUp, $randDown);
        $stmt->execute();
        if( $stmt->error ){
            die('Could not enter data: ' . mysql_error());
        }

        $stmt->close();
        $conn->close();

        return recalculateCoolnessForWord($word);
    }
    return false;
}

function getCoolnessForWord($word){
    $coolness = -1;

    $conn = new mysqli( Constants::mySql_host,
                        Constants::mySql_user,
                        Constants::mySql_key,
                        Constants::mySql_dbname
                    );
    if( $mysqli->connect_errno ){
        die('Could not connect: ' . $mysqli->connect_errno);
    }
    $stmt = $conn->prepare("SELECT value FROM words WHERE word = ?");
    $stmt->bind_param("s", $word);
    $stmt->bind_result($sqlRetValue);

    $stmt->execute();
    $stmt->store_result();

    if( $stmt->error ){
        die('Could not get data: ' . $stmt->error);
    }
    else if( $stmt->fetch() ){
        $coolness = intval($sqlRetValue);
    }

    $stmt->free_result();
    $stmt->close();
    $conn->close();

    if($coolness==-1){
        $coolness = generateCoolnessForWord($word);//important for call of tryInsertWordIntoDb_default
        $coolness = tryInsertWordIntoDb_default($word, $coolness);
    }

    return $coolness;
}
?>
