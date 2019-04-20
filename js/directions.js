//master-----------------------------------------------------------------------------------------------
// directions.js contains the functions that contol the walking directions operations on the map.
//
// This includes: showWalkingDirections, calculateAndDisplayRoute, showSteps, and 
// attachInstructionText.
//
// Author: Monica Michaud
// Date: 5-1-2018
//-----------------------------------------------------------------------------------------------
function showWalkingDirections() {
	$("#walkingDirectionsResultsContainer").removeAttr("style");
	
	$("#walkingStepsContainer").empty();
	
	//turn off start and end markers
	for (var i = 0; i < startEndMarkerArray.length; i++){
		startEndMarkerArray[i].setMap(null);
	}
	// Display the route between the initial start and end selections.
	calculateAndDisplayRoute(directionsDisplay, directionsService, markerArray, stepDisplay, map);
}


function calculateAndDisplayRoute(directionsDisplay, directionsService,	markerArray, stepDisplay, map) {
	
	//connects directionsDisplay back to the map again
	directionsDisplay.setMap(map);
	directionsDisplay.setPanel(document.getElementById('walkingStepsContainer'));
	
	// First, remove any existing markers from the map.
	//Basically hide function
	for (var i = 0; i < markerArray.length; i++) {
		markerArray[i].setMap(null);
	}
	// Retrieve the start and end locations and create a DirectionsRequest using WALKING directions.
	//console.log(currentPosition);
	var start, end;
    if($('#walkingDirectionsStartInput').val() == 0){
          start = currentPosition;           
        }
    else start = jsonData.shapes[$('#walkingDirectionsStartInput').val()].LLentrances[0];
    //console.log(start);   

    if($('#walkingDirectionsEndInput').val() == 0){
          end = currentPosition;
        }
    else end = jsonData.shapes[$('#walkingDirectionsEndInput').val()].LLentrances[0];
    //console.log(end); 

    if(start == end){
    	alert("Please Make The Start and End As different Positions!");
    }
    else{
    
     directionsService.route(
		{
			origin: start,
			destination: end,			
			//origin: DataTypesInformation[document.getElementById('walkingDirectionsStartInput').value].latLngMainEntrance,
			//destination: DataTypesInformation[document.getElementById('walkingDirectionsEndInput').value].latLngMainEntrance,
			travelMode: 'WALKING'
		}, 
		
		function(response, status) {
			// Route the directions and pass the response to a function to create markers for each step.
			
			if (status === 'OK') {
				
				var startAndEnd = {
					url: "./assets/img/siteImages/gold_pin.png",
					scaledSize: new google.maps.Size(40,40)
				}
				
				//document.getElementById("warnings-panel").innerHTML = '<b>' + response.routes[0].warnings + '</b>';
				//alert(response.routes[0].warnings);
				//console.log(response);
				directionsDisplay.setDirections(response);
				

				var start, end;
			    if($('#walkingDirectionsStartInput').val() == 0){
			          start = currentPosition;           
			        }
			    else start = jsonData.shapes[$('#walkingDirectionsStartInput').val()].LLentrances[0];
			    //console.log(start);   

			    if($('#walkingDirectionsEndInput').val() == 0){
			          end = currentPosition;
			        }
			    else end = jsonData.shapes[$('#walkingDirectionsEndInput').val()].LLentrances[0];
			    //console.log(end);    
				var startMarker = new google.maps.Marker({
                    position: start,
                    map: map,
                    icon: startAndEnd
                });
				startEndMarkerArray.push(startMarker);
				
				var endMarker = new google.maps.Marker({
                    position: end,
                    map: map,
                    icon: startAndEnd
                });
				startEndMarkerArray.push(endMarker);
				
				showSteps(response, markerArray, stepDisplay, map);
			} 
			else {
				window.alert('Directions request failed due to ' + status);
			}
		}
	 );

   }  
}

function showSteps(directionResult, markerArray, stepDisplay, map) {
	// For each step, place a marker, and add the text to the marker's infowindow.
	// Also attach the marker to an array so we can keep track of it and remove it
	// when calculating new routes.

	var myRoute = directionResult.routes[0].legs[0];
	var icon = {
		url: "./assets/img/siteImages/google-map-pointer-grey-th.png",
		scaledSize: new google.maps.Size(20,32)
	}
	
	
	for (var i = 0; i < myRoute.steps.length; i++) {
		var marker = markerArray[i] = markerArray[i] || new google.maps.Marker;
		
		marker.setIcon(icon);
		
		if(i == 0){
			
			marker.setVisible(false);
		}
		
		//marker.setIcon(icon);
		marker.setMap(map);
		marker.setPosition(myRoute.steps[i].start_location);
		//(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_ROSE)
		
		//attachInstructionText(stepDisplay, marker, myRoute.steps[i].instructions, map);
	}
}

function attachInstructionText(stepDisplay, marker, text, map) {
	google.maps.event.addListener(marker, 'click', function() {
		// Open an info window when the marker is clicked on, containing the text
		// of the step.
		stepDisplay.setContent(text);
		stepDisplay.open(map, marker);
	});
}

function clearDirections() {
	//clear & hide walking directions panel
	$("#walkingDirectionsResultsContainer").hide();
	//remove walking path from map
	directionsDisplay.setMap(null);
	//turn off grey step markers
	for (var i = 0; i < markerArray.length; i++) {
		markerArray[i].setMap(null);
	}
	//turn off start and end markers
	for (var i = 0; i < startEndMarkerArray.length; i++){
		startEndMarkerArray[i].setMap(null);
	}
}