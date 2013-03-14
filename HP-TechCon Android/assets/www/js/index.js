var currentUser;

$(document).bind("mobileinit", function(){
	$.mobile.ajaxLinksEnabled = false;
});

$(document).on("pageinit", function() 
{
    $("#loginSubmit").click( function(){
	  	var username = $("#idInput").val();
	  	var password = $("#passwordInput").val();

	  	Parse.User.logIn(username, password, {
	  		success: function(user) {
	  			console.log("User logged in: " + Parse.User.current().getUsername());
	  			$.mobile.changePage("home.html", {
	  				dataUrl:"home.html",
	  				transition: "pop"
	  			});
	  		}, 
	  		error: function(user, error) {
	  			console.log("Failed login" + user + ", with error: " + error);
	  		}
	  	});
  	});

});