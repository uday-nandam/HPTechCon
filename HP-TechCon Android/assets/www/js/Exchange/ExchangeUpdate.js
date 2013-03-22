//Exchange Update JS

function saveExchangeNotes() {
	var input = $("#savedNote").val();
	//alert(input);
	var Exchange = Parse.Object.extend("Exchange");
	var query = new Parse.Query(Exchange);
	query.equalTo("objectId", _exchangeId);
	
	query.find({
		success: function(result) {
			result[0].set("comments", input);
			
			result[0].save(null, {
				success: function(exchange) {
					//alert("success");
				},
				error: function(exchange, error) {
					//alert("Error");
				}
			});
			reload();
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}