$(document).ready(function () {
	$("#submitButton").click(function() {
		_id = $("#checkinInput").val();
		searchSession(_id);
		
	});
});

var PARSE_APP = "9AeVfYuAP1SWUgUv5bogPOaGwldaZTstNEO8tdJx";
var PARSE_JS = "w4ffwNOQtdfqDb2tWBXUoPmD7qJrpmHv6xcnuZj4";

var userID = "123456";
var _id = 0;
var _name = "";
var _location = "";
var _speaker = ""; 
var _time = "";
var title = "";


Parse.initialize(PARSE_APP, PARSE_JS);
checkEvents();

//takes event id as input and queries server for event data.
//then navigates to event details page and appends data to html via template
function searchSession(input){
	_id = input;
	getComments();
	Session = Parse.Object.extend("sessions");
	
	query = new Parse.Query(Session);
	
	query.equalTo("ID", _id);
	query.find({
		success: function(result) {
			// result is an instance of Parse.Object
			
			if (result.length == 0){
				alert("Sorry, that Event ID is not listed");
				reload();
			}
			var sess = result[0];
			
			_name = sess.get("Name");
			_speaker = sess.get("Speaker");
			_location = sess.get("Location");
			_time = sess.get("Time");
			
			var locTime = new Date(_time);
			var locDate = convertDate(locTime);
			locTime = convertTime(locTime);
			
			var source = $("#eventDetails-template").html();
			
			var template = Handlebars.compile(source);
		
			var data = {
				name: _name, 
				speaker: _speaker,
				location: _location,
				date: locDate,
				time: locTime
			};
			
			$.mobile.changePage("#event-details", {transition: "slideup"});
			var html = template(data);
			$("#eventDetails").html(template(data)).trigger('create');
			$("#eventDetails").listview('refresh');
			
			
			
		},
		error: function(result, error) {
			// error is an instance of Parse.Error.
			alert("Error");
		}
	});
	
	$("#checkinInput").val("");
}
//when check in button is pressed on event details page this function saves the details to the server
//	then navigates back to checkin main page
 function checkInConfirm(){ 	
 	
 	var name;
 	var locat;
 	
	var CheckIn = Parse.Object.extend("CheckIn");
	var checkin = new CheckIn();
	
	checkin.set("EventId", _id);
	checkin.set("UserID", userID);
	checkin.set("EventName", _name);
	
	employee = Parse.Object.extend("employee");
	query = new Parse.Query(employee);
	userID = parseInt(userID);
	
	query.equalTo("employee_id", userID);
	query.find({
		success: function(result){
			var emp = result[0];
			name = emp.get("name");
			locat = emp.get("location");
			title = emp.get("title");
			
			checkin.set("Name", name);
			checkin.set("location", locat);
			checkin.set("Title", title);
			
			var date = new Date();
		 	var time = convertTime(date);
		 	
			checkin.save(null, {
				success: function(exchange) {
					//alert("You have successfully checked into " + _name + " at " + time);
					//$.mobile.changePage("#checkin-main", {transition: "slideup"});
					reload();
				},
				error: function(exchange, error) {
					alert("Error");
					$.mobile.changePage("#checkin-main", {reloadPage : true});
				}
			});	
		}
	});
	
 }
 
// checks the system time against the parse server data to 
//  see if there are events upcomming, then appends the events to the check in main page html
function checkEvents(){
	var localDate = new Date();
	var localHour = localDate.getHours();
	var localMinutes = localDate.getMinutes();
	var localMonth = localDate.getMonth();
	var localDay = localDate.getDate();
	var localYear = localDate.getFullYear();
	
	sessions = Parse.Object.extend("sessions");
	
	var query = new Parse.Query(sessions);
	
	query.find({
		success:function(results){
			
			var source = $("#currentEvents-template").html();
			
			var inc = 0;
			var events = new Array();
			
			for(var i=0, len=results.length; i<len;i++){
				var sess = results[i];
				var serDate = new Date(sess.get("Time"));// following variables are for server date info converted to local time
				var serHour = serDate.getHours();// hour of event in server
				var serMinutes = serDate.getMinutes();//minute of event in server
				var serMonth = serDate.getMonth();//month of event in server
				var serDay = serDate.getDate();//day of event in server
				var serYear = serDate.getFullYear();//year of event in server
				
			
				if (localYear == serYear && localDay == serDay && localMonth == serMonth && localHour <= serHour){
					if ((localHour + 1) >= serHour){
						if(serMinutes < 10){
						serMinutes = "0" + serMinutes;
						}
						if(serHour > 11){
							var postfix = "PM";
						} else {
							var postfix = "AM";
						}
						if (serHour > 12){
							serHour -= 12;
						}
						events[inc] = new Array(sess.get("Name"), sess.get("Location"), serHour + ":" + serMinutes + " " + postfix,  sess.get("ID"));
						inc++;
					}
				}
			}
			events.sort(sortFunction);
			var size = events.length - 1;
			var data = '{ "currentEvents" : [';
			for(var a = 0; a < events.length; a++) {
				data += '{"name": "' + events[a][0] + '", ';
				data += '"location": "' + events[a][1] + '", ';
				data += '"id": "' + events[a][3] + '", ';
				if (a == size){
					data += '"time": "' + events[a][2] + '"} ';
				}
				else{
					data += '"time": "' + events[a][2] + '"}, ';
				}
			}
			data += ']}';
			
			var arr = JSON.parse(data);		
			var template = Handlebars.compile(source);
	
			$("#currentEventsdiv").append(template(arr)).trigger("create");
			
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}
// when the submit button is pressed on the comment section on the event details page
//	the comment is saved to the server
function comment(){
	var Comment = Parse.Object.extend("Comments");
	var comments = new Comment();
	var input = $("#myComment").val();
	
	comments.set("EventId", _id);
	comments.set("Comment", input);
	
	comments.save(null, {
				success: function(exchange) {
					alert("saved");
					
				},
				error: function(exchange, error) {
					alert("Error");
					$.mobile.changePage("#checkin-main", {reloadPage : true});
				}
			});	
}
// displays all comments about an event when on the event details page
function getComments(){
	var name = "Tom Watts";
	var comments;
	
	var Comment = Parse.Object.extend("Comments");
	var query = new Parse.Query(Comment);
	
	query.equalTo("EventId", _id);
	query.find({
		success: function(result) {
			// result is an instance of Parse.Object
			var source = $("#comments-template").html();
			var size = result.length - 1;
			var data = '{ "commentSection" : [';
			for(var i=0, len=result.length; i<len;i++){
				var comm = result[i];
				
				comments = comm.get("Comment");
				
				data += '{"name": "' + name + '", ';
				
				if (i == size){
					data += '"comment": "' + comments + '"} ';				
				}
				else {
				data += '"comment": "' + comments + '"}, ';
				}
			}
			data += ']}';
			
			var arr = JSON.parse(data);		
			var template = Handlebars.compile(source);
	
			$("#commentSection").append(template(arr)).trigger("create");
			$("#commentSection").listview('refresh');			
			
		},
		error: function(result, error) {
			// error is an instance of Parse.Error.
			alert("Error");
		}
	
	});
}
// displays events the user has checked in to ( I wrote this a couple weeks ago before the UI was updated, so havent tried it out yet)
// ( the template names and div id were just placeholders i made up, they are not actually in the checkin.html file)
function recentCheckins() {
	var checkin = Parse.Object.extend("CheckIn");
	var query = new Parse.Query(checkin);
	
	query.limit(10); // We only want the first 10 to show under Recent Checkins
	
	query.find({
		success: function(results) {
			var source = $("#recentCheckins-template").html();
			var size = results.length -1;
			// Create JSON array 
			var data = '{ "recentCheckins" : [';
			for(var a = 0; a < results.length; a++) {
				data += '{"name": "' + results[a].get("Name") + '", ';
				data += '"eventName": "' + results[a].get("EventName") + '", ';
				data += '"location": "' + results[a].get("location") + '", ';
				data += '"title": "' + results[a].get("title") + '", ';
				if(a == size) {
					data += '"time": "' + results[a].createdAt + '"}';
				} else { 
					data += '"time": "' + results[a].createdAt + '"}, '; 
				}
			}
			data += ']}';
			
			var arr = JSON.parse(data);
			//var html = template(arr);
			var template = Handlebars.compile(source);
			$("#recentCheckinsdiv").html(template(arr)).trigger('create');
			
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}

// coverts the server date to a cleaner format
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
//sort an array
function sortFunction(a, b){
	return ((a[2] < b[2]) ? -1 : ((a[2] > b[2]) ? 1 : 0));
}

function reload() {
	window.location = "#checkin-main";
	location.reload();
}
//function for barcode scanner
function scan() {
        console.log('scanning');
        try {
            window.plugins.barcodeScanner.scan(function(args) {
                console.log("Scanner result: \n" +
                    "text: " + args.text + "\n" +
                    "format: " + args.format + "\n" +
                    "cancelled: " + args.cancelled + "\n");
                
			_id = args.text;
			getSession(_id);
			$.mobile.changePage("#event-details", {transition: "slideup"});

               
        });
        } catch (ex) {
            console.log(ex.message);
        }
 }
 
// converts server time	to local time
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


