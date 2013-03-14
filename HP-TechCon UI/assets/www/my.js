// Put your custom code here

/* Script for enter key
$('#exchangeInput').keyup(function (e) {
    if (e.keyCode == 13) {
        //window.location.replace("exchange-new.html")
		alert("Enter submitted");
    }
})*/

// Script for saving exchange notes
function saveExchangeNotes() {
	alert("You have saved your notes.");
}
// Script for camera
function cameraFunction() {
	alert("The camera icon works!");
}
// Script for microphone
function micFunction() {
	alert("The microphone icon works!");
}
// Exchange
function exchgConfirm() {
	var name = "Leeroy Jenkins";
	var time = "2:45 pm";
	alert("Exchange Successful!\nYou have exchanged with " + name + " at " + time + ".");
}
// Check in
function checkInConfirm() {
	var event = "HP Scanner";
	var time = "2:05 pm";
	alert("Check In Successful!\nYou have checked into " + event + " at " + time + ".");
}

/* Autodividers for the all exchanges page
$(document).bind('pagecreate', function () {
$('#allExchanges').listview({
autodividers: true,
autodividersSelector: function( elt ) {
return elt.find('span').text();
}
});*/