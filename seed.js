/*
====================
Node Utils
====================
*/
// var Promise = require('q').Promise;
const request = require('request');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
//====================

/*
====================
Init Firebase
====================
*/
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
//====================


 /*
 ====================
 Init Google Maps
 ====================
 */
// var googleMapsClient = require('@google/maps').createClient({
//   key: 'AIzaSyAC4bVTmV7z7rkLOVmXgxlRBsuYOqaAvQU'
// }); 

// googleMapsClient.placesNearby({
//       language: 'en',
//       location: [-33.865, 151.038],
//       rankby: 'distance',
//       minprice: 1,
//       maxprice: 4,
//       opennow: true,
//       type: 'restaurant'
//     }, function(error, response) {
//     	let place_id = result.place_id;
//     	request("https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyAC4bVTmV7z7rkLOVmXgxlRBsuYOqaAvQU&placeid=" + place_id, function(error, response, body) {
// 			if (error) {
// 				console.log("error");
// 				console.log(error);
// 			}
// 			else if (JSON.parse(body).result) {
// 				console.log("body");
// 				console.log(JSON.parse(body).result.website);
// 			}
// 			else {
// 				console.log("no body");
// 				// console.log(response);
// 			}
// 		});
// });

// //CREATE PAGES
// database.ref("pages").set({
// 	new: "new"
// });

//CREATE ONE EVENT
let setting = database.ref("nope/b").set({
	name: "b"
});

setting.then(function() {
	console.log("done");
}).catch(function() {
	console.log("error");
});

// //READ ONCE
// database.ref("pages").once("value").then(function(snapshot) {
// 	console.log(snapshot.val());
// });

//1. Get location from user

//2. Use Maps API to search for companies for each subject

//3. Get results' websites

//4. Scrape each site for a facebook page
