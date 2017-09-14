function getLocation() {
	// Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          long: position.coords.longitude
        };
        console.log(pos.lat, pos.long);
        getEvents(pos.lat, pos.long);
      }, function() {
        console.log("error getting location data.");
      });
    } 
    else {
    	console.log("Browser does not support HTML5 geolocation.");
    }
}

function getEvents(lat, long) {
	let url = "/events/" + lat + "/" + long;
	$.get("", function(data, status){
        alert("Data: " + data + "\nStatus: " + status);
    });
}