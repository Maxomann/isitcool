var isitcool = {
    vote: {
        login_state: false, /*false - not logged in, true - logged in*/
        vote_state: 0,/*0 - undefined, 1 - none, 2 - down, 3 - up*/

        updateLoginAndVoteState: function(){
            $.ajax({
                url: 'http://isitcool.bplaced.net/login.php',
    			type: 'GET',
    			data: {
    				action: 'getLoginState'
    			},
    			dataType: 'json',
    			success: function(data){
                    console.log(data);
                    var loginState = data['loginState'];
                    isitcool.vote.setLoginState(loginState);
                    if(loginState){
                        $.ajax({
                            url: 'http://isitcool.bplaced.net/vote.php',
                			type: 'GET',
                			data: {
                				action: 'getVoteState'
                			},
                			dataType: 'json',
                			success: function(data){
                                console.log(data);
                            },
                            error: function(){
                                console.log("Error: RequestVoteState");
                            }
                        });
                    }
                },
                error: function(){
                    console.log("Error: RequestLoginState");
                }
            });
        },

        vote: function(bool/*false - down, true - up*/) {
            if(bool){
                console.log("vote: up");
            }else{
                console.log("vote: down");
            }
        },

        setVoteState: function(){

        },

        setLoginState: function(bool){

        }
    }
};
