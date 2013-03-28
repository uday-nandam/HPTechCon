// Share.js
// This is the JS file which includes all of the "Share" feature implementation.

var PARSE_APP = "9AeVfYuAP1SWUgUv5bogPOaGwldaZTstNEO8tdJx";
var PARSE_JS = "w4ffwNOQtdfqDb2tWBXUoPmD7qJrpmHv6xcnuZj4";

Parse.initialize(PARSE_APP, PARSE_JS);

recommendedEvents();

function share() 
{
	//console.log(userID);
	//console.log(_id);
	//console.log($("messageTo").val()); // to_id
	//console.log($("messageBody").val()); // comment
	
	var userID = 123456;
	//var to_id = $("messageTo").val();
	var to_id = 123456;
	var event_id = "P213";
	var comment = "you love this, dont you.";
	
	var Share = Parse.Object.extend("Share");
	var share = new Share();
	
	share.set("from_id", userID);
	share.set("to_id", to_id);
	//share.set("event_id", _id);
	share.set("event_id", event_id);
	share.set("comment", comment);
	share.set("event_name", _name);
	
	share.save(null, {
		success: function(share) {
			alert("success");
		},
		error: function(share, error) {
			alert("fail");
		}
	});
}

function recommendedEvents()
{
	var SharedEvents = Parse.Object.extend("Share");
	var query = new Parse.Query(SharedEvents);
	
	query.equalTo("to_id", userID);
	query.limit(2);
	
	query.find({
		success: function(results) {
			var source = $("#recommendedEvents-template").html();
			
			// Create JSON array 
			var data = '{ "recommendedEvents" : [';
			for(var a = 0; a < results.length; a++) {
				data += '{"from_id": "' + results[a].get("from_id") + '", ';
				data += '"event_id": "' + results[a].get("event_id") + '", ';
				data += '"event_name": "' + results[a].get("event_name") + '", ';
				data += '"comment": "' + results[a].get("comment") + '", ';
				
				if(a == 1) {
					data += '"time": "' + results[a].createdAt + '"}';
				} else { 
					data += '"time": "' + results[a].createdAt + '"}, '; 
				}
			}
			data += ']}';
			
			var arr = JSON.parse(data);
			
			var template = Handlebars.compile(source);
			$("#recommendedEventsdiv").append(template(arr)).trigger('create');
		}
}
