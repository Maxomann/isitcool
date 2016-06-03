<?php
class Constants
{
    const mySql_host = "localhost:3036";
    const mySql_user = "isitcool";
    const mySql_key = "?4n2+A@-X:PyKp`Q>Gs}nf*6";
}

function cleanInput($input/*String*/){
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

function getCoolnessForWord($word){
    $coolness = -1;

    $conn = mysql_connect(Constants::mySql_host, Constants::mySql_user, Constants::mySql_key);
    if( !$conn ){
        die('Could not connect: ' . mysql_error());
    }
    mysql_select_db()
    $sql = "SELECT value FROM words WHERE word = " + word;
    print_r($conn);
    $sqlResult = $conn->query($sql);
    if ($sqlResult->num_rows > 0){
        if($sqlResult->num_rows > 1){
            die("more than one result");
        }
        $row = $sqlResult->fetch_assoc();
        $coolness = $row["value"];
    }
    mysql_close($conn);

    if($coolness==-1){
        $coolness = generateCoolnessForWord($word);
    }

    return $coolness;
}
?>
