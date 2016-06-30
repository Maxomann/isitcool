var api_key_flickr = "2f25bef1b043e8cb0b0380a80c4a551a";

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function getRandomWordFromIndex(){
	var index = randomIntFromInterval(0, randomWordIndex.length-1);
	var word = randomWordIndex[index];
	if(word===undefined){
		console.log("Generated word is undefined. Index:"+index.toString());
	}
	return word;
}

var dynamicExamplesNextFunctionCall;
function dynamicExamplesNextLetter(textbox, wordref, i){
	if(i>wordref.length){
		/*Set next word*/
		var word = getRandomWordFromIndex();
		dynamicExamplesNextFunctionCall = setTimeout(function(){
			dynamicExamplesNextLetter(textbox, word, 0);
		}, 1000);
		return;
	}

	textbox.placeholder = wordref.substring(0,i);

	dynamicExamplesNextFunctionCall = setTimeout(function(){
		dynamicExamplesNextLetter(textbox, wordref, i+1);
	}, 100);
}
function activateDynamicExamples(){
	deactivateDynamicExamples();

	var textbox = document.getElementById("textbox");
	dynamicExamplesNextFunctionCall = setTimeout(function(){
		dynamicExamplesNextLetter(textbox, "Please enter a word...", 0);
	}, 2000);
}
function deactivateDynamicExamples(){
	var textbox = document.getElementById("textbox");
	if(dynamicExamplesNextFunctionCall!==undefined){
		clearTimeout(dynamicExamplesNextFunctionCall);
		dynamicExamplesNextFunctionCall=undefined;
	}
	textbox.placeholder = "";
}

function setAndAnalyzeWord(word){
	document.getElementById('textbox').value = word;
	word = cleanInput(word);
	analyzeWord(word);
}
function setAndAnalyzeRandomWord(){
	var word = getRandomWordFromIndex();
	setAndAnalyzeWord(word);
}

function isMobileDevice(){
	return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

/*IMAGE OVERLAY*/
function isImageOverlayActivated(){
	var overlay = document.getElementById("imageOverlay");
	return overlay.style.visibility != "hidden";
}
function activateImageOverlay(src){
	var overlay = document.getElementById("imageOverlay");
	var image = document.getElementById("imageOverlayImage");

	image.src = src;
	overlay.style.visibility = "visible";
	overlay.style.opacity = 1;
}
function disableImageOverlay(){
	var overlay = document.getElementById("imageOverlay");
	var image = document.getElementById("imageOverlayImage");

	overlay.style.opacity = 0;
	setTimeout(function(){
		overlay.style.visibility = "hidden";
		image.src = "";
	}, 100);
}

function getInternetExplorerVersion()
{
    var rV = -1; // Return value assumes failure.

    if (navigator.appName == 'Microsoft Internet Explorer' || navigator.appName == 'Netscape') {
        var uA = navigator.userAgent;
        var rE = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");

        if (rE.exec(uA) != null) {
            rV = parseFloat(RegExp.$1);
        }
        /*check for IE 11*/
        else if (!!navigator.userAgent.match(/Trident.*rv\:11\./)) {
            rV = 11;
        }
    }
    return rV;
}

function isInternetExplorer(){
	var iEVersion = getInternetExplorerVersion();
	if(iEVersion==-1){
		return false;
	}else{
		return true;
	}
}

function hideVirtualKeyboard(){
	if(document.activeElement && isMobileDevice()){
    	document.activeElement.blur();
	}
}

function cleanInput(input){
	var retVal = input;
	retVal = retVal.replace (/#/g, '')
	retVal = retVal.replace(/\s\s+/g, ' ');
	retVal = retVal.trim();
	return retVal.toLowerCase();
}

function setResultBoxVisibleState(state){
    if(state==1){//workaround for #64
        state=2;
    }

	//state: 0 - invisible, 1 - loading, 2- result
	var resultBox = document.getElementById('searchResult');
	var resultBox_container = document.getElementById('searchResult_container');
	var resultBox_loading = document.getElementById('loadingBanner');

	if(state == 0){
		resultBox_container.style.display = 'none';
		resultBox.style.display = 'none';
		resultBox_loading.style.display = 'none';
		resultBox_container.style.opacity = 0;
        resultBox.style.opacity = 0;
		resultBox_loading.style.opacity = 0;
	}else if( state == 1 ){
		resultBox_container.style.display = 'block';
		resultBox.style.display = 'none';
		resultBox_loading.style.display = 'block';
		resultBox_container.style.opacity = 1;
        resultBox.style.opacity = 0;
		resultBox_loading.style.opacity = 1;
	}else if( state == 2 ){
		resultBox_container.style.display = 'block';
		resultBox.style.display = 'block';
		resultBox_loading.style.display = 'none';
		resultBox_container.style.opacity = 1;
        resultBox.style.opacity = 1;
		resultBox_loading.style.opacity = 0;
	}
}

var levels = {};
levels["0%"]="Not cool At all.";
levels["20%"]="Not So Cool.";
levels["40%"]="Cool?";
levels["60%"]="Really Cool!";
levels["80%"]="The Coolest Word Ever!";

var timeout;
function clearInputBoxTimeout(){
	if(timeout!==undefined){
		clearTimeout(timeout);
	}
}
function onInputBoxChanged(){
	clearInputBoxTimeout();

	var input = document.getElementById('textbox').value
	var word = cleanInput(input);
	if(word==''){
		$("#textbox").blur();
	}

	timeout = setTimeout(function(){
		var input = document.getElementById('textbox').value
		var word = cleanInput(input);
		analyzeWord(word);
	}, 1000);
}

function scrollToResult(){
	$('html,body').animate({scrollTop: $('#textbox').offset().top});
}

$(document).ready(function(){
	initCookieInfo();
	initContactInformation();
	$('a').smoothScroll();
	/*ie is not supported warning*/
	if(isInternetExplorer()){
		document.getElementById('iewarning').style.display="block";
	}

    isitcool.vote.init();

	activateDynamicExamples();

	processUrlParameter();

    $('#textbox').keypress(function(e){
        if(e.keyCode==13){
			var input = document.getElementById('textbox').value
		    var word = cleanInput(input);

			clearInputBoxTimeout();
			hideVirtualKeyboard();
            analyzeWord(word);
		}
    });
	$('#textbox').on('input', function(e) {
	    onInputBoxChanged();
	});

	$('#imageOverlay').click(function(e){
		disableImageOverlay();
	});

	$('#textbox').focus(function(e){
		deactivateDynamicExamples();
	});
	$('#textbox').focusout(function(e){
		activateDynamicExamples();
	});

	$('#dices').click(function(e){
		setAndAnalyzeRandomWord();
	});

	$('#vote_popup_overlay').click(function(e){
		hideVotePopup();
	});

	$(document).keydown(function(e){
	    if(e.keyCode == 8) {
			$("#textbox").val('');
			if(!($('#textbox').is(":focus"))){
				e.preventDefault();
	        	$("#textbox").focus();
			}
	    }
	});
	$(document).keypress(function(e) {
		$("#textbox").focus();
	});
});

function processUrlParameter(){
    var word = decodeURIComponent(location.search);
    if(word!=''){
        word = word.substr(3);
		word = cleanInput(word);
		setAndAnalyzeWord(word);
    }
}

function analyzeWord(word){
    var resultBox = document.getElementById('searchResult');

    if(!word){
        history.pushState( {}, '', '?' );
		ga('send', 'pageview', '/');
		setResultBoxVisibleState(0);
    }
    else
    {
        history.pushState( {}, '', '?q='+encodeURIComponent(word.toLowerCase()) );
		ga('send', 'pageview', '/?q='+word.toLowerCase());
		setResultBoxVisibleState(1);

		$.ajax({
			url: 'http://isitcool.bplaced.net/coolness.php',
			type: 'GET',
			data: {
				q: word.toLowerCase()
			},
			dataType: 'json',
			success: function(data){
				var coolness = data['coolness'];

				for(el in wordIndex){
					var element = wordIndex[el];
		            if(element.word==word){
						coolness = element.value;
						break;
					}
				}

		        var comment;
		        if(coolness<20)
		            comment=levels["0%"];
		        else if(coolness<40)
		            comment=levels["20%"];
		        else if(coolness<60)
		            comment=levels["40%"];
		        else if(coolness<80)
		            comment=levels["60%"];
		        else
		            comment=levels["80%"];

		        document.getElementById('srHeadingWord').innerHTML = word;
		        document.getElementById('srHeadingPercentage').innerHTML = coolness.toString();
		        document.getElementById('srHeadingComment').innerHTML = comment;

				try{
		        drawPieChart(coolness);
				}
				catch(e){}
				try{
		        getDefinition(word);
				}
				catch(e){}
				try{
				drawHistoryChart(word, coolness);
				}
				catch(e){}
				try{
				getRedditSearch(word);
				}
				catch(e){}

				setResultBoxVisibleState(2);
			},
			error:function(data){
				document.getElementById('srHeadingPercentage').innerHTML = "Error: Cannot connect to server";
			}
		});

        isitcool.vote.updateVoteState(word.toLowerCase());
    }
	scrollToResult();
};

var _pieChart;
function drawPieChart(coolness){
	var data = {
    labels: [],//no labels
    datasets: [
        {
            data: [coolness, 100-coolness],
            backgroundColor: [
                "#F9690E",
                "grey"
            ],
            hoverBackgroundColor: [
                "#f97623",
                "grey"
            ]
        }]
	};

    var options ={
        tooltips:{enabled:false}
    };


    var context = document.getElementById('srPieChart').getContext('2d');
    if(_pieChart !== undefined)
        _pieChart.destroy();
    _pieChart = new Chart(context, {type:'doughnut', data:data, options:options});
    var percentage = document.getElementById('srPercentage');
    percentage.innerHTML = coolness.toString()+'%';
};

function loadExampleImageFromFlickr(word, i/*Index of the example image*/){
	var exampleImages = document.getElementsByClassName("example_image");

	$.ajax({
        url: "https://api.flickr.com/services/rest/",
        type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
        data: {
			method:"flickr.photos.search",
			format:"json",
			api_key: api_key_flickr,
			text: word.toLowerCase(),
			media: "photos",
			sort: "interestingness-desc",
			per_page: 4,
			license: "4,5,6,7"
		}, // Additional parameters here
        complete: function(response) {
			var substr = response.responseText.substring(14, response.responseText.length-1);
			var data = JSON.parse(substr);
			$.ajax({
		        url: "https://api.flickr.com/services/rest/",
		        type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
		        data: {
					method:"flickr.photos.getSizes",
					format:"json",
					api_key: api_key_flickr,
					photo_id: data["photos"]["photo"][i]["id"]
				}, // Additional parameters here
		        complete: function(response) {
					var substr = response.responseText.substring(14, response.responseText.length-1);
					var data = JSON.parse(substr);

					if( data["sizes"]["size"][5] !== undefined ){
						exampleImages[i].src = data["sizes"]["size"][5]["source"];
					}else{
						exampleImages[i].src = data["sizes"]["size"][4]["source"];
					}
		        },
		    });
        },
    });
}

function getDefinition(word){
	var definitionElement = document.getElementById('definition');
	var exampleImages = document.getElementsByClassName("example_image");
	//reset image sources
	for (i = 0; i < 4; i++){
		exampleImages[i].src="";
	}

	/*Set link to image source*/
	document.getElementById("images_source").href = "http://www.flickr.com/search/?license=4%2C5%2C6%2C9%2C10&advanced=1&sort=interestingness-desc&text="+word.toLowerCase();

	$.ajax({
        url: 'https://en.wikipedia.org/w/api.php?', // The URL to the API. You can get this in the API page of the API you intend to consume
        type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
        data: {
			titles:word.toLowerCase(),
			format:"json",
			action:"query",
			uselang:"content",
			prop:"extracts|images",
			redirects:"1",
			exchars:"400",
			explaintext:"1",
			exsectionformat:"plain",
			imlimit:"4"
		}, // Additional parameters here
        dataType: 'jsonp',
        success: function(data) {
			var pages = data['query']['pages'];

            if(pages['-1']===undefined){
				var keys = Object.keys(pages);
				var page = pages[keys[0]];
                var definition= page['extract'];

                definitionElement.innerHTML = definition.substring(0,400) + '&nbsp<a target="_blank" href="https://en.wikipedia.org/wiki/'+word.toLowerCase()+'">...&nbsp;Show&nbspmore</a>';

				var images = page['images'];
				if(images!==undefined){
					//load and show image
					for (i = 0; i < 4; i++){
						if(i<images.length){
							var imageName = images[i]["title"];
							(function(i)//use closure to save i
							{
								$.ajax({
							        url: 'https://en.wikipedia.org/w/api.php?', // The URL to the API. You can get this in the API page of the API you intend to consume
							        type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
							        data: {
										titles:imageName,
										format:"json",
										action:"query",
										uselang:"content",
										prop:"imageinfo",
										iiprop:"url|size",
										redirects:"1",
										iiurlheight:"400"
									}, // Additional parameters here
							        dataType: 'jsonp',
							        success: function(data) {
										var singleImageQueryData = data["query"]["pages"]["-1"];
										if(singleImageQueryData!==undefined){
											singleImageQueryData = singleImageQueryData["imageinfo"][0]
											var url = singleImageQueryData["url"];
											var thumburl = singleImageQueryData["thumburl"];
											var file_extension = url.substring(url.length-4, url.length);
											var sizex = singleImageQueryData["width"];
											var sizey = singleImageQueryData["height"];

											if(file_extension.toLowerCase()==".svg" || sizex<200 || sizey<200){
												/*If image not appropriate use one from google*/
												loadExampleImageFromFlickr(word, i);
											}else{
												exampleImages[i].src=thumburl;
											}
										}else{
											loadExampleImageFromFlickr(word, i);
										}
									},
									error: function(err) { console.log("AJAX Wikipedia images"); },
								});
							})(i);
						}else{
							loadExampleImageFromFlickr(word, i);
						}
					}
				}
			}else{
                definitionElement.innerHTML = "Not available";
            }
        },
        error: function(err) { console.log("AJAX Wikipedia word"); },
    });
}

function fnv32a(str){
	var FNV1_32A_INIT = 0x811c9dc5;
	var hval = FNV1_32A_INIT;
	for ( var i = 0; i < str.length; ++i )
	{
		hval ^= str.charCodeAt(i);
		hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
	}
	return hval >>> 0;
}


function getPastCoolnessForWord(word){
    var valueHash =fnv32a(word);
    if(valueHash<0)
        valueHash*=-1;

    var asString = valueHash.toString();
    var asInt = parseInt(asString.substring(asString.length-2,asString.length));
    while(asInt<30){
        asInt++;
    }
    while(asInt>70){
        asInt--;
    }

    return asInt;
}

var _historyChart;
function drawHistoryChart(word, coolness){

    var historyValues = new Array();
    historyValues[0]=word;
    for(var i=1; i<6; ++i){
        historyValues[i]=fnv32a(historyValues[i-1].toString());
    }
    historyValues[0]=coolness;
    for(var i=1; i<6; ++i){
        historyValues[i]=getPastCoolnessForWord(historyValues[i].toString());
    }
    historyValues.reverse();

    var data ={
        labels: ["2000","2003","2006", "2009", "2012", "today"],
        datasets:[
            {
                label: "Coolness",
				fill:true,
                backgroundColor: "rgba(249,105,14,0.2)",
                borderColor: "#F9690E",
                pointBorderColor: "#F9690E",
                pointHoverBackgroundColor: "#F9690E",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                data: historyValues
            }
        ]
    };

	var options ={
        tooltips:{enabled:false},
		scales:{
            fontColor:"#2980b9",
            yAxes: [{
                display: true,
                ticks: {
                    suggestedMin: 0,   // minimum will be 0, unless there is a lower value.
                    suggestedMax: 100
                }
            }]
        }
    };


    var context = document.getElementById('srHistoryChart').getContext('2d');
    if(_historyChart !== undefined)
        _historyChart.destroy();
    _historyChart = new Chart(context, {type:'line', data:data, options:options});
}

function getRedditSearch(word){
    $.ajax({
        url: 'https://www.reddit.com/search.json', // The URL to the API. You can get this in the API page of the API you intend to consume
        type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
        data: {
			q: word,
			limit: 5,
			sort: "top",
			obey_over18: true
		}, // Additional parameters here
		dataType: 'json',
        success: function(data) {
            var htmlString=String();

            var results = data['data']['children'];
            for(var i=0; i<5; i++){
                var el = results[i];
                if(el!==undefined){
                    var data=el['data'];
                    var title = data['title'];
                    var url = data['url'];

                    htmlString += '<p><a target="_blank" href="'+url+'">'+title+'</a></p>';
                }
            }

            document.getElementById('srRedditContainer').innerHTML=htmlString;
        },
        error: function(err) { console.log("AJAX Reddit"); },
    });
}

//Cookies
var cookie_info_name = 'isitcool_cookieinfo'
function initCookieInfo(){
	var val = Cookies.get(cookie_info_name);
	if(val===undefined){
		cookie_info_container.style.display = 'block';
	}
}
function closeCookieInfo(){
	Cookies.set(cookie_info_name, 'true', { expires: 999 });
	cookie_info_container.style.display = 'none';
}

// IMPRESSUM
function initContactInformation(){
	var elements = document.getElementsByClassName("contact_info");
	for( el in elements ){
		elements[el].innerHTML = "<h2>Angaben gemäß § 5 TMG:</h2><p>Kay Gonschior<br />Scheideweg 26<br />20253 Hamburg</p><h2>Kontakt:</h2><p>Telefon:<br />040 / 78894588<br />E-Mail:<br />info@kay-gonschior.de<br /></p>";
	}
}
