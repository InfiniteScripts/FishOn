// Initialize app
var myApp = new Framework7();

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

//Global Trip Identifier (Trip_Name)
var trip_name_var;
//setInterval variable for recording trip points
var tripInterval;

var markersArray = [];
//Global Coord variable
var crd;
// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");

     function geoOnSuccess(pos){
      crd = pos.coords;

       console.log('Your current position is:');
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
 
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: crd.latitude, lng: crd.longitude},
        zoom: 15,
        disableDefaultUI: true
    });
  }

  navigator.geolocation.getCurrentPosition(geoOnSuccess, geoOnError); 

 
});

myApp.onPageInit('trip', function (page) {
    
    
    //document.getElementById("record-catch").addEventListener("click", recordCatch );
});

myApp.onPageInit('record-catch', function (page) {
    
   
   
});

var db = window.openDatabase("FishOnDB", "1.0", "FishOn Database", 100000); 
document.addEventListener("deviceready", onDeviceReady, false);
 
function onDeviceReady() {

   // Create Table
   db.transaction(populateDB, errorCB, successCB);

   // Select records
   fetchData();

   document.getElementById("start-trip").addEventListener("click", startTrip );
   document.getElementById("end-trip").addEventListener("click", endTrip );
   document.getElementById("record-catch").addEventListener("click",recordCatch );
   document.getElementById("record-catch-button").addEventListener("click",saveCatch );
   document.getElementById("add-catch-image").addEventListener("click", addCatchImg );
   document.getElementById("close-catch").addEventListener("click", closeCatch );
   document.getElementById("close-view-catch").addEventListener("click", closeViewCatch );

 

}

function populateDB(tx){
   tx.executeSql('CREATE TABLE IF NOT EXISTS trips (trip_id INTEGER PRIMARY KEY AUTOINCREMENT,trip_name TEXT NOT NULL, date TEXT NOT NULL, start TEXT DEFAULT CURRENT_TIMESTAMP, end TEXT )');
   tx.executeSql('CREATE TABLE IF NOT EXISTS trip_points (trip_point_id INTEGER PRIMARY KEY AUTOINCREMENT,trip_name TEXT NOT NULL, latitude TEXT NOT NULL, longitude TEXT NOT NULL )');
   tx.executeSql('CREATE TABLE IF NOT EXISTS catches (catch_id INTEGER PRIMARY KEY AUTOINCREMENT,trip_id INT NOT NULL, date TEXT NOT NULL, catch_time TEXT DEFAULT CURRENT_TIMESTAMP, catch_size TEXT NOT NULL, catch_type TEXT, lure TEXT, notes TEXT )');
}

  // Fetch all records
function fetchData(){
   db.transaction(function(tx){
 
    tx.executeSql("select * from trips",[],function(tx1,result){
     var len = result.rows.length;
 
     for (var i=0; i<len; i++){
      var note = result.rows.item(i).trip_name;

      // Add list item
      var ul = document.getElementById("list");
      var li = document.createElement("li");
      li.appendChild(document.createTextNode(note));
      ul.appendChild(li);
     }
 
    },errorCB);
   }, errorCB, successCB); 
}
 
function clearOverlays() {
  for (var i = 0; i < markersArray.length; i++ ) {
    markersArray[i].setMap(null);
  }
  markersArray.length = 0;
}

function closeCatch(){
  document.getElementById('catch-holder').classList.add('hidden');
}
function closeViewCatch(){
  document.getElementById('view-catch').classList.add('hidden');
}

function errorCB(err) {
  console.log('Error processing SQL: '+err.code);
}

function successCB() {
  console.log('SQL Successfull');
}

function startTrip(){

  clearOverlays();

	function geoOnSuccess(pos){
  		crd = pos.coords;
	}

	navigator.geolocation.getCurrentPosition(geoOnSuccess, geoOnError);

	console.log('Your current position is:');
  console.log(`Latitude : ${crd.latitude}`);
 	console.log(`Longitude: ${crd.longitude}`);

	trip_name_var =  "trip_" + Date.now();
  
  db.transaction(function(tx){
    tx.executeSql(`INSERT INTO trips(trip_name, date, start, end) VALUES (${trip_name_var}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '' )`, [], errorCB, successCB);
  });
  
 // document.getElementById('trip-title').innerHTML = trip_name_var;

  point = new google.maps.LatLng(crd.latitude,crd.longitude);
    addMarker(point);

  	log_trip_point(trip_name_var, crd.latitude, crd.longitude);
 
	  tripInterval = window.setInterval(timed_point_log, 100000);

  	document.getElementById('start-trip').classList.add('hidden'); 
  	document.getElementById('resume-trip').classList.add('hidden');
  	document.getElementById('end-trip').classList.remove('hidden');
  	document.getElementById('record-catch').classList.remove('hidden');
}

function endTrip(){
	clearInterval(tripInterval);
	db.transaction(function(tx){
    	tx.executeSql(`UPDATE trips SET end = CURRENT_TIMESTAMP WHERE trip_name = ${trip_name_var}`);
  	});
  	console.log('trip ended');
	 document.getElementById('start-trip').classList.remove('hidden'); 
	 document.getElementById('resume-trip').classList.remove('hidden'); 
  	document.getElementById('end-trip').classList.add('hidden');
  	document.getElementById('record-catch').classList.add('hidden');
}


function log_trip_point(trip_name, latitude, longitude){
	db.transaction(function(tx){
    	tx.executeSql(`INSERT INTO trip_points(trip_name, latitude, longitude) VALUES (${trip_name}, ${latitude}, ${longitude})`, [], errorCB, successCB);
  	});

    console.log('Your current position is:');
  	console.log(`Latitude : ${crd.latitude}`);
  	console.log(`Longitude: ${crd.longitude}`);

}

function timed_point_log(){
	function geoLoopOnSuccess(pos){
  		crd = pos.coords;
  		log_trip_point(trip_name_var, crd.latitude, crd.longitude);
      point = new google.maps.LatLng(crd.latitude,crd.longitude);
      addMarker(point);
  		console.log(`Timed Log fire : ${trip_name_var}`);
	}
	navigator.geolocation.getCurrentPosition(geoLoopOnSuccess, geoOnError);
}

    
function addMarker(location) {
  var image = 'http://www.infinitescripts.com/wp-content/uploads/2017/11/Icon_green_dot-e1510573551380.png';
  marker = new google.maps.Marker({
    position: location,
    map: map, 
    icon: image,
    zIndex: 2
  });
  map.setCenter(marker.getPosition());
  markersArray.push(marker);
}

function addCatchMarker(location){
  var image = 'http://www.infinitescripts.com/wp-content/uploads/2017/11/fish-e1510613551994.png';
  marker = new google.maps.Marker({
    position: location,
    map: map,
    icon: image,
    zIndex: 5
  });
  google.maps.event.addListener(marker, 'click', function() {
    document.getElementById('view-catch').classList.remove('hidden');
    //alert(this.position);
  });
  markersArray.push(marker);
}
function geoOnError(err) {
	console.warn(`ERROR(${err.code}): ${err.message}`);
};


function recordCatch(){
  document.getElementById('catch-holder').classList.remove('hidden'); 

 
}

function saveCatch(){
   function recordLoopOnSuccess(pos){
      crd = pos.coords;
      log_trip_point(trip_name_var, crd.latitude, crd.longitude);
      point = new google.maps.LatLng(crd.latitude,crd.longitude);
      addCatchMarker(point);
      console.log(`Timed Log fire : ${trip_name_var}`);
  }
  navigator.geolocation.getCurrentPosition(recordLoopOnSuccess, geoOnError);


  var imageURI =  document.getElementById('catch-image').src;
  var catch_type =  document.getElementById('type').value;
  var lure =  document.getElementById('lure').value;
  var notes =  document.getElementById('notes').value;
  db.transaction(function(tx){
    tx.executeSql(`INSERT INTO catches(trip_name, latitude, longitude, imageURI, catch_type, lure, notes) VALUES (${trip_name}, ${latitude}, ${longitude},${imageURI}, ${catch_type}, ${lure}, ${notes})`, [], errorCB, successCB);
  });
  
   document.getElementById('catch-holder').classList.add('hidden'); 
}

function addCatchImg(){
	navigator.camera.getPicture(onCameraSuccess, onFail, { quality: 50,
    destinationType: Camera.DestinationType.FILE_URI });

	function onCameraSuccess(imageURI) {
    	var image = document.getElementById('catch-image');
    	image.src = imageURI;
	   
	}

	function onFail(message) {
    	alert('Failed because: ' + message);
	}
}