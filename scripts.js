function getLocation() {
  getEvents(39.707056800000004, -104.9838707);
	// Try HTML5 geolocation.
  // if (navigator.geolocation) {
  //   navigator.geolocation.getCurrentPosition(function(position) {
  //     var pos = {
  //       lat: position.coords.latitude,
  //       long: position.coords.longitude
  //     };
  //     console.log(pos.lat, pos.long);
  //     getEvents(pos.lat, pos.long);
  //   }, function() {
  //     console.log("error getting location data.");
  //   });
  // } 
  // else {
  // 	console.log("Browser does not support HTML5 geolocation.");
  // }
}

function getEvents(lat, long) {
  var data = {
    radius: parseInt(document.getElementById("radius").value),
    types: {
      running: document.getElementById("running").checked,
      climbing: document.getElementById("climbing").checked,
      music: document.getElementById("music").checked,
      hiking: document.getElementById("hiking").checked,
    }
  };
	var url = "/events/" + lat + "/" + long;
  $.ajax({
    type  : "GET",
    url   : url,
    data  : data,
    success: function(data, status){
      console.log(data);
      // data.forEach( (event) => {
      //   renderEvent(event);
      // });
    }
  });
}

function renderEvent(eventData) {
  //event needs: _id, name, address, lat/lng, description, time, date
  // var $div = $("<div>", {id: eventData._id, "class": "event"});
  // $("#eventRenderLocation").append();
}