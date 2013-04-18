
var myBlogPostsTemplate;
var myBlogPostsTemplateCompiled;
var editBlogPostTemplate;
var editBlogPostTemplateCompiled;
var microBlogFeedTemplate;
var microBlogFeedTemplateCompiled;
var viewMicroBlogTemplate;
var viewMicroBlogTemplateCompiled;

$(function() {

	var PARSE_APP = "9AeVfYuAP1SWUgUv5bogPOaGwldaZTstNEO8tdJx";
	var PARSE_JS = "w4ffwNOQtdfqDb2tWBXUoPmD7qJrpmHv6xcnuZj4";

	Parse.initialize(PARSE_APP, PARSE_JS);

	console.log(Parse.User.current());

/*
    myBlogPostsTemplate = $("#myBlogPosts-template").html();
    myBlogPostsTemplateCompiled = Handlebars.compile(myBlogPostsTemplate);
    editBlogPostTemplate = $('#editBlogPost-template').html();
    editBlogPostTemplateCompiled = Handlebars.compile(editBlogPostTemplate);
    microBlogFeedTemplate = $("#microBlogFeed-template").html();
    microBlogFeedTemplateCompiled = Handlebars.compile(microBlogFeedTemplate);
*/

    //My microblog entries
	$(document).delegate('#microblog-mine', 'pageinit', function(event) {
    
	    myBlogPostsTemplate = $("#myBlogPosts-template").html();
	    myBlogPostsTemplateCompiled = Handlebars.compile(myBlogPostsTemplate);

		$("#myBlogPosts").on('click', '#myBlogPostsList li', function(e) {
			e.preventDefault();
			console.log(e);
			editBlogPost(e.target.id);
			$.mobile.changePage('#microblog-edit');
		}); 

	    console.log('pageinit');

	});

	$(document).delegate('#microblog-mine', 'pagebeforeshow', function(event) { 
		
		console.log("pageshow");

		fetchMyMicroBlogFeed();
	});

	$(document).delegate("#microblog-view", "pageinit", function(event) {

		viewMicroBlogTemplate = $("#view-microblog-template").html();
		viewMicroBlogTemplateCompiled = Handlebars.compile(viewMicroBlogTemplate);

	});

	//Edit page
	$(document).delegate("#microblog-edit", 'pageinit', function(event) {

		editBlogPostTemplate = $('#editBlogPost-template').html();
    	editBlogPostTemplateCompiled = Handlebars.compile(editBlogPostTemplate);
		
		$("#editpost").on('click', '#cancelEdit', function(e) {
			e.preventDefault();
			$.mobile.changePage('#microblog-mine');
		});

		$("#editpost").on('click', '#saveEdit', function(e) {
			e.preventDefault();
			$.mobile.loading('show');
			saveEditBlogPost($("#saveEdit").data("postid"), $("#savedNote").val());
			setTimeout(function(){ $.mobile.changePage("#microblog-mine") }, 1500);
		});

		$("#editpost").on('click', '#deletePost', function(e) {
			e.preventDefault();
			console.log("Delete post yay");
			//deleteEditBlogPost($("saveEdit").data("postid"));
		});
	});

	//home page main, not microblog page
	$(document).delegate("#home-main", "pageinit", function(event) {

		microBlogFeedTemplateHome = $("#microBlogFeedHome-template").html();
		microBlogFeedTemplateHomeCompiled = Handlebars.compile(microBlogFeedTemplateHome);

		//use a different template for the home page
		fetchMicroBlogFeed(microBlogFeedTemplateHomeCompiled, 5);

		$("#microBlogFeed").delegate("ul#microblog-blurb li", "click", function(e) {
			var id = $(this).attr('id');
			e.preventDefault();
			$.mobile.changePage("microblog.html", {
				dataUrl: "#microblog-view",
				reloadPage: true
			});
			viewBlogPost(id);
		});

	});

	//Main page for Microblog
	$(document).delegate("#microblog-main", 'pageinit', function(event) {

		microBlogFeedTemplate = $("#microBlogFeed-template").html();
    	microBlogFeedTemplateCompiled = Handlebars.compile(microBlogFeedTemplate);

		//New Blog Post Submit
	    $("#submitNewPost").click(function(e) {
	    	//retrieve the value from the text area
	    	var blogContent = $("#blogNote").val();
	    	var currentUser = Parse.User.current();
	    	$.mobile.loading('show');
	    	submitNewPost(blogContent, "111111");
	    	setTimeout( function() { 
				$.mobile.changePage(window.location.href, {
				        allowSamePageTransition: true,
				        transition: 'none',
				        reloadPage: true,
				        changeHash: false
				    });
			}, 1500);
	  	});

	    //fetch microblog feed with unlimited length
	    fetchMicroBlogFeed(microBlogFeedTemplateCompiled, 0);

		$("#microBlogFeed").delegate("ul#blogNewsfeed li", "click", function(e) {
			e.preventDefault();
			viewBlogPost($(this).attr('id'));
			$.mobile.changePage("#microblog-view");
		});

	});

 });

function deleteEditBlogPost(inPostId) {
	alert("wut");
}

function saveEditBlogPost(inPostId, inPostContent)
{
	var MicroBlog = Parse.Object.extend("Microblog");
	var query = new Parse.Query(MicroBlog);
	query.get(inPostId, {
		success: function(object) {
			object.set("post_content", inPostContent);
			object.save();
			console.log("wutttt saved");
		},
		error: function(error) {
			console.log("Failed to update object " + inPostId + ", \n" + error);
		}
	});
}

function viewBlogPost(blogPostId) 
{
	var BlogPost = Parse.Object.extend("Microblog");
	var query = new Parse.Query(BlogPost);
	query.get(blogPostId, {
		success: function(object) {
			var data = {
				post_content: object.get("post_content"),
				post_id: object.id,
				posted_at: convertTime(object.createdAt)
			};
			console.log(data);
			$("#view-microblog").html(viewMicroBlogTemplateCompiled(data)).trigger('create');
		},
		error: function(error) {
			console.log("failed to find blog post with id: " + blogPostId + "\n" + error);
		}
	})
}

function editBlogPost(blogPostId)
{
	var BlogPost = Parse.Object.extend("Microblog");
	var query = new Parse.Query(BlogPost);
	query.get(blogPostId, {
		success: function(object) {
			var data = {
				post_content: object.get("post_content"),
				post_id: object.id,
				posted_at: convertTime(object.createdAt)
			};
			console.log(data);
			$("#editpost").html(editBlogPostTemplateCompiled(data)).trigger('create');
		},
		error: function(error) {
			console.log("failed to find blog post with id: " + blogPostId + "\n" + error);
		}
	})
}

function submitNewPost(blogcontent, currentuser)
{
	//setup Microblog object and the properties
	var MicroBlog = Parse.Object.extend("Microblog");
	var microBlog = new MicroBlog();
	microBlog.set("post_author", currentuser);
	microBlog.set("post_content", blogcontent);

	//save the object to parse
	microBlog.save(null, {
		success: function(microBlog) {
			//Success
			console.log("Success!");
		},
		error: function(microBlog) {
			console.log("error fuck");
		}
	});
}

function fetchMicroBlogFeed(inTemplate, inLimit)
{
	var limit;
	var MicroBlog = Parse.Object.extend("Microblog");
	var query = new Parse.Query(MicroBlog);
	query.descending("updatedAt");
	query.find( {
		success: function(results) {
			var data = '{ "feed" : [';

			if(inLimit != 0) {
				limit  = inLimit;
			} else {
				limit = results.length;
			}

			for(var a = 0; a < limit; a++) {
				time = convertTime(results[a].createdAt);
				data += '{"post_content": "' + results[a].get("post_content") + '", ';
				data += '"post_id": "' + results[a].id + '",';
				if (a == limit-1) {
					data += '"posted_at": "' + time + '"}';
				}
				else {
					data += '"posted_at": "' + time + '"},';
				}
			}
			data += ']}';

			var arr = JSON.parse(data);
			$("#microBlogFeed").html(inTemplate(arr)).trigger('create');
			$("#microBlogFeed ul").listview();
		},
		error: function(error) {
			console.log("Error retrieving micro blog feed: \n" + error);
		}
	});
}

function fetchMyMicroBlogFeed()
{
	var MicroBlogObj = Parse.Object.extend("Microblog");
	var microBlog = new Parse.Query(MicroBlogObj);
	microBlog.equalTo("post_author", '123456');
	microBlog.descending("updatedAt");
	microBlog.find({
		success: function(results) {
			//var templateSource = $("#myBlogPosts-template").html();
			var data = '{ "allMyBlogPosts" : [';
			for(var a = 0; a < results.length; a++) {
				time = convertTime(results[a].createdAt);
				data += '{"post_content": "' + results[a].get("post_content") + '", ';
				data += '"post_id": "' + results[a].id + '",';
				data += '"post_author": "' + results[a].get("post_author") + '",';
				if (a == results.length-1) {
					data += '"posted_at": "' + time + '"}';
				}
				else {
					data += '"posted_at": "' + time + '"},';
				}
			}
			data += ']}';

			console.log(data);
			
			var arr = JSON.parse(data);
			//template1 = Handlebars.compile(templateSource);
			$("#myBlogPosts").html(myBlogPostsTemplateCompiled(arr)).trigger('create');
			$("#myBlogPosts ul").listview('refresh');
		},
		error: function(results) {
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
