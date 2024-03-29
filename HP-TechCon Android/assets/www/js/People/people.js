var userID;
var _personID;
var _eventID;

var peopleTemplate;
var peopleTemplateCompiled;
var peopleDetailsTemplate;
var peopleDetailsTemplateCompiled;
var peopleCheckInTemplate;
var peopleCheckInTemplateCompiled;
var peopleMicroTemplate;
var peopleMircroTemplateCompiled;
var peopleExchangeTemplate;
var peopleExchangeTemplateCompiled;

$(function() {

	var PARSE_APP = "9AeVfYuAP1SWUgUv5bogPOaGwldaZTstNEO8tdJx";
	var PARSE_JS = "w4ffwNOQtdfqDb2tWBXUoPmD7qJrpmHv6xcnuZj4";

	Parse.initialize(PARSE_APP, PARSE_JS);
	
	userID = Parse.User.current().getUsername();
	
	peopleTemplate = $("#people-template").html();
    peopleTemplateCompiled = Handlebars.compile(peopleTemplate);
    
    peopleDetailsTemplate = $("#peopleDetails-template").html();
    peopleDetailsTemplateCompiled = Handlebars.compile(peopleDetailsTemplate);
    
    peopleCheckInTemplate = $("#peopleCheckIn-template").html();
    peopleCheckInTemplateCompiled = Handlebars.compile(peopleCheckInTemplate);
    
    peopleMicroTemplate = $("#peopleMicro-template").html();
    peopleMicroTemplateCompiled = Handlebars.compile(peopleMicroTemplate);
    
    peopleExchangeTemplate = $("#peopleExchanges-template").html();
    peopleExchangeTemplateCompiled = Handlebars.compile(peopleExchangeTemplate);
	
	$("#peoplediv").on('click', '#peopleList li', function(e) {
		e.preventDefault();
		_personID = e.target.id;
		getPersonDetails();
		getPeopleCheckins();
		getPeopleMicros();
		getPeopleExchanges();
		$.mobile.changePage('#person-details');
	}); 
	
	$(document).delegate('#person-details', 'pageinit', function(event) {
		
		$("#peopleEvents").on('click', '#peopleCheckIn li', function(e) {
			e.preventDefault();
			_eventID = e.target.id;
			$.mobile.changePage('#event-details');
		}); 
		
		$("#peopleEvents").on('click', '#peopleExchange li', function(e) {
			e.preventDefault();
			_eventID = e.target.id;
			$.mobile.changePage('#event-details');
		});
	});
	
	getPeople();

});

function getPeople(){
	var name;
	var lastName;
	var img;
	
	var people = Parse.Object.extend("employee");

	var query = new Parse.Query(people);
	query.ascending("Last_Name");
	
	query.find({
		success: function(result) {
			
			var data = '{ "peopleList" : [';
			for(var i=0; i < result.length ;i++){
				name = result[i].get("name");
				lastName = result[i].get("Last_Name");
				img = result[i].get("picture").url;
				_personID = result[i].get("employee_id");
				
				
				data += '{"name": "' + name + '", ';
				data += '"id": "' + _personID + '", ';
				data += '"lastName": "' + lastName + '", ';
				
				if (i == result.length - 1){
					data += '"image": "' + img + '"} ';				
				}
				else {
				data += '"image": "' + img + '"}, ';
				}
			}
			data += ']}';
			
			var arr = JSON.parse(data);		
			
			$("#peoplediv").html(peopleTemplateCompiled(arr)).trigger('create');
			$("#peoplediv ul").listview('refresh');			
			
		},
		error: function(result, error) {
			// error is an instance of Parse.Error.
			alert("Error");
		}
	
	});
				
}
