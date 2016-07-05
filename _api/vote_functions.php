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

    /*returns voteState*/
    function vote($id, $word, $voteState){
        if($voteState!=VoteStates::DOWN && $voteState!=VoteStates::UP){
            die("invalid input for VoteState");
        }
        if(strlen($id)!=32){
            die("invalid input for id");
        }
        getCoolnessForWord($word);//ensure word to be found in database
        $previousVoteState=getVoteState($id, $word);

        $conn = new mysqli( Constants::mySql_host,
                            Constants::mySql_user,
                            Constants::mySql_key,
                            Constants::mySql_dbname
                        );
        if( $mysqli->connect_errno ){
            die('Could not connect: ' . $mysqli->connect_errno);
        }

        if($previousVoteState!=VoteStates::NONE){
            //remove old vote
            $stmt = $conn->prepare("DELETE FROM votes WHERE word = ? AND id = ?");
            $stmt->bind_param("ss", $word, $id);
            $stmt->execute();
            if( $stmt->error ){
                die('Could not remove data: ' . $stmt->error);
            }
            $stmt->close();

            if($previousVoteState == VoteStates::UP){
                $countToSubtractFrom = "upvotes";
            }else if($previousVoteState==VoteStates::DOWN){
                $countToSubtractFrom = "downvotes";
            }else{
                die("Something is terribly wrong here");
            }

            $previousCount = 0;

            $stmt = $conn->prepare("SELECT ".$countToSubtractFrom." FROM words WHERE word = ?");
            $stmt->bind_param("s", $word);
            $stmt->bind_result($previousCount);
            $stmt->execute();
            $stmt->fetch();
            if( $stmt->error ){
                die('Could not get data: ' . $stmt->error);
            }
            $stmt->free_result();
            $stmt->close();

            //set new count
            $newCount = $previousCount-1;

            $stmt = $conn->prepare("UPDATE words SET ".$countToSubtractFrom." = ? WHERE word = ?");
            $stmt->bind_param("ss", $newCount, $word);
            $stmt->execute();
            $stmt->close();
        }

        $previousCount = 0;
        if( $voteState == VoteStates::UP){
            $countToAddTo="upvotes";
        }else if($voteState == VoteStates::DOWN){
            $countToAddTo="downvotes";
        }else{
            die("Something is terribly wrong here2");
        }

        $stmt = $conn->prepare("SELECT ".$countToAddTo." FROM words WHERE word = ?");
        $stmt->bind_param("s", $word);
        $stmt->bind_result($previousCount);
        $stmt->execute();
        $stmt->fetch();
        if( $stmt->error ){
            die('Could not get data: ' . $stmt->error);
        }
        $stmt->free_result();
        $stmt->close();

        $newCount = $previousCount+1;

        $stmt = $conn->prepare("UPDATE words SET ".$countToAddTo." = ? WHERE word = ?");
        $stmt->bind_param("ss", $newCount, $word);
        $stmt->execute();
        $stmt->close();

        $stmt = $conn->prepare( "INSERT INTO votes (word, id, opinion) VALUES ( ?, ?, ? )" );
        $stmt->bind_param("sss", $word, $id, $voteState);
        $stmt->execute();
        $stmt->close();

        $conn->close();
        recalculateCoolnessForWord($word);
        return $voteState;
    }

    function recalculateCoolnessForWord($word){
        $upvotes = -1;
        $downvotes = -1;

        $conn = new mysqli( Constants::mySql_host,
                            Constants::mySql_user,
                            Constants::mySql_key,
                            Constants::mySql_dbname
                        );
        if( $mysqli->connect_errno ){
            die('Could not connect: ' . $mysqli->connect_errno);
        }
        $stmt = $conn->prepare("SELECT upvotes FROM words WHERE word = ?");
        $stmt->bind_param("s", $word);
        $stmt->bind_result($upvotes);
        $stmt->execute();
        $stmt->fetch();
        $stmt->free_result();
        $stmt->close();
        $stmt = $conn->prepare("SELECT downvotes FROM words WHERE word = ?");
        $stmt->bind_param("s", $word);
        $stmt->bind_result($downvotes);
        $stmt->execute();
        $stmt->fetch();
        $stmt->free_result();
        $stmt->close();

        $votesTotal = $upvotes + $downvotes;
        if( $votesTotal <=0 ){
            print_r($votesTotal);
            die("votesTotal is smaller than 0");
        }
        $votesNormal = $upvotes - $downvotes;

        $normalizedResult = bcdiv($votesNormal, $votesTotal, 6);
        $coolnessResult = round($normalizedResult*50);
        $coolnessResult+=50;

        $stmt = $conn->prepare("UPDATE words SET value = ? WHERE word = ?");
        $stmt->bind_param("is", $coolnessResult, $word);
        $stmt->execute();
        $stmt->close();
        $conn->close();

        return $coolnessResult;
    }
?>
