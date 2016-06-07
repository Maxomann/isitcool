function onSignIn(googleUser) { isitcool.vote.onSignInWithGoogle(googleUser); }
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

        onSignInWithGoogle: function(googleUser) {
            console.log("onSignInWithGoogle");
            var id_token = googleUser.getAuthResponse().id_token;
            /*POST*/
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://isitcool.bplaced.net/login.php');/*s*/
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onload = function() {
                console.log('Signed in as: ' + xhr.responseText);
                isitcool.vote.updateLoginAndVoteState();
            };
            xhr.send('action=login&idtoken=' + id_token);
        },

        vote: function(bool/*false - down, true - up*/) {
            if(bool){
                console.log("vote: up");
            }else{
                console.log("vote: down");
                var auth2 = gapi.auth2.getAuthInstance();
                auth2.signOut().then(function () {
                  console.log('User signed out.');
                });
            }
        },

        setVoteState: function(){

        },

        setLoginState: function(bool){

        }
    }
};
