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
