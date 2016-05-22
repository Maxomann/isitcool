// RELEASE:
console.log = function() {};
// DISABLE FOR DEBUG

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

function getCoolnessForWord(word){
    var valueHash =fnv32a(word);
    if(valueHash<0)
        valueHash*=-1;

    var asString = valueHash.toString();
    return parseInt(asString.substring(asString.length-2,asString.length));
}

function cleanInput(input){
	var retVal = input.replace(/\s\s+/g, ' ');
	retVal = retVal.trim()
	return retVal.toUpperCase();
}

function setResultBoxVisible(bool){
	var resultBox = document.getElementById('searchResult');

	if(bool){
		resultBox.style.visibility = 'visible';
        resultBox.style.opacity = 1;
	}else{
		resultBox.style.visibility = 'hidden';
        resultBox.style.opacity = 0;
	}
}

var levels = {};
levels["0%"]="Not cool At all.";
levels["20%"]="Not So Cool.";
levels["40%"]="Cool?";
levels["60%"]="Really Cool!";
levels["80%"]="The Coolest Word Ever!";

$(document).ready(function(){
	initContactInformation();

    $('#textbox').keypress(function(e){
        if(e.keyCode==13)
            analyzeWord();
    });

    processUrlParameter();
});

function processUrlParameter(){
    var word = decodeURIComponent(location.search);
    if(word!=''){
        word = word.substr(1);
        document.getElementById('textbox').value = word.trim();
        analyzeWord();
    }
}

function analyzeWord(){
    var resultBox = document.getElementById('searchResult');

    var input = document.getElementById('textbox').value
    var word = cleanInput(input);

    if(!word){
        history.pushState( {}, '', '?' );
        setResultBoxVisible(false);
    }
    else
    {
        history.pushState( {}, '', '?'+encodeURIComponent(word.toLowerCase()) );
        var coolness = getCoolnessForWord(word);

        if(word=="ISITCOOL.NET")
            coolness=100;

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

		setResultBoxVisible(true);
    }
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

function getDefinition(word){
	/* URBAN DICTIONARY - OLD
	$.ajax({
        url: 'http://api.urbandictionary.com/v0/define?term='+word, // The URL to the API. You can get this in the API page of the API you intend to consume
        type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
        data: {}, // Additional parameters here
        dataType: 'json',
        success: function(data) {
            console.log(data);

            var definitionElement = document.getElementById('definition');
            var exampleElement = document.getElementById('example');

            if(data['result_type']=='exact'){
                var definition= data['list'][0]['definition'];
                var example= '"' + data['list'][0]['example'] + '"';

                definitionElement.innerHTML = definition.substring(0,400) + '&nbsp<a target="_blank" href="http://www.urbandictionary.com/define.php?term='+word+'">...&nbsp;Show&nbspmore</a>';
                exampleElement.innerHTML = example.substring(0,400) + '&nbsp<a target="_blank" href="http://www.urbandictionary.com/define.php?term='+word+'">...&nbsp;Show&nbspmore</a>';
            }
            else{
                definitionElement.innerHTML = "Not available";
                exampleElement.innerHTML = "Not available";
            }
        },
        error: function(err) { alert(err); },
    });
	*/

	var definitionElement = document.getElementById('definition');
	var exampleImages = document.getElementsByClassName("example_image");
	//reset image sources
	for (i = 0; i < 4; i++){
		exampleImages[i].src="";
	}

	$.ajax({
        url: 'https://en.wikipedia.org/w/api.php?', // The URL to the API. You can get this in the API page of the API you intend to consume
        type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
        data: { titles:word.toLowerCase(), format:"json", action:"query", uselang:"content", prop:"extracts|images", redirects:"1", exchars:"400", explaintext:"1", exsectionformat:"plain", imlimit:"4" }, // Additional parameters here
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
						var imageName = images[i]["title"];
						(function(i)//use closure to save i
						{
							$.ajax({
						        url: 'https://en.wikipedia.org/w/api.php?', // The URL to the API. You can get this in the API page of the API you intend to consume
						        type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
						        data: { titles:imageName, format:"json", action:"query", uselang:"content", prop:"imageinfo", iiprop:"url", redirects:"1",  imlimit:"4" }, // Additional parameters here
						        dataType: 'jsonp',
						        success: function(data) {
									if(exampleImages[i].src=data["query"]["pages"]["-1"]!==undefined){
										exampleImages[i].src=data["query"]["pages"]["-1"]["imageinfo"][0]["url"];
									}
								},
								error: function(err) { console.log("AJAX Wikipedia images"); },
							});
						})(i);
					}
				}
			}else{
                definitionElement.innerHTML = "Not available";
            }
        },
        error: function(err) { console.log("AJAX Wikipedia word"); },
    });
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
        historyValues[i]=getCoolnessForWord(historyValues[i].toString());
    }
    historyValues.reverse();

	/*
	label: "My First dataset",
	fillColor: "rgba(249,105,14,0.2)",
	strokeColor: "#F9690E",
	pointColor: "#F9690E",
	pointStrokeColor: "#2c3e50",
	pointHighlightFill: "#2c3e50",
	pointHighlightStroke: "rgba(220,220,220,1)",
	data: historyValues
	*/

    var data ={
        labels: ["2000","2003","2006", "2009", "2012", "today"],
        datasets:[
            {
                label: "Coolness",
				fill:true,
                backgroundColor: "rgba(249,105,14,0.2)",
                borderColor: "#F9690E",
                pointBorderColor: "#F9690E",
                pointHoverBackgroundColor: "#2c3e50",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                data: historyValues
            }
        ]
    };

	var options ={
        tooltips:{enabled:false},
		scales:{fontColor:"#2980b9"}
		/*scaleFontColor: "#2980b9"*/
    };


    var context = document.getElementById('srHistoryChart').getContext('2d');
    if(_historyChart !== undefined)
        _historyChart.destroy();
    _historyChart = new Chart(context, {type:'line', data:data, options:options});
}

function getRedditSearch(word){
    /*$.ajax({
        url: 'http://www.reddit.com/search.json?q='+word, // The URL to the API. You can get this in the API page of the API you intend to consume
        type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
        data: {}, // Additional parameters here
		dataType: 'json',
        success: function(data) {
            console.log(data);

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
    });*/
}


// IMPRESSUM
function initContactInformation(){
	var elements = document.getElementsByClassName("contact_info");
	for( el in elements ){
		elements[el].innerHTML = "<h2>Angaben gemäß § 5 TMG:</h2><p>Kay Gonschior<br />Scheideweg 26<br />20253 Hamburg</p><h2>Kontakt:</h2><p>Telefon:<br />040 / 78894588<br />E-Mail:<br />info@kay-gonschior.de<br /></p>";
	}
}
