//_________________________________
//Node Utils_______________________
const request = require('request');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const express = require('express');
const router = express.Router();

//_________________________________
//ENV setup________________________
var env, access_token;
fs.stat(".env/.env.js", function(err, stat) {
	if(err == null) {
		console.log("dev");
		env = require("./.env/.env.js");
	} 
	else if(err.code == 'ENOENT') {
		console.log("prod");
		env = {
			facebookAppId: process.env.facebookAppId,
			facebookAppSecret: process.env.facebookAppSecret
		};
	}
	access_token = env.facebookAppId + "|" + env.facebookAppSecret;
});
//_________________________________
//Firebase Setup___________________
var firebase = require("firebase");
var config = {
  apiKey: "AIzaSyByp6ZYTYrwQ4M0g4h2C1pDtyMUI08LA0g",
  authDomain: "nationaldata-fcd92.firebaseapp.com",
  databaseURL: "https://nationaldata-fcd92.firebaseio.com",
  storageBucket: "nationaldata-fcd92.appspot.com",
};
firebase.initializeApp(config);
var database = firebase.database();
//signInWithEmailAndPassword or createUserWithEmailAndPassword
firebase.auth().signInWithEmailAndPassword("kowalmax.s@gmail.com", "testtest").catch(function(error) {
	// Handle Errors here.
	console.log(error.code);
	console.log(error.message);
});

//_________________________________
//ROUTES___________________________
router.get('/events/:lat/:long', (req, res) => {
	//1. all events.orderByChild('lat')
	/*var ref = firebase.database().ref("events/");
	ref.once("value")
	  .then(function(snapshot) {
	    res.json(snapshot.val());
	  });
	*/
	// TODO: create a query to get all events that within a certain lat/long range of the lat/long passed in.
	//2. if the number of events we get from this query is small, we should perform a search to get more events in our DB.
	getMoreEventsAtLocation(req.params.lat, req.params.long, req.query, res);
});

function getMoreEventsAtLocation(lat, long, queryData, res) {
	//when all of the promises returned by the function below are done we'll operate on the data.
	Promise.all(makeGMapsNearbyRequestPromises(lat, long, queryData)).then(function(results){
		//2D Array, each row is an event type and each column is a place that might have events
		//Need to get place details for each place in order to get the website
		results.forEach( (placeList) => {
			let timeoutDelay = 250;
			placeList.forEach((place) => {
				setTimeout(getPlaceDetails, timeoutDelay, place);
				timeoutDelay += 250;
			});
		});
	    res.json(results);
	});

	//Send a request to get maps data for each event type
	function makeGMapsNearbyRequestPromises(lat, long, queryData) {
		let promises = [];
		for (var eventType in queryData.types) {
			if (queryData.types[eventType] === "true") {
				//push the request promise into an array
				promises.push(makeOneGMapsNearbyRequest(lat, long, queryData, eventType));
			}
		}
		return promises;

		//makes a promise that only resolves once all of the cursored data is acquired
		function makeOneGMapsNearbyRequest(lat, long, queryData, eventType) {
			var promise = new Promise((resolve, reject) => {
				getAllGmapsDataFromRequest(lat, long, queryData, eventType).then( (results) => {
					resolve(results);
				});
			});
			return promise;

			function getAllGmapsDataFromRequest(lat, long, queryData, eventType) {
				var promise = new Promise((resolve, reject) => {
					
					//recursively calls itself in order to get cursored data from first request and will
					//  eventually resolve with all of the cursored data.
					cursorGMapsRequest(lat, long, queryData, eventType);

					function cursorGMapsRequest(lat, long, queryData, eventType, url, results) {
						results = results || [];
						url = url || "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + lat + "," + long +
						"&radius=" + queryData.radius + "&keyword=" + eventType + "&key=AIzaSyAC4bVTmV7z7rkLOVmXgxlRBsuYOqaAvQU";
						request(url, (error, response, body) => {
							body = JSON.parse(body);
							if (!error && response.statusCode === 200) {
								results = results.concat(body.results);
								if (body.next_page_token) {
									url = url.split("&pagetoken=")[0] + "&pagetoken=" + body.next_page_token;
									//next_page_token is not active immediately, we must wait a moment.
									setTimeout(cursorGMapsRequest, 2000, lat, long, queryData, eventType, url, results);
								}
								else {
									resolve(results);
								}
								
							}
							else {
								console.log(error);
								resolve(results);
							}
						});
					}
				});

				return promise;
			}
		}
	}

	function getPlaceDetails(place) {
		let url = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + place.place_id + "&key=AIzaSyAC4bVTmV7z7rkLOVmXgxlRBsuYOqaAvQU"
		request(url, function(error, response, body) {
			if (!error && response.statusCode === 200) {
				body = JSON.parse(body);
				if (body.result.website && (body.result.website !== "undefined")) {
					getFacebookPageFromWebsite(body.result.website);
				}
			}
			else {
				console.log(error);
			}
		});
	}
}

	function getBusinessWebsiteFromYelp(yelpURL, businessName) {
		var options = {
			url: yelpURL,
			headers: {
				"user-agent": "Chrome/51.0.2704.103"
			}
		};
		request(options, function (error, response, body) {
			if (!error) {
				try {
					const dom = new JSDOM(body);
					let websiteURL;
					let urlSpan = dom.window.document.getElementsByClassName("biz-website")[0];
					if (urlSpan && urlSpan.children[1] && urlSpan.children[1].innerHTML) {
						websiteURL = urlSpan.children[1].innerHTML;
						websiteURL = processUrl(websiteURL);
						getFacebookPageFromWebsite(websiteURL);
					}
					else {
						console.log("yelp didn't have a url for " + businessName);
					}
				}
				catch (e) {
					console.log('jsdom error.');
				}
			}
			else {
				console.log("error requesting the business website.");
			}
		});
	}
	function processUrl(businessURL) {
		if (businessURL.indexOf("www.") === -1 && businessURL.indexOf("http") === -1) {
			return "http://www." + businessURL;
		}
	}
	function getFacebookPageFromWebsite(businessWebsite) {
		var options = {
			url: businessWebsite,
			headers: {
				"user-agent": "Chrome/51.0.2704.103"
			}
		};
		request(options, function (error, response, body) {
			if (!error) {
				try {
					const dom = new JSDOM(body);
					let found = false;
					var aTags = dom.window.document.getElementsByTagName("a");
					for (let i = 0; i < aTags.length; i++) {
						if (aTags[i].getAttribute("href") && aTags[i].getAttribute("href").indexOf("facebook.com") !== -1) {
							getFacebookEvents(aTags[i].getAttribute("href"));
							found = true;
							break;
						}
					}
					if (!found) {
						console.log("failed to find a facebook link for " + options.url);
					}
				}
				catch(e) {
					console.log("jsdom error.");
				}
			}
			else {
				console.log("error loading business website: " + options.url);
			}
		});
	}
	function getFacebookEvents(pageURL) {
		//get the name from the facebook.com/
		let nameIndex = pageURL.indexOf("facebook.com/") + "facebook.com/".length;
		let name = pageURL.substring(nameIndex);
		name = name.split("/")[0];
		//send request for events
		var untilValue;
		let date = new Date();
		if (date.getMonth() === 12 || date.getMonth() === 11) {
			//set the until to year++/2/15
			untilValue = (date.getFullYear + 2) + "-1-15";
		}
		else {
			untilValue = date.getFullYear() + "-" + (date.getMonth() + 2) + "-15";  
		}
		let url = "https://graph.facebook.com/" + name + "/events?fields=is_cancelled,name,place,owner,description,category,start_time&until=" + untilValue + "&since=now&access_token=" + access_token;
		acquireEvents(url);
	}
	function acquireEvents(url) {
		// console.log("acquiring events for " + url);
		request(url, function (error, response, body) {
			if (error) {
				console.log('error loading facebook events');
				// console.log(error + " " + url);
			}
			else if (!JSON.parse(body) || !JSON.parse(body).data) {
				console.log("incorrect facebook url: " + url);
			}
			else {
				let events = JSON.parse(body).data;
				// console.log("found " + events.length + " events for " + url);
				events.forEach(function(event) {
					let newEvent = {
						name: event.name,
						location: event.place.location.street + " " + event.place.location.city + ", " + event.place.location.state,
						facebook_id: event.id,
						host: event.place.name,
						start_time: event.start_time,
						category: event.category,
						description: event.description,
						image: event.cover
					};
					//CREATE ONE EVENT
					let tags = [];
					let setting = database.ref("event_sources/" + newEvent.host + "@" + event.place.id + '/eventListing/' + newEvent.name + "@" + newEvent.facebook_id).set(newEvent);
					setting.then(function() {
						res.send({"status": "success", "message": "saved event to firebase.", "event": event});
					}).catch(function() {
						res.send({"status": "failure", "message": "firebase save on event failed."});
					});
				});
				if (JSON.parse(body).paging && JSON.parse(body).paging.next) {
					acquireEvents(JSON.parse(body).paging.next);
				}
			}
		});
	}

router.post('/events/:owner', (req, res) => {
	if (req.body) {
		let event = req.body;
		//CREATE ONE EVENT
		let tags = [];
		let setting = database.ref("event_sources/" + event.host + "@" + req.params.owner + '/eventListing/' + event.name + "@" + event.facebook_id).set(event);
		setting.then(function() {
			res.send({"status": "success", "message": "saved event to firebase.", "event": event});
		}).catch(function() {
			res.send({"status": "failure", "message": "firebase save on event failed."});
		});
		res.send({"saved": event});
	}
	else {
		res.send({"status": "failure", "message": "no body given to this route."});
	}
		
});

module.exports = router;