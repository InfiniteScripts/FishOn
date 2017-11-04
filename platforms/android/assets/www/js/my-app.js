// Initialize app
var myApp = new Framework7();

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
});

myApp.onPageInit('trip', function (page) {
    
    document.getElementById("start-trip").addEventListener("click", startTrip )
});

var db = window.openDatabase("tutorialdb", "1.0", "tutorial database", 1000000); //will create database Dummy_DB or open it
document.addEventListener("deviceready", onDeviceReady, false);
 
function onDeviceReady() {

   // Create Table
   db.transaction(populateDB, errorCB, successCB);

   // Select records
   fetchData();
}

function populateDB(tx){
   tx.executeSql('CREATE TABLE IF NOT EXISTS trips (trip_id INTEGER PRIMARY KEY AUTOINCREMENT,trip_name TEXT NOT NULL, date TEXT NOT NULL, start TEXT DEFAULT CURRENT_TIMESTAMP, end TEXT )');
   tx.executeSql('CREATE TABLE IF NOT EXISTS catches (catch_id INTEGER PRIMARY KEY AUTOINCREMENT,trip_id INT NOT NULL, date TEXT NOT NULL, catch_time TEXT DEFAULT CURRENT_TIMESTAMP, catch_size TEXT NOT NULL, catch_type TEXT, lure TEXT, notes TEXT )');
}

  // Fetch all records
function fetchData(){
  /* db.transaction(function(tx){
 
    tx.executeSql("select * from notes",[],function(tx1,result){
     var len = result.rows.length;
 
     for (var i=0; i<len; i++){
      var note = result.rows.item(i).note;

      // Add list item
      var ul = document.getElementById("list");
      var li = document.createElement("li");
      li.appendChild(document.createTextNode(note));
      ul.appendChild(li);
     }
 
    },errorCB);
   }, errorCB, successCB); */
}
 
function insertData(){
 // db.transaction(insertNote, errorCB, successCB);
}

function insertNote(tx){
 /*  var note = document.getElementById('note').value;
 
   // Insert query
   tx.executeSql("INSERT INTO notes(note) VALUES (?)",[note]);
 
   // Append new list item
   var ul = document.getElementById("list");
   var li = document.createElement("li");
   li.appendChild(document.createTextNode(note));
   ul.appendChild(li); */
}

function errorCB(err) {
  console.log("Error processing SQL: "+err.code);
}

function successCB() {
  console.log('SQL Successfull');
}

function startTrip(){
  var trip_name_var =  "trip_" + Date.now();
  
  db.transaction(function(tx){
    tx.executeSql("INSERT INTO trips(trip_name, date, start, end) VALUES (trip_name_var, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '' )", [], errorCB, successCB);
  });
  
}

function markPoint(){

}

function stopTrip(trip_name_var){
  db.transaction(function(tx){
    tx.executeSql("UPDATE trips SET end = CURRENT_TIMESTAMP WHERE trip_name = trip_name_var");
  });
}

function addCAtch(){
  db.transaction(function(tx){

  });
}

navigator.geolocation.getCurrentPosition(onSuccess, onError);