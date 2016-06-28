var isitcool = {
    vote: {
        cookie_voteid_name: "isitcool_voteid",
        vote_state: 0,/*0 - undefined, 1 - neutral, 2 - down, 3 - up*/

        getIdCookie: function(callback){
            var cookiename = this.cookie_voteid_name;
            var id = Cookies.get(cookiename);
        	if(id===undefined){
                $.ajax({
                    url: 'http://isitcool.bplaced.net/vote.php', // The URL to the API. You can get this in the API page of the API you intend to consume
                    type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
                    data: {
            			action: 'requestId'
            		}, // Additional parameters here
            		dataType: 'json',
                    success: function(data) {
                        if(data['status']=='success'){
                            id = data['id'];
                            Cookies.set(cookiename, id, { expires: 999 });
                            callback(id);
                        }else{
                            console.log("AJAX GetId2");
                        }
                    },
                    error: function(err) { console.log("AJAX GetId"); },
                });
        	}else{
                callback(id);
            }
        },

        init: function(){
        },

        vote: function(bool/*false - down, true - up*/) {
            var state = "none";
            var input = document.getElementById('textbox').value
		    var word = cleanInput(input);
            if(word==''){
                return;
            }

            if(bool){
                state = "up";
                console.log("vote: up");
            }else{
                state = "down";
                console.log("vote: down");
            }

            this.getIdCookie(function(id){
                console.log(id);
                $.ajax({
                    url: 'http://isitcool.bplaced.net/vote.php', // The URL to the API. You can get this in the API page of the API you intend to consume
                    type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
                    data: {
            			action: 'vote',
                        q: word,
                        state: state,
                        id: id
            		}, // Additional parameters here
            		dataType: 'json',
                    success: function(data) {
                        if(data['status']=='success'){
                            console.log("AJAX vote SUCCESS");
                            setAndAnalyzeWord(word);
                        }else{
                            console.log(data);
                            console.log("AJAX vote ERROR");
                        }
                    },
                    error: function(err) { console.log("AJAX vote"); },
                });
            });
        },

        setVoteState: function(){

        }
    }
};
