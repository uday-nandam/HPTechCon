var PARSE_APP = "9AeVfYuAP1SWUgUv5bogPOaGwldaZTstNEO8tdJx";
var PARSE_JS = "w4ffwNOQtdfqDb2tWBXUoPmD7qJrpmHv6xcnuZj4";

var userID = "123456";
var _id = 0;
var _name = "";
var _location = "";
var _speaker = ""; 
var _time = "";
var title = "";

//$('.ui-page').on('pagehide', function(){$(this).remove(); });
Parse.initialize(PARSE_APP, PARSE_JS);
checkEvents();


function searchSession(){
	var input = $("#checkinInput").val(); // Retrieve what the user searched for.
	_id = input;
	
	Session = Parse.Object.extend("sessions");
	
	query = new Parse.Query(Session);
	
	query.equalTo("ID", _id);
	query.find({
		success: function(result) {
			// result is an instance of Parse.Object
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
			
			var html = template(data);
			$("#eventDetails").html(template(data));
		},
		error: function(result, error) {
			// error is an instance of Parse.Error.
			alert("Error");
		}
	});
	$("#checkinInput").val("");
}

 function checkInConfirm(){ 	
 	
 	var name;
 	var locat;
 	
	var CheckIn = Parse.Object.extend("CheckIn");
	var checkin = new CheckIn();
	
	checkin.set("EventId", _id);
	checkin.set("UserID", userID);
	checkin.set("EventName", _name);
	/*
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
			
			
		}
	});
	
	wait();
	
	checkin.set("Name", name);
	checkin.set("location", locat);
	checkin.set("Title", title);
	*/
	var date = new Date();
 	var time = convertTime(date);
 	
	checkin.save(null, {
		success: function(exchange) {
			alert("You have successfully checked into " + _name + " at " + time);
		},
		error: function(exchange, error) {
			alert("Error");
		}
	});	
	$.mobile.changePage("#checkin-main", {transition: "slideup"});
 }
 
// checks the system time against the parse server data to 
//  see if there are events upcomming
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

function getSession(id){

	Session = Parse.Object.extend("sessions");
	_id = id;
	var query = new Parse.Query(Session);
	
	query.equalTo("ID", id);
	query.find({
		success: function(result) {
			// result is an instance of Parse.Object
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
			
			var html = template(data);
			$("#eventDetails").html(template(data));
		},
		error: function(result, error) {
			// error is an instance of Parse.Error.
			alert("Error");
		}
	});
}

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

function sortFunction(a, b){
	return ((a[2] < b[2]) ? -1 : ((a[2] > b[2]) ? 1 : 0));
}

function reload() {
	window.location = "#checkin-main";
	location.reload();
}

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

function wait(){
	if (title == ""){
		setTimeout("wait()",1000);
	}
}
