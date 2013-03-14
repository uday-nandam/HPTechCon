window.onload = function() {
  var source = document.getElementById('people-template').innerHTML;
  var template = Handlebars.compile(source);

  var data = { people: [
    {firstname: "Steve", lastname: "Johnson", city: "London" },
    {firstname: "Lisa", lastname: "Carlsen", city: "New York" },
    {firstname: "Markus", lastname: "Meier", city: "Berlin" }
  ]};
  document.getElementById('content').innerHTML = template(data);
};