var _empLastName;
var _empFirstName;
var _empLocation;
var _empEmail;
var _empDepartment;
var _empTitle;
var _empImage;

function getPersonDetails(){
	var employee = Parse.Object.extend("employee");

	var query = new Parse.Query(employee);
	var id = parseInt(_personID);
	
	query.equalTo("employee_id", id);
	query.find({
		success: function(result) {
			// result is an instance of Parse.Object
			
			
			var emp = result[0];
			
			_empLastName = emp.get("Last_Name");
			_empFirstName = emp.get("name");
			_empLocation = emp.get("location");
			_empEmail = emp.get("work_email");
			_empTitle = emp.get("title");
			_empDepartment = emp.get("department");
			_empImage = emp.get("picture").url;
			
			
					
			var data = {
				lastName: _empLastName, 
				firstName: _empFirstName,
				location: _empLocation,
				email: _empEmail,
				department: _empDepartment,
				title: _empTitle,
				image: _empImage
			};
			
			var html = peopleDetailsTemplateCompiled(data);
			
			$("#peopleDetails").html(peopleDetailsTemplateCompiled(data)).trigger('create');
			$("#peopleDetails ul").listview('refresh');
			
			
			
		},
		error: function(result, error) {
			// error is an instance of Parse.Error.
			alert("Error");
		}
	});
	
}

function getPeopleCheckins(){
	var checkin = Parse.Object.extend("CheckIn");
	var query = new Parse.Query(checkin);
	
	
	query.equalTo("UserID", _personID);
	query.limit(4); // We only want the first 10 to show under Recent Checkins
	query.find({
		success: function(results) {
			
			var size = results.length -1;
			// Create JSON array 
			var data = '{ "peopleCheckins" : [';
			for(var a = 0; a < results.length; a++) {
				data += '{"eventID": "' + results[a].get("EventId") + '", ';
				data += '"eventName": "' + results[a].get("EventName") + '", ';
				data += '"eventLocation": "' + results[a].get("EventLocation") + '", ';
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
			
			$("#peopleCheckInDiv").html(peopleCheckInTemplateCompiled(arr)).trigger('create');
			$("#peopleCheckInDiv ul").listview('refresh');	
			
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}

function getPeopleMicros(){
		var time;
		
		var MicroBlogObj = Parse.Object.extend("Microblog");
		var microBlog = new Parse.Query(MicroBlogObj);
		microBlog.equalTo("post_author", _personID);
		microBlog.limit(4);
		microBlog.find({
			success: function(results) {
				//var templateSource = $("#myBlogPosts-template").html();
				var data = '{ "peopleMicro" : [';
				for(var a = 0; a < results.length; a++) {
					time = convertTime(results[a].createdAt);
					data += '{"post": "' + results[a].get("post_content") + '", ';
					//data += '"post_author": "' + results[a].get("post_author") + '",';
					if (a == results.length-1) {
						data += '"time": "' + time + '"}';
					}
					else {
						data += '"time": "' + time + '"},';
					}
				}
				data += ']}';
				
				var arr = JSON.parse(data);
				//template1 = Handlebars.compile(templateSource);
				$("#peopleMicroDiv").html(peopleMicroTemplateCompiled(arr)).trigger('create');
				$("#peopleMicroDiv ul").listview('create');
			},
			error: function(results) {
				alert("Error: " + error.code + " " + error.message);
			}
		});
}

function getPeopleExchanges(){
	var Exchange = Parse.Object.extend("Exchange");
	var query = new Parse.Query(Exchange);
	var id = parseInt(_personID);
	var time;
	
	query.descending("createdAt");
	query.equalTo("initiatedBy", id);
	query.limit(4); // We only want the first 4 Exchanges to show under Recent Exchanges.
	
	query.find({
		success: function(results) {
			
			// Create JSON array 
			var data = '{ "peopleExchange" : [';
			for(var a = 0; a < results.length; a++) {
				data += '{"Person": "' + results[a].get("initiatedToName") + '", ';
				data += '"id": "' + results[a].id + '", ';
				time = convertTime(results[a].createdAt);
				
				if(a == results.length - 1) {
					data += '"time": "' + time + '"}';
				} else { 
					data += '"time": "' + time + '"}, '; 
				}
			}
			data += ']}';
			
			var arr = JSON.parse(data);
			
			$("#peopleExchangeDiv").html(peopleExchangeTemplateCompiled(arr)).trigger('create');
			$("#peopleExchangeDiv ul").listview('create');
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
