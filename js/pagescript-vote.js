var isitcool = {
    vote: {
        cookie_voteid_name: "isitcool_voteid",
        downarrow: 0,
        uparrow: 0,
        voteText: 0,

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
            downarrow = document.getElementById('vote_left');
            uparrow = document.getElementById('vote_right');
            voteText = document.getElementById('vote_center_text');
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
                            this.playVoteSuccessAnimation();
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

        updateVoteState: function(word){
            console.log("updateVoteSate");

            this.getIdCookie(function(id){
                console.log(id);
                $.ajax({
                    url: 'http://isitcool.bplaced.net/vote.php', // The URL to the API. You can get this in the API page of the API you intend to consume
                    type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
                    data: {
            			action: 'getVoteState',
                        q: word,
                        id: id
            		}, // Additional parameters here
            		dataType: 'json',
                    success: function(data) {
                        if(data['status']=='success'){
                            var state = data['voteState'];
                            if(state == "up"){
                                setVoteState(2);
                            }else if(state=="down"){
                                setVoteState(1);
                            }else{
                                console.log("Wrong voteState");
                                console.log(state);
                                setVoteState(0);
                            }
                        }else{
                            console.log("AJAX getVoteState ERROR");
                            console.log(data);
                        }
                    },
                    error: function(err) { console.log("AJAX vote"); },
                });
            });
        },

        setVoteState: function(state/*0 - neutral, 1 - down, 2 - up*/){
            switch(state){
                case 0:
                downarrow.style.backgroundImage = 'url("../assets/vote/down.svg")';
                uparrow.style.backgroundImage = 'url("../assets/vote/up.svg")';
                downarrow.style.backgroundColor = '#cf5305';
                uparrow.style.backgroundColor = '#cf5305';
                break;
                case 1:
                downarrow.style.backgroundImage = 'url("../assets/vote/down_selected.svg")';
                uparrow.style.backgroundImage = 'url("../assets/vote/up.svg")';
                downarrow.style.backgroundColor = '#233140';
                uparrow.style.backgroundColor = '#cf5305';
                break;
                case 2:
                downarrow.style.backgroundImage = 'url("../assets/vote/down_selected.svg")';
                uparrow.style.backgroundImage = 'url("../assets/vote/up_selected.svg")';
                downarrow.style.backgroundColor = '#cf5305';
                uparrow.style.backgroundColor = '#233140';
                break;
                default:
                    console.log("WrongState");
                break;
            }
        },

        playVoteSuccessAnimation: function(){
            voteText.innerHTML = "Success <img src='assets/vote/success.svg' width='35' height='35' style='display:inline; transform: translateY(4px)'>";
            setTimeout(function(){ voteText.innerHTML="Vote here" }, 1000);
        }
    }
};
