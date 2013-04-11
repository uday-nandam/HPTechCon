var currentUser;

$(document).on("pageinit", function() 
{

	var PARSE_APP = "9AeVfYuAP1SWUgUv5bogPOaGwldaZTstNEO8tdJx";
	var PARSE_JS = "w4ffwNOQtdfqDb2tWBXUoPmD7qJrpmHv6xcnuZj4";
	Parse.initialize(PARSE_APP, PARSE_JS);

    $("#loginSubmit").click( function(){
	  	var username = $("#idInput").val();
	  	var password = $("#passwordInput").val();

	  	Parse.User.logIn(username, password, {
	  		success: function(user) {
	  			console.log("User logged in: " + Parse.User.current().getUsername());
	  			$.mobile.changePage("home.html", {
	  				reloadPage: true
	  			});
	  		}, 
	  		error: function(user, error) {
	  			e.preventDefault();
	  			console.log("Failed login" + user + ", with error: " + error);
	  		}
	  	});
  	});

});