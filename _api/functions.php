<?php
class Constants
{
    const mySql_host = "localhost:3036";
    const mySql_user = "isitcool";
    const mySql_key = "?4n2+A@-X:PyKp`Q>Gs}nf*6";
    const mySql_dbname = 'isitcool';
}

function cleanInput($input/*String*/){
    $input = strtolower($input);
    return trim($input);
}

function getWordFromURL(){
    if (isset($_GET['q'])) {
        $param_q = (string)$_GET['q'];
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
    return intval($retVal);
}

function tryInsertWordIntoDb_default($word, $coolness){
    $shouldInsert = false;

    $conn = mysql_connect(Constants::mySql_host, Constants::mySql_user, Constants::mySql_key);
    if( !$conn ){
        die('Could not connect: ' . mysql_error());
    }
    mysql_select_db(Constants::mySql_dbname, $conn);
    $sql = "SELECT value FROM words WHERE word = '".$word."'";
    $sqlReturn = mysql_query($sql, $conn);
    if( !$sqlReturn ){
        die('Could not get data: ' . mysql_error());
    }
    else if( !($row = mysql_fetch_array($sqlReturn, MYSQL_ASSOC)) ){
        $shouldInsert = true;
    }

    if($shouldInsert){
        $sql = "INSERT INTO words (word, value, value_default, upvotes, downvotes) VALUES ('".$word."', '".$coolness."', '".$coolness."', '0', '0')";
        $retval = mysql_query( $sql, $conn );
        if(! $retval ){
            die('Could not enter data: ' . mysql_error());
        }
    }

    mysql_close($conn);
}

function getCoolnessForWord($word){
    $coolness = -1;

    $conn = mysql_connect(Constants::mySql_host, Constants::mySql_user, Constants::mySql_key);
    if( !$conn ){
        die('Could not connect: ' . mysql_error());
    }
    mysql_select_db(Constants::mySql_dbname, $conn);
    $sql = "SELECT value FROM words WHERE word = '".$word."'";
    $sqlReturn = mysql_query($sql, $conn);
    if( !$sqlReturn ){
        die('Could not get data: ' . mysql_error());
    }
    else if( $row = mysql_fetch_array($sqlReturn, MYSQL_ASSOC) ){
        $coolness = intval($row['value']);
    }

    mysql_close($conn);

    if($coolness==-1){
        $coolness = generateCoolnessForWord($word);
        tryInsertWordIntoDb_default($word, $coolness);
    }

    return $coolness;
}
?>
