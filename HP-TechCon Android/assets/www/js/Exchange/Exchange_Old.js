// USING GIT NOW.
// my.js - Summary 
// This is the main javascript file which
// will hold ALL the javascript for the app
// We are using JQuery and Handlebar.js Templates
// to keep all the HTML seperated from the business logic.
// ABSOLUTELY NO HTML SHOULD BE GENERATED FROM HERE!

//Jquery Event Handler still tricky, using workarounds for now...
// When user clicks on an Exchange Item in a list.
//$(document).on("pageinit", function() {
/*
$(document).ready(function() {
	$("li").click(function(e) {
		exchangeDetails(this.id);
	});
});
*/
var PARSE_APP = "9AeVfYuAP1SWUgUv5bogPOaGwldaZTstNEO8tdJx";
var PARSE_JS = "w4ffwNOQtdfqDb2tWBXUoPmD7qJrpmHv6xcnuZj4";

Parse.initialize(PARSE_APP, PARSE_JS);

var _id = 0;
var _name = "";
var _work_email = "";
var _location = ""; 
var _department = "";
var _title = "";
var _exchangeId = 0;

var my_id = 111111; // Personal ID hard coded. (Perhaps implemented using Login Feature).
//var my_id = parseInt(Parse.User.current().getUsername());
//console.log(my_id);

recentExchanges();

console.log(Parse.User.current());

function searchContact() {
	var input = parseInt($("#exchangeInput").val()); // Retrieve what the user searched for.
	_id = input;
	
	var Employee = Parse.Object.extend("employee");
	
	var query = new Parse.Query(Employee);
	
	query.equalTo("employee_id", _id);
	query.find({
		success: function(result) {
			// result is an instance of Parse.Object.
			
			// Checking for invalid input.
			if (result.length == 0) {
				alert("No Employee exists with this HP ID.");
				reload();
			}
			
			var emp = result[0];
			
			_name = emp.get("name");
			_work_email = emp.get("work_email");
			_location = emp.get("location");
			_department = emp.get("department");
			_title = emp.get("title");
			
			var source = $("#newexchange-template").html();
			var template = Handlebars.compile(source);
			
			var data = {
				name: _name, 
				email: _work_email,
				location: _location,
				department: _department,
				title: _title
			};
			
			var html = template(data);
			$("#newexchange-div").html(template(data)).trigger("create");
			$("#newexchange-div ul").listview();
		},
		error: function(result, error) {
			// error is an instance of Parse.Error.
			alert("Error");
		}
	});
	$("#exchangeInput").val("");
}

// Exchange Confirmed and Saved to Parse.com.
function exchangeConfirm() {
	var comment = $("#inputNote").val();
	
	var Exchange = Parse.Object.extend("Exchange");
	var exchange = new Exchange();
	
	exchange.set("initiatedBy", my_id);
	exchange.set("initiatedTo", _id);
	exchange.set("initiatedToName", _name);
	exchange.set("comments", comment);
	
	exchange.save(null, {
		success: function(exchange) {
			//alert("success");
		},
		error: function(exchange, error) {
			//alert("Error");
		}
	});	
	reload();
}

// Retrieve Recent Exchanges
function recentExchanges() {
	var Exchange = Parse.Object.extend("Exchange");
	var query = new Parse.Query(Exchange);
	
	query.descending("createdAt");
	query.equalTo("initiatedBy", my_id);
	query.limit(4); // We only want the first 4 Exchanges to show under Recent Exchanges.
	
	query.find({
		success: function(results) {
			var source = $("#recentexchanges-template").html();
			
			// Create JSON array 
			var data = '{ "recentExchanges" : [';
			for(var a = 0; a < results.length; a++) {
				data += '{"to_name": "' + results[a].get("initiatedToName") + '", ';
				data += '"comments": "' + results[a].get("comments") + '", ';
				data += '"id": "' + results[a].id + '", ';
				
				if(a == 3) {
					data += '"time": "' + results[a].createdAt + '"}';
				} else { 
					data += '"time": "' + results[a].createdAt + '"}, '; 
				}
			}
			data += ']}';
			
			var arr = JSON.parse(data);
			
			var template = Handlebars.compile(source);
			$("#recentExchangesdiv").append(template(arr)).trigger('create');
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}

// Retrieve all Exchanges.
function allExchanges() {
	var Exchange = Parse.Object.extend("Exchange");
	var query = new Parse.Query(Exchange);
	
	query.equalTo("initiatedBy", my_id);
	query.descending("createdAt");
	query.find({
		success: function(results) {
			var source = $("#allexchanges-template").html();
			
			// Create JSON array 
			var data = '{ "allExchanges" : [';
			for(var a = 0; a < results.length; a++) {
				data += '{"to_name": "' + results[a].get("initiatedToName") + '", ';
				data += '"comments": "' + results[a].get("comments") + '", ';
				data += '"id": "' + results[a].id + '", ';
				
				if(a  > results.length-2) {
					data += '"time": "' + results[a].createdAt + '"}';
				} else { 
					data += '"time": "' + results[a].createdAt + '"}, '; 
				}
			}
			data += ']}';
			
			var arr = JSON.parse(data);
			
			var template = Handlebars.compile(source);
			
			$("#allExchangesdiv").html(template(arr)).trigger('create');
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}

function exchangeDetails(exchangeid) {
	//alert(exchangeid);
	var Exchange = Parse.Object.extend("Exchange");
	var query = new Parse.Query(Exchange);
	_exchangeId = exchangeid;
	query.equalTo("objectId", _exchangeId);
	
	query.find({
		success: function(result) {
			_id = result[0].get("initiatedTo"); // this is a global variable.
			var comments = result[0].get("comments");
			var time = result[0].createdAt;
			createExchangeDetailTemplate(_id, comments, time); // use this info to get all relevant exchange info.
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}

function createExchangeDetailTemplate(id, _comments, _time) {
	var Employee = Parse.Object.extend("employee");
	
	var query = new Parse.Query(Employee);
	query.equalTo("employee_id", id);
	
	query.find({
		success: function(result) {
			var source = $("#exchangedetails-template").html();
			var template = Handlebars.compile(source);
			
			var data = {
				name: result[0].get("name"), 
				email: result[0].get("work_email"),
				location: result[0].get("location"),
				department: result[0].get("department"),
				title: result[0].get("title"),
				comments: _comments,
				time: _time
			};
			var html = template(data);
			
			$("#exchangedetailsdiv").html(template(data)).trigger('create');
			$("#exchangedetailsdiv ul").listview();
			
			//source = $("#exchangedetailscomments-template").html();
			//template = Handlebars.compile(source);
			
			//$("#exchangedetailscommentsdiv").html(template(data));
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}

// Script for camera
function cameraFunction() {
	alert("The camera icon works!");
}
// Script for microphone
function micFunction() {
	//alert("The microphone icon works!");
	alert(_location);
}

function reload() {
	window.location = "#exchange-main";
	location.reload();
}