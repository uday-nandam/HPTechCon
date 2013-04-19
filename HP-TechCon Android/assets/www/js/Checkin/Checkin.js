var currentEventsTemplate;
var currentEventsTemplateCompiled;
var eventDetailsTemplate;
var eventDetailsTemplateCompiled;
var commentsTemplate;
var commentsTemplateCompiled;
var eventsAttendedTemplate;
var eventsAttendedTemplateCompiled;
var eventCheckedTemplate;
var eventCheckedTemplateCompiled;
var commentscheckedTemplate;
var commentscheckedTemplateCompiled;

var userID;
var _id = 0;
var _name = "";
var _location = "";
var _speaker = ""; 
var _time = "";
var _description = "";
var _inTime = "";
var title = "";


$(function() {

	var PARSE_APP = "9AeVfYuAP1SWUgUv5bogPOaGwldaZTstNEO8tdJx";
	var PARSE_JS = "w4ffwNOQtdfqDb2tWBXUoPmD7qJrpmHv6xcnuZj4";

	Parse.initialize(PARSE_APP, PARSE_JS);
	
	userID = Parse.User.current().getUsername();

    currentEventsTemplate = $("#currentEvents-template").html();
    currentEventsTemplateCompiled = Handlebars.compile(currentEventsTemplate);
    eventDetailsTemplate = $('#eventDetails-template').html();
    eventDetailsTemplateCompiled = Handlebars.compile(eventDetailsTemplate);
    commentsTemplate = $("#comments-template").html();
    commentsTemplateCompiled = Handlebars.compile(commentsTemplate);
    eventsAttendedTemplate = $("#eventsAttended-template").html();
    eventsAttendedTemplateCompiled = Handlebars.compile(eventsAttendedTemplate);
    eventCheckedTemplate = $("#eventChecked-template").html();
    eventCheckedTemplateCompiled = Handlebars.compile(eventCheckedTemplate);
    commentscheckedTemplate = $("#commentschecked-template").html();
    commentscheckedTemplateCompiled = Handlebars.compile(commentscheckedTemplate);

	//Enter search for Event ID
	$("#submitButton").click(function(e) {
		_id = $("#checkinInput").val();
		var currentUser = Parse.User.current();
		
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
				
				else{
					searchSession(_id);
					getComments();
					$.mobile.changePage('#event-details');
				}
			}
		});
	});

	
	$("#currentEventsdiv").on('click', '#currentEvents li', function(e) {
		e.preventDefault();
		_id = e.target.id;
		searchSession(_id);
		getComments();
		$.mobile.changePage('#event-details');
	}); 
    
	$("#recommendedEventsdiv").on('click', '#recommendedEvents li', function(e) {
		e.preventDefault();
		_id = e.target.id;
		searchSession(_id);
		getComments();
		$.mobile.changePage('#event-details');
	}); 
	
		
	$(document).delegate('#checkin-main', 'pagebeforeshow', function(event) { 
		
		console.log("pageshow");
		
		$("#attendedButton").click(function(e) {
			$.mobile.changePage('#event-attended');
		});

		checkEvents();
	});
	
	$(document).delegate('#event-details', 'pageinit', function(event) {

		$("#eventDetails").on('click', '#checkIn', function(e) {
			e.preventDefault();
			checkInConfirm();
			$.mobile.changePage('#checkin-main');
		}); 
		
		$("#eventDetails").on('click', '#checkBack', function(e) {
			e.preventDefault();
			$.mobile.changePage('#checkin-main');
		}); 
		
		$("#commentSection").on('click', '#commentSubmit', function(e) {
			e.preventDefault();
			comment();
			$.mobile.changePage('#checkin-main');
		}); 
	});

	$(document).delegate("#event-attended", 'pagebeforeshow', function(event) {
		recentCheckins();
		
		$("#eventAttended").on('click', '#attendedEvents li', function(e) {
			e.preventDefault();
			console.log(e);
			_id = e.target.id;
			searchChecked(_id);
			getCommentsChecked();
			$.mobile.changePage('#event-checked');
		});

	});
	
	$(document).delegate("#event-checked", 'pageinit', function(event) {
		
		$("#eventChecked").on('click', '#eventSave', function(e) {
			e.preventDefault();
			//createNote();
			$.mobile.changePage('#checkin-main');
		});
		
		$("#commentschecked").on('click', '#commentSubmit', function(e) {
			e.preventDefault();
			comment();
			$.mobile.changePage('#checkin-main');
		});

	});


});

//takes event id as input and queries server for event data.
//then navigates to event details page and appends data to html via template
function searchSession(input){
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
			_description = sess.get("Description");
			
			var locTime = new Date(_time);
			var locDate = convertDate(locTime);
			locTime = convertTime(locTime);
			
					
			var data = {
				name: _name, 
				speaker: _speaker,
				location: _location,
				date: locDate,
				description: _description,
				time: locTime
			};
			
			var html = eventDetailsTemplateCompiled(data);
			
			$("#eventDetails").html(eventDetailsTemplateCompiled(data)).trigger('create');
			$("#eventDetails ul").listview('refresh');
			
			
			
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
 	var lastName;
 	var image;
 	
	var CheckIn = Parse.Object.extend("CheckIn");
	var checkin = new CheckIn();
	
	query1 = new Parse.Query(CheckIn);
	query1.equalTo("EventId", _id);
	query1.find({
		success: function(results){
			if (results.length == 0){
						checkin.set("EventId", _id);
						checkin.set("UserID", userID);
						checkin.set("EventName", _name);
						checkin.set("EventLocation", _location);
						
						var employee = Parse.Object.extend("employee");
						var query = new Parse.Query(employee);
						var myID = parseInt(userID);
						
						query.equalTo("employee_id", myID);
						query.find({
							success: function(result){
								var emp = result[0];
								name = emp.get("name");
								lastName = emp.get("Last_Name");
								image = emp.get("picture").url;
								locat = emp.get("location");
								title = emp.get("title");
								
								checkin.set("firstName", name);
								checkin.set("lastName", lastName)
								checkin.set("location", locat);
								checkin.set("Title", title);
								checkin.set("picture", image);
								
								var date = new Date();
							 	var time = convertTime(date);
							 	
								checkin.save(null, {
									success: function(checkin) {
										//alert("You have successfully checked into " + _name + " at " + time);								
									},
									error: function(checkin, error) {
										alert("Error saving to server");
									}
								});	
							}
						});
			}
			else{
				for(var i=0, len=results.length; i<len;i++){
					var res = results[i];
						
						if (res.get("UserID") == userID){
							alert("You have already checked in to the event");
							var alreadyIn = true;
						}
						
				}
				
				if (!alreadyIn){	
							checkin.set("EventId", _id);
							checkin.set("UserID", userID);
							checkin.set("EventName", _name);
							checkin.set("EventLocation", _location);
							
							employee = Parse.Object.extend("employee");
							query = new Parse.Query(employee);
							userID = parseInt(userID);
							
							query.equalTo("employee_id", userID);
							query.find({
								success: function(result){
									var emp = result[0];
									firstName = emp.get("name");
									lastName = emp.get("Last_Name");
									locat = emp.get("location");
									title = emp.get("title");
									image = emp.get("picture").url;
									
									checkin.set("firstName", firstName);
									checkin.set("lastName", lastName);
									checkin.set("picture", image);
									checkin.set("location", locat);
									checkin.set("Title", title);
									
									var date = new Date();
								 	var time = convertTime(date);
								 	
									checkin.save(null, {
										success: function(checkin) {
											//alert("You have successfully checked into " + _name + " at " + time);								
										},
										error: function(checkin, error) {
											alert("Error saving to server");
										}
									});	
								}
							});
						}
						
				}
			
					
			},
			error: function(checkin, error){
				alert("Error");
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
			
			$("#currentEventsdiv").html(currentEventsTemplateCompiled(arr)).trigger("create");
			$("#currentEventsdiv ul").listview('refresh');
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}
// when the submit button is pressed on the comment section on the event details page
//	the comment is saved to the server
function comment(){
	
	var firstName;
	var lastName;
	var image;
	
	var Comment = Parse.Object.extend("Comments");
	var comments = new Comment();
	var input = $("#myComment").val();
	
	comments.set("EventId", _id);
	comments.set("Comment", input);
	comments.set("Commenter", userID);
	
	var employee = Parse.Object.extend("employee");
	var query = new Parse.Query(employee);
	var myID = parseInt(userID);
	
	query.equalTo("employee_id", myID);
	query.find({
		success: function(result){
			var emp = result[0];
			firstName = emp.get("name");
			lastName = emp.get("Last_Name");
			image = emp.get("picture").url;
			
			comments.set("first_name", firstName);
			comments.set("last_name", lastName);
			comments.set("picture", image);
			
									
			comments.save(null, {
				success: function(exchange) {
					
				},
				error: function(exchange, error) {
					alert("Error");
					$.mobile.changePage("#checkin-main");
				}
			});	
		}
	});
}
// displays all comments about an event when on the event details page
function getComments(){
	var firstName;
	var lastName;
	var image;
	var comments;
	var timeCreated;
	
	var Comment = Parse.Object.extend("Comments");
	var query = new Parse.Query(Comment);
	
	query.equalTo("EventId", _id);
	query.find({
		success: function(result) {
			// result is an instance of Parse.Object
			
			var size = result.length - 1;
			var data = '{ "commentSection" : [';
			for(var i=0, len=result.length; i<len;i++){
				var comm = result[i];
				
				comments = comm.get("Comment");
				firstName = comm.get("first_name");
				lastName = comm.get("last_name");
				image = comm.get("picture");
				timeCreated = comm.createdAt;
				var dateCreated = convertDate(timeCreated);
				timeCreated = convertTime(timeCreated);

				
				data += '{"firstName": "' + firstName + '", ';
				data += '"lastName": "' + lastName + '", ';
				data += '"image": "' + image + '", ';
				data += '"time": "' + timeCreated + '", ';
				data += '"date": "' + dateCreated + '", ';
				
				if (i == size){
					data += '"comment": "' + comments + '"} ';				
				}
				else {
				data += '"comment": "' + comments + '"}, ';
				}
			}
			
			data += ']}';
			
			var arr = JSON.parse(data);		
			
			$("#commentSection").html(commentsTemplateCompiled(arr)).trigger('create');
			$("#commentSection").listview('refresh');			
			
		},
		error: function(result, error) {
			// error is an instance of Parse.Error.
			alert("Error");
		}
	
	});
}
// displays events the user has checked in to 
function recentCheckins() {
	var checkin = Parse.Object.extend("CheckIn");
	var query = new Parse.Query(checkin);
	
	
	query.equalTo("UserID", userID);
	query.limit(10); // We only want the first 10 to show under Recent Checkins
	query.find({
		success: function(results) {
			
			var size = results.length -1;
			// Create JSON array 
			var data = '{ "eventsAttended" : [';
			for(var a = 0; a < results.length; a++) {
				data += '{"id": "' + results[a].get("EventId") + '", ';
				data += '"eventName": "' + results[a].get("EventName") + '", ';
				data += '"location": "' + results[a].get("EventLocation") + '", ';
				var time = results[a].createdAt;
				time = convertTime(time);
				if(a == size) {
					data += '"time": "' + time + '"}';
				} else { 
					data += '"time": "' + time + '"}, '; 
				}
			}
			data += ']}';
			
			var arr = JSON.parse(data);
			
			$("#eventAttended").html(eventsAttendedTemplateCompiled(arr)).trigger('create');
			$("#eventAttended ul").listview('referesh');
			//$('#eventAttended').listview('create');
		
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}
//same as searchSession function but for events already checked into
function searchChecked(input){
	_id = input;
	
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
			_description = sess.get("Description");
			_inTime = sess.createdAt;
			
			var locTime = new Date(_time);
			var locDate = convertDate(locTime);
			locTime = convertTime(locTime);
			
			
			_inTime = convertTime(_inTime);
			
			
			var data = {
				name: _name, 
				speaker: _speaker,
				location: _location,
				date: locDate,
				description: _description,
				time: locTime,
				checkinTime: _inTime
			};
			
			
			var html = eventCheckedTemplateCompiled(data);
			$("#eventChecked").html(eventCheckedTemplateCompiled(data)).trigger('create');
			$("#eventChecked").listview('refresh');
			
			
		},
		error: function(result, error) {
			// error is an instance of Parse.Error.
			alert("Error");
		}
	});
}
//retrieve the comments for the events that have already been checked into
function getCommentsChecked(){
	var firstName;
	var lastName;
	var image;
	var comments;
	var timeCreated;
	
	var Comment = Parse.Object.extend("Comments");
	var query = new Parse.Query(Comment);
	
	query.equalTo("EventId", _id);
	query.find({
		success: function(result) {
			// result is an instance of Parse.Object
			
			var size = result.length - 1;
			var data = '{ "commentSection" : [';
			for(var i=0, len=result.length; i<len;i++){
				var comm = result[i];
				
				comments = comm.get("Comment");
				firstName = comm.get("first_name");
				lastName = comm.get("last_name");
				image = comm.get("picture");
				timeCreated = comm.createdAt;
				var dateCreated = convertDate(timeCreated);
				timeCreated = convertTime(timeCreated);

				
				data += '{"firstName": "' + firstName + '", ';
				data += '"lastName": "' + lastName + '", ';
				data += '"image": "' + image + '", ';
				data += '"time": "' + timeCreated + '", ';
				data += '"date": "' + dateCreated + '", ';
				
				if (i == size){
					data += '"comment": "' + comments + '"} ';				
				}
				else {
				data += '"comment": "' + comments + '"}, ';
				}
			}
			
			data += ']}';
			
			var arr = JSON.parse(data);		
				
	
			$("#commentschecked").html(commentscheckedTemplateCompiled(arr)).trigger("create");
			$("#commentschecked").listview('refresh');			
			
		},
		error: function(result, error) {
			// error is an instance of Parse.Error.
			alert("Error");
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
		searchSession(_id);
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




