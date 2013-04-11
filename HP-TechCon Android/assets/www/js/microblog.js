
var myBlogPostsTemplate;
var myBlogPostsTemplateCompiled;
var editBlogPostTemplate;
var editBlogPostTemplateCompiled;
var microBlogFeedTemplate;
var microBlogFeedTemplateCompiled;

$(function() {

	var PARSE_APP = "9AeVfYuAP1SWUgUv5bogPOaGwldaZTstNEO8tdJx";
	var PARSE_JS = "w4ffwNOQtdfqDb2tWBXUoPmD7qJrpmHv6xcnuZj4";

	Parse.initialize(PARSE_APP, PARSE_JS);

	console.log(Parse.User.current());

    myBlogPostsTemplate = $("#myBlogPosts-template").html();
    myBlogPostsTemplateCompiled = Handlebars.compile(myBlogPostsTemplate);
    editBlogPostTemplate = $('#editBlogPost-template').html();
    editBlogPostTemplateCompiled = Handlebars.compile(editBlogPostTemplate);
    microBlogFeedTemplate = $("#microBlogFeed-template").html();
    microBlogFeedTemplateCompiled = Handlebars.compile(microBlogFeedTemplate);

	//New Blog Post Submit
    $("#submitNewPost").click(function(e) {
    	//retrieve the value from the text area
    	var blogContent = $("#blogNote").val();
    	var currentUser = Parse.User.current();

    	submitNewPost(blogContent, "111111");
  	});

	$(document).delegate('#microblog-mine', 'pageinit', function(event) {
		
		fetchMyMicroBlogFeed();

		$("#myBlogPosts").on('click', '#myBlogPostsList li', function(e) {
			e.preventDefault();
			console.log(e);
			editBlogPost(e.target.id);
			$.mobile.changePage('#microblog-edit');
		}); 
	});

	$(document).delegate("#microblog-edit", 'pageinit', function(event) {
		
		$("#editpost").on('click', '#cancelEdit', function(e) {
			e.preventDefault();
			$.mobile.changePage('#microblog-mine');
		});

		$("#editpost").on('click', '#saveEdit', function(e) {
			e.preventDefault();
			saveEditBlogPost($("#saveEdit").data("postid"), $("#savedNote").val());
			$.mobile.changePage("#microblog-mine");
		});

		$("#editpost").on('click', '#deletePost', function(e) {
			e.preventDefault();
			console.log("Delete post yay");
			//deleteEditBlogPost($("saveEdit").data("postid"));
		});
	});

    //fetch microblog feed
    fetchMicroBlogFeed();

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

function fetchMicroBlogFeed()
{
	var MicroBlog = Parse.Object.extend("Microblog");
	var query = new Parse.Query(MicroBlog);
	query.find( {
		success: function(results) {
			var data = '{ "feed" : [';
			for(var a = 0; a < results.length; a++) {
				time = convertTime(results[a].createdAt);
				data += '{"post_content": "' + results[a].get("post_content") + '", ';
				data += '"post_id": "' + results[a].id + '",';
				if (a == results.length-1) {
					data += '"posted_at": "' + time + '"}';
				}
				else {
					data += '"posted_at": "' + time + '"},';
				}
			}
			data += ']}';

			var arr = JSON.parse(data);
			$("#microBlogFeed").html(microBlogFeedTemplateCompiled(arr)).trigger('create');
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
			
			var arr = JSON.parse(data);
			//template1 = Handlebars.compile(templateSource);
			$("#myBlogPosts").html(myBlogPostsTemplateCompiled(arr)).trigger('create');
			$("#myBlogPosts ul").listview('create');
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
