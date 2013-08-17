/*
 @cast object will automatically get created by the
 Chromecast exension ONLY if you have the correct HTML
 tag declarations
 */
var cast, cast_api, cv_activity;
var receivers, selectedReceiver, sending;

if (cast && cast.isAvailable) {
	// cast is available
	init();
} else {
	// wait for API to post a message to us
	window.addEventListener("message", function(event) {
		// source, event, api_version
		if (event.source === window && 
		 event.data &&
		 event.data.source ==  "CastApi" &&
		 event.data.event == "Hello") {
			init(event.data.api_version);
		}
	});
}

function init(version_array) {
	//alert("WE ARE INIT! " + version_array[0] + "." + version_array[1]);
	//$scope.castVersion = version_array[0] + "." + version_array[1];
	// Once validated as a sender page, populate the @cast object
	cast_api  = new cast.Api();
	// Find all cast devices (anything that can YouTube)
	cast_api.addReceiverListener("YouTube", onReceiverList);

	$('.btn.btn-success').show().on('click', function() {
		sendSomethingToReceiver(selectedReceiver);
	});
}


var onReceiverList = function(list) {
	// non-empty list? show a widget with receiver names
	if (!list || !list.length) return;

	// list of receiver objects
	// id, ipAddress, isTabProjected, name
	//console.log("list of receivers: ", list);
	receivers = list;

	$('.receivers').empty();
	receivers.forEach(function(receiver) {
		$listItem = $('<li><a data-id="' + receiver.id + '">' + receiver.name + '</a></li>');
		$listItem.on('click', function(e) {
			var $target = $(e.target);
			selectedReceiver = _.find(receivers, function(receiver) {
				return receiver.id === $target.data('id');
			});
			console.log('selectedReceiver', selectedReceiver);
		});

		$('.receivers').append($listItem);
	});

	// pick a receiver, invoke doLaunch
	// var receiver = list[1]; // first receiver
	// sendSomethingToReceiver();

}

function sendSomethingToReceiver(receiver) {
	if (sending) return;
	sending = true;
	console.log('Sending launch request');

	// my custom whitelisted chromecast
	var request = new cast.LaunchRequest('374051c9-2c57-486f-948e-25e7ef2be1da', receiver);
	request.description = new cast.LaunchDescription();
	request.description.text = "Hello, GDG Northern Colorado!";
	request.description.url = "https://developers.google.com/groups/chapter/100148220005153084415/";

	cast_api.launch(request, onLaunch);
}

var onLaunch = function(activity) {
	console.log('Launch callback');
	if (activity.status === "running") {
		cv_activity = activity;
		// update UI to reflect receiver's received
		// launch command and should start video
		cast_api.sendMessage(cv_activity.activityId, 
		'BESPOKE-GDG-GOOGLECAST-DEMO',
		{ type: 'Hello GDG NoCo', 
		  randomWord: 'blerg',
		  name: $('#name').val(),
		  email: $('#email').val(),
		  favorite: $('#favorite').val()
		} 
		);
	} else if (activity.status === "error") {
		cv_activity = null;
	}
}


	


