// New Exchange javascript with compiled templates.

var recentExchangesTemplate;
var recentExchangesTemplateCompiled;
var allExchangesTemplate;
var allExchangesTemplateCompiled;
var exchangeDetailsTemplate;
var exchangeDetailsTemplateCompiled;
var newExchangeTemplate;
var newExchangeTemplateCompiled;

var _id = 0;
var _name = "";
var _picture = "";
var _work_email = "";
var _location = ""; 
var _department = "";
var _title = "";
var _exchangeId = 0;

var my_id = 111111; // Personal ID hard coded
//var my_id = parseInt(Parse.User.current().getUsername());
//console.log(my_id);

$(function() {
	var PARSE_APP = "9AeVfYuAP1SWUgUv5bogPOaGwldaZTstNEO8tdJx";
	var PARSE_JS = "w4ffwNOQtdfqDb2tWBXUoPmD7qJrpmHv6xcnuZj4";

	Parse.initialize(PARSE_APP, PARSE_JS);
	
	recentExchangesTemplate = $("#recentexchanges-template").html();
	recentExchangesTemplateCompiled = Handlebars.compile(recentExchangesTemplate);
	allExchangesTemplate = $("#allexchanges-template").html();
	allExchangesTemplateCompiled = Handlebars.compile(allExchangesTemplate);
	exchangeDetailsTemplate = $("#exchangedetails-template").html();
	exchangeDetailsTemplateCompiled = Handlebars.compile(exchangeDetailsTemplate);
	newExchangeTemplate = $("#newexchange-template").html();
	newExchangeTemplateCompiled = Handlebars.compile(newExchangeTemplate);
	
	$(document).delegate('#exchange-main', 'pageshow', function () {
		$("#exchangeInput").val("");
		recentExchanges();
	});
	
	$("#submitButton").click(function(e) {
		searchContact();
	});
	
	$("#recentExchangesdiv").on('click', '#viewAllExchangesLink', function(e) {
		e.preventDefault();
		allExchanges();
		$.mobile.changePage('#exchange-all');
	});
	
	$("#recentExchangesdiv").on('click', '#savedExchanges li:not(#viewAllExchangesLink)', function(e) {
		e.preventDefault();
		_exchangeId = e.target.id;
		console.log(_exchangeId);
		//alert(e.target.id);
		exchangeDetails(_exchangeId);
		$.mobile.changePage('#exchange-details');
	}); 
	
	$("#allExchangesdiv").on('click', '#allExchanges li', function(e) {
		e.preventDefault();
		_exchangeId = e.target.id;
		console.log(_exchangeId);
		//alert(e.target.id);
		exchangeDetails(_exchangeId);
		$.mobile.changePage('#exchange-details');
	}); 
	
	$("#viewAllExchangesLink").click(function(e) {
		e.preventDefault();
		allExchanges();
		$.mobile.changePage('#exchange-all');
	});
	
	$(document).delegate('#exchange-details', 'pageinit', function(event) {

		$("#exchangedetailsdiv").on('click', '#saveNoteButton', function(e) {
			e.preventDefault();
			saveExchangeNotes();
			$.mobile.changePage('#exchange-main');
		}); 
		
		$("#exchangedetailsdiv").on('click', '#cancelNoteButton', function(e) {
			e.preventDefault();
			$.mobile.changePage('#exchange-main');
		}); 
	});
	
	$(document).delegate('#exchange-new', 'pageinit', function(event) {

		$("#newexchange-div").on('click', '#exchangeConfirm', function(e) {
			e.preventDefault();
			exchangeConfirm();
			$.mobile.changePage('#exchange-main');
		}); 
		
		$("#newexchange-div").on('click', '#cancelExchange', function(e) {
			e.preventDefault();
			$.mobile.changePage('#exchange-main');
		}); 
	});
	
	recentExchanges();
});

function searchContact() {
	
	var Employee = Parse.Object.extend("employee");
	
	var query = new Parse.Query(Employee);
	var input = "";
	
	// if we want to search by work email
	if (($("#exchangeInput").val().length) > 6) {
		input = $("#exchangeInput").val();
		query.equalTo("work_email", input);
		
	// if we want to search by HP ID	
	} else if (($("#exchangeInput").val().length) == 6) {
		input = parseInt($("#exchangeInput").val()); // Retrieve what the user searched for.
		console.log(input);
		_id = input;
		query.equalTo("employee_id", _id);
		
	// Invalid Input check	
	} else if (($("#exchangeInput").val().length) != 6) {
		alert("No Employee exists with this HP ID!");
		$.mobile.changePage('#exchange-main');
	}
	
	query.find({
		success: function(result) {
			// result is an instance of Parse.Object.
			console.log(result.length);
			// Checking for invalid input.
			if (result.length == 0) {
				alert("No Employee exists with this HP ID.");
				$.mobile.changePage('#exchange-main');
			}
			
			var emp = result[0];
			
			var lastName = emp.get("Last_Name");
			
			//_id = parseInt(emp.get("employee_id"));
			console.log(_id);
			_picture = emp.get("picture").url;
			_name = emp.get("name") + " " + lastName;
			_work_email = emp.get("work_email");
			_location = emp.get("location");
			_department = emp.get("department");
			_title = emp.get("title");
			
			//var source = $("#newexchange-template").html();
			//var template = Handlebars.compile(source);
			
			var data = {
				name: _name, 
				picture: _picture,
				email: _work_email,
				location: _location,
				department: _department,
				title: _title
			};
			
			//var html = template(data);
			$("#newexchange-div").html(newExchangeTemplateCompiled(data)).trigger("create");
			$("#newexchange-div ul").listview();
			$.mobile.changePage('#exchange-new');
		},
		error: function(result, error) {
			// error is an instance of Parse.Error.
			alert("Error");
		}
	});
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

			//Reward User Points
			var Employee = Parse.Object.extend("employee");
			var query = new Parse.Query(Employee);
			query.equalTo("employee_id", 123456);
			query.first({
				success: function(result) {
					result.increment("points");
					result.save();
				},
				error: function(error) {
					console.log("Unable to reward user :(");
				}
			});

			//log this interaction
			var Points = Parse.Object.extend("Points");
			var newEvent = new Points();
			newEvent.set("eventID", exchange.id);
			newEvent.set("eventType", "exchange");
			newEvent.set("fromUserID", "123456");
			newEvent.save();

		},
		error: function(exchange, error) {
			//alert("Error");
		}
	});	
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
			//var source = $("#recentexchanges-template").html();
			
			// Create JSON array 
			var data = '{ "recentExchanges" : [';
			for(var a = 0; a < results.length; a++) {
				data += '{"to_name": "' + results[a].get("initiatedToName") + '", ';
				data += '"comments": "' + results[a].get("comments") + '", ';
				data += '"id": "' + results[a].id + '", ';
				
				var time = results[a].createdAt;
				time = convertTime(time);
				
				if(a == 3) {
					data += '"time": "' + time + '"}';
				} else { 
					data += '"time": "' + time + '"}, '; 
				}
			}
			data += ']}';
			
			var arr = JSON.parse(data);
			
			//var template = Handlebars.compile(source);
			$("#recentExchangesdiv").html(recentExchangesTemplateCompiled(arr)).trigger('create');
			$("#recentExchangesdiv ul").listview();
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
			//var source = $("#allexchanges-template").html();
			
			// Create JSON array 
			var data = '{ "allExchanges" : [';
			for(var a = 0; a < results.length; a++) {
				data += '{"to_name": "' + results[a].get("initiatedToName") + '", ';
				data += '"comments": "' + results[a].get("comments") + '", ';
				data += '"id": "' + results[a].id + '", ';
				
				var time = results[a].createdAt;
				time = convertTime(time);
				
				if(a  > results.length-2) {
					data += '"time": "' + time + '"}';
				} else { 
					data += '"time": "' + time + '"}, '; 
				}
			}
			data += ']}';
			
			var arr = JSON.parse(data);
			
			//var template = Handlebars.compile(source);
			
			$("#allExchangesdiv").html(allExchangesTemplateCompiled(arr)).trigger('create');
			$("#allExchangesdiv ul").listview('refresh');
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
	//console.log(_exchangeId);
	//console.log(_id);
	query.find({
		success: function(result) {
			_id = result[0].get("initiatedTo"); // this is a global variable.
			//console.log(_id);
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
		
			var locTime = new Date(_time);
			var locDate = convertDate(locTime);
			locTime = convertTime(locTime);
			
			var data = {
				name: result[0].get("name"),
				lastname: result[0].get("Last_Name"),
				picture: result[0].get("picture").url,
				email: result[0].get("work_email"),
				location: result[0].get("location"),
				department: result[0].get("department"),
				title: result[0].get("title"),
				comments: _comments,
				time: locTime
			};
			//var html = template(data);
			
			$("#exchangedetailsdiv").html(exchangeDetailsTemplateCompiled(data)).trigger('create');
			$("#exchangedetailsdiv ul").listview('refresh');
			
			//source = $("#exchangedetailscomments-template").html();
			//template = Handlebars.compile(source);
			
			//$("#exchangedetailscommentsdiv").html(template(data));
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}

function convertDate(date){
	var date = new Date(date);
	var month = date.getMonth();
	var day = date.getDate();
	var year = date.getFullYear();
	var monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];
    
    var d = "";
    d += monthNames[month] + " " + day + "," + year;
    return d;
}

function convertTime(time){
	var time = new Date(time);
	var hours = time.getHours();
	var minutes = time.getMinutes();
	
	if(minutes < 10){
		minutes = "0" + minutes;
	}
	if(hours > 11){
		var postfix = "PM";
	} else {
		var postfix = "AM";
	}
	if (hours > 12){
		hours -= 12;
	}
	var d = "";
	d += hours + ":" + minutes + " " + postfix;
	
	return d;
			
}

function reload() {
	window.location = "#exchange-main";
	location.reload();
}