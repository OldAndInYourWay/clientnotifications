// ==== Require necessary packages ===== //
var express = require('express');
var listener = express();
var notifier = require('node-notifier');
var path = require('path');
var io = require('socket.io-client');
 
// ==== Start listener to listen at port 4376 ==== //
var client; 

// =================================================== //
// =============== Reconnect ====================== //

var attemptReconnection = function(callback){
	console.log("Attempting reconnect");

	// Try reconnecting to the Notification Server
	client.io.reconnect();

	 	setTimeout(function(){
	 		callback(client.connected);
	 	}, 2000);
};

// =================================================== //
// =============== Retry Reconnecting ====================== //

var enterReconnectionState = function(){
	// Attempt Reconnection
		attemptReconnection(function(isConnected){

			// If connected, 
			// Send Client Info and then return to Connected State
			if(isConnected) {
				 sendClientInfo();
				 console.log("STATE CHANGE: Connected");
			} else {
				// If not connected, retry reconnection
				enterReconnectionState();
			}
		});
};


// =================================================== //
// =========== Send Client Info ====================== //

var sendClientInfo = function() {
	console.log("Sending client info");
	client.emit('client info', {
		username: "khalilstemmler998"
	});
};

var connectToNotificationServer = function(){
	console.log("STATE CHANGE: Attempting Connection to Notification Server");
	client = io('http://localhost:4376');
	setTimeout(function(){
		if(client.connected){
			console.log("STATE CHANGE: Successfully connected to Notification Server");
			sendClientInfo();

			client.on('disconnect', function(data){
				console.log("STATE CHANGE: Disconnected, entering Reconnection State");
			enterReconnectionState();
		});
		} else {
			console.log("Attemtping to connect to Notification Server");
			connectToNotificationServer();
		}
	}, 2000);
};


// ================================================================== //
// =============== Disconnection Event Handler ====================== //

// ==== Setup Notifier ==== //
notifier.on('click', function (notifierObject, options) {
  console.log("After clicking, this is what happens");
  console.log(notifierObject);
  console.log(options);
});
 
notifier.on('timeout', function (notifierObject, options) {
  // Triggers if `wait: true` and notification closes 
});


var displayNotification = function(title, notification, sound, wait) {
	notifier.notify({
	  title: title,
	  message: notification,
	   // Absolute path (doesn't work on balloons) 
	  sound: true, // Only Notification Center or Windows Toasters 
	  wait: true // Wait with callback, until user action is taken against notification 
	}, function (err, response) {
	  // Response is response from notification 
	  console.log(response);
	});
};

// Initial process
connectToNotificationServer();

// Setup socket level notification (fires off native notification)
client.on('notification', function(data){
	var notification = data.notification;
	displayNotification("SyncBuddy", notification, true, true);
});

 
