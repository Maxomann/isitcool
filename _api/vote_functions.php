<?php
    include 'secretConstants.php';

    function getAnonymousIp(){
        return md5($_SERVER['REMOTE_ADDR']);
    }

    function generateId(){
        return md5(uniqid());
    }

    function linkIpToId($id, $ip){
        if(lookupIdForIp($ip) == false){
            $conn = new mysqli( Constants::mySql_host,
                                Constants::mySql_user,
                                Constants::mySql_key,
                                Constants::mySql_dbname
                            );

            $stmt = $conn->prepare( "INSERT INTO id_link (id, ip) VALUES ( ?, ? )" );
            $stmt->bind_param("ss", $id, $ip);
            $stmt->execute();
            if( $stmt->error ){
                die('Could not enter data: ' . mysql_error());
            }

            $stmt->close();
            $conn->close();
        }else{
            die("Ip cannot be linked to multiple ids");
        }
    }

    //return false if not found
    function lookupIdForIp($ip){
        $retVal =  false;

        $conn = new mysqli( Constants::mySql_host,
                            Constants::mySql_user,
                            Constants::mySql_key,
                            Constants::mySql_dbname
                        );
        if( $mysqli->connect_errno ){
            die('Could not connect: ' . $mysqli->connect_errno);
        }
        $stmt = $conn->prepare("SELECT id FROM id_link WHERE ip = ?");
        $stmt->bind_param("s", $ip);
        $stmt->bind_result($sqlRetValueId);

        $stmt->execute();
        $stmt->store_result();

        if( $stmt->error ){
            die('Could not get data: ' . $stmt->error);
        }
        else if( $stmt->num_rows == 1 ){
            if( $stmt->fetch() ){
                $retVal = $sqlRetValueId;
            }
        }

        $stmt->free_result();
        $stmt->close();
        $conn->close();

        return $retVal;
    }
?>
