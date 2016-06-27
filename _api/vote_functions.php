<?php
    include_once 'secretConstants.php';

    abstract class VoteStates
    {
        const NONE = 'none';
        const DOWN = 'down';
        const UP = 'up';
    }


    function getAnonymousIp(){
        return md5($_SERVER['REMOTE_ADDR']);
    }

    function generateId(){
        return md5(uniqid());
    }

    /*returns voteState as string or false*/
    function getVoteState($id, $word){
        $voteState=VoteStates::NONE;

        $conn = new mysqli( Constants::mySql_host,
                            Constants::mySql_user,
                            Constants::mySql_key,
                            Constants::mySql_dbname
                        );
        if( $mysqli->connect_errno ){
            die('Could not connect: ' . $mysqli->connect_errno);
        }
        $stmt = $conn->prepare("SELECT opinion FROM votes WHERE word = ? AND id = ?");
        $stmt->bind_param("ss", $word, $id);
        $stmt->bind_result($sqlRetValue);

        $stmt->execute();
        $stmt->store_result();

        if( $stmt->error ){
            die('Could not get data: ' . $stmt->error);
        }
        else if( $stmt->fetch() ){
            $voteState = $sqlRetValue;
        }

        $stmt->free_result();
        $stmt->close();
        $conn->close();

        return $voteState;
    }

    /*returns voteState or false*/
    function vote($id, $word, $voteState){
        recalculateCoolnessForWord($word);
        return false;
    }

    function recalculateCoolnessForWord($word){

    }


?>
