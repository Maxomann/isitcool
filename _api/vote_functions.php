<?php
    include_once 'secretConstants.php';

    abstract class VoteStates
    {
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
        return false;
    }

    /*returns voteState or false*/
    function vote($id, $word, $voteState){
        return false;
    }

    function recalculateCoolnessForWord($word){

    }


?>
