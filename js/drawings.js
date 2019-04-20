//-----------------------------------------------------------------------------------------------
// buildingData.js contains the functions and variables that create the map, and all of the 
// arrays that contain the information for each building's title, abbreviation, history, link, 
// image, outline GPS coordinates, center GPS coordinates, and the entrance coordinates. This 
// file also includes the for loop that assembles each building's information and places it on 
// the map, and the tour path coordinates and the code that places the tour on the map. 
//
// This includes: initMap, buildingNames, latLngCenter, latLngMainEntrance, buildingOutline, 
// infoBoxString, picture, infoLinkString, and campusTourCoordinates.
//
// ************************NEED TO UPDATE COMMENTS ABOVE**********************
// Author: Monica Michaud
// Date: 12-5-2018
//-----------------------------------------------------------------------------------------------
function checkBuilding(myLatlng) {
    var schoolBuilding = new google.maps.Polygon({});
    var inbuilding = false;
    var building = -1;
    for (var i = 0; i < schoolBuildingArray.length; i++) {
        var schoolBuilding = new google.maps.Polygon({
            paths: schoolBuildingArray[i].LLoutline
        });
        if (google.maps.geometry.poly.containsLocation(myLatlng, schoolBuilding)) {

            if (showBuildingInfo == 1 && modalShown == false) {
                $('#exampleModal').modal('show');
                modalShown = true;
            }
            //console.log(schoolBuildingArray[i].name);
			/* Current Location show in Sidebar */		
            $('#current_building_name').text(schoolBuildingArray[i].name);
            $('#current_building_info').text(schoolBuildingArray[i].description);
                $('.currentLocationTitle').text(schoolBuildingArray[i].name);
                $('.currentLocationContent').text(schoolBuildingArray[i].description);

            if (whetherLocationChanged != schoolBuildingArray[i].name) {
                whetherLocationChanged = schoolBuildingArray[i].name;
                /* Current location popup */
            }
            $('#check-click').on("click", function() {
                showBuildingInfo = 0;
                $('#exampleModal').modal('hide');
            });
            /* Current location popup */  
            building = i;
            inbuilding = true;
        }
        //console.log(schoolBuildingArray[i]);
    }
} // End of FUNCTION checkBuilding

$('#exampleModal').on('hidden.bs.modal', function() {
        modalShown = false;
    })
    // show info in index page------------------------------------------------------

$("#currentLocation").click(function() {
    $(".currentLocationInfo").toggle();
});

function initMap() {
	//create map object and set default map settings
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: MAP_ZOOM,
		center: MAP_CENTER_COORDINATES,
		mapTypeControl: true,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
			position: google.maps.ControlPosition.TOP_RIGHT
		},
		styles: [
			{
				"featureType": "poi.attraction",
				"elementType": "labels",
				"stylers": [ { "visibility": "off" } ]
			},
			{
				"featureType": "poi.business",
				"elementType": "labels",
				"stylers": [ { "visibility": "off" } ]
			},
			{
				"featureType": "poi.government",
				"elementType": "labels",
				"stylers": [ { "visibility": "off" } ]
			},
			{
				"featureType": "poi.park",
				"elementType": "labels",
				"stylers": [ { "visibility": "off" } ]
			},
			{
				"featureType": "poi.school",
				"elementType": "labels",
				"stylers": [ { "visibility": "off" } ]
			},
			{
				"featureType": "poi.sports_complex",
				"elementType": "labels",
				"stylers": [ { "visibility": "off" } ]
			}
		]
	});
 var schoolBuilding = new google.maps.Polygon({});
//--------------using watchPosition() to tract locations-----------------
	var watchID;
    var marker = null;
    var showPosition = function(position) {

        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var myLatlng = new google.maps.LatLng(lat, lng);

        currentPosition = myLatlng;  
        if(marker == null){
             var iconImage = new google.maps.MarkerImage('./assets/img/siteImages/icon49.png',       
                 new google.maps.Size(25, 25),//This marker is 28 pixels wide by 25 pixels high.
             );
            marker = new google.maps.Marker({
                position: myLatlng,
                map: map,
                icon: iconImage
            });
            marker.setMap(map);
        }else{           
            marker.setPosition(myLatlng);
            marker.setMap(map);
        }
        checkBuilding(myLatlng);
    };
    function errorHandler(err) {
                if(err.code == 1) {
                   alert("Attempting To Find Your Location");
                   //$(#map).append('<div id="errorOne"><span class="intructionTexts">Attempting To Find Your Location</span></div>');
                   //navigator.geolocation.clearWatch(watchID);
                } else if( err.code == 2) {
                   alert("The Server Couldn't Find Your Location!");
                   //$(#map).append('<div id="errorTwo"><span class="intructionTexts">The Server Could Not Find Your Location!</span></div>');
                } else{
                  //alert("Error: Timeout, Error Code: " + err.code);
                }
    }
           
    function getLocationUpdate(){         
                if(navigator.geolocation){ 
                   // timeout at 1000 milliseconds (1 second)
                   var options = {enableHighAcuracy: true,timeout: 5000,maximumAge: 0};              
                   watchID = navigator.geolocation.watchPosition(showPosition, errorHandler, options);
                } else {
                   alert("Sorry, Your Browser Does Not Support Geolocation!");
                   //$(#map).append('<div id="errorThree"><span class="intructionTexts">Sorry, Your Browser Does Not Support Geolocation!</span></div>');
                }
    }
    //setTimeout(getLocationUpdate(), 1000);
    getLocationUpdate();    
    // generating routain

	// Instantiate a directions service.
	directionsService = new google.maps.DirectionsService;
	// Create a renderer for directions and bind it to the map.
	directionsDisplay = new google.maps.DirectionsRenderer({
			map: map,
			polylineOptions: {strokeColor: 'black'},
			suppressMarkers: true,
			//markerOptions: {strokeColor: "blue"}
			
	});   
    directionsDisplay.setMap(map);
	// Instantiate an info window to hold step text.
	stepDisplay = new google.maps.InfoWindow;
	markerArray = [];	
	//Define dummy infoWindow for use in drawing jsonData type objects
	infoWindow = new google.maps.InfoWindow({
		position: {lat: 38.8726, lng: -99.34339},
		content: "Dummy Text",
		maxWidth: 500
	});	
	// Closes infoWindow if user clicks outside of the box
	google.maps.event.addListener(map, "click", function(event) {
		infoWindow.close();	
	});

}//end of initMap

//********************DRAW EACH jsonData TYPE TO THE MAP*******************
//----------------------------------toggle shapes--------------------------------------
function toggleShape(shapeID,forcetoggle=false,layerID=undefined){
	switch(jsonData.shapes[shapeID].type){
		case 'building': 
			if(layerID==undefined){
				jsonData.shapes[shapeID]=toggleBuilding(jsonData.shapes[shapeID]);
			}
			else{
				jsonData.layers[layerID].shapesObjects[shapeID]=toggleBuilding(jsonData.layers[layerID].shapesObjects[shapeID]);
			}
		break;
		case 'circle':
			if(layerID==undefined){
				jsonData.shapes[shapeID]=toggleCircle(jsonData.shapes[shapeID]);
			}
			else{
				jsonData.layers[layerID].shapesObjects[shapeID]=toggleCircle(jsonData.layers[layerID].shapesObjects[shapeID]);
			}
		break;
		case 'polyline': 
			if(layerID==undefined){
				jsonData.shapes[shapeID]=togglePolyline(jsonData.shapes[shapeID]);
			}
			else{
				jsonData.layers[layerID].shapesObjects[shapeID]=togglePolyline(jsonData.layers[layerID].shapesObjects[shapeID]);
			}
		break;
		case 'polygon': 
			if(layerID==undefined){
				jsonData.shapes[shapeID]=togglePolygon(jsonData.shapes[shapeID]);
			}
			else{
				jsonData.layers[layerID].shapesObjects[shapeID]=togglePolygon(jsonData.layers[layerID].shapesObjects[shapeID]);
			}
		break;
		case 'parking': 
			if(layerID==undefined){
				jsonData.shapes[shapeID]=toggleParking(jsonData.shapes[shapeID]);
			}
			else{
				jsonData.layers[layerID].shapesObjects[shapeID]=toggleParking(jsonData.layers[layerID].shapesObjects[shapeID]);
			}
		break;
		case 'poi': 
		/*
			if(layerID==undefined){
				jsonData.shapes[shapeID]= togglePOI(jsonData.shapes[shapeID]);
			}
			else{
				jsonData.layers[layerID].shapesObjects[shapeID]= togglePOI(jsonData.layers[layerID].shapesObjects[shapeID]);
			}
		break;
		*/
		case 'poi': togglePOI(shapeID,forcetoggle);
		break;
	}
}
//-----------------------------------toggle layers-----------------------------------
function toggleOneLayer(id,forcetoggle=false){
     for (var i=0 ; i<jsonData.layers[id].shapes.length; i++) {
     	toggleShape(jsonData.layers[id].shapes[i],false,id);
     }
 }

function toggleLayer(){                
     for (var i = 0; i<arguments.length; i++) {
           toggleOneLayer(arguments[i]);
     }
}

//-----------------------------------toggle tours----------------------------------
function toggleOnetour(id){
       for (var i = 0; i<jsonData.shapes[id].shapes.length; i++) {
          toggleShape(jsonData.shapes[id].shapes[i]);                      
       }
}

//----------------------------------toggle buildings--------------------------------
function toggleBuilding(shape,forcetoggle=false){
	//console.log(shapeID);
	if(shape.visible==undefined){
		shape.outlineEdge = new google.maps.Polygon({
			path: shape.LLoutline,
			geodesic: true,
			strokeColor: BUILDING_UNSELECTED_BORDER_COLOR,
			strokeOpacity: BUILDING_UNSELECTED_BORDER_OPACITY,
			strokeWeight: BUILDING_UNSELECTED_BORDER_SIZE,
			fillColor: 	BUILDING_UNSELECTED_FILL_COLOR,
			fillOpacity: BUILDING_UNSELECTED_FILL_OPACITY
		});
		var contentString = '<div id="content"><h1 id="infoWindowHeading" class="infoWindowHeading">' + 
		((shape.displayCode == "true") ? (shape.name + ' (' + shape.code + ') ' ) : (shape.name) ) + 		
		'</h1><div id="infoWindowBodyContent"><img class="infoWindowImages" src=' + 
		shape.picture + '>' + shape.description +
		//Building hours of operation: check is displayHours is true, is yes then print hoursOfOperation and hoursLink, if not do not print
		((shape.openHours == "true") ? ('<p>Building Hours: ' + shape.hourOfOperation + '</p><p>For complet list of operating hours: <a href='+ shape.hourLink +' target="_blank">Click Here</a></p>' ) : ('') ) +
		//Link to 360 interior view if available with link to historical info, else just link to historical info
		((shape.link360 == "true") ? ('<p>For more information: <a href='+ shape.infoLinkString +' target="_blank">Click Here</a></p><p>For a 360 interior view of this building: <a href='+ shape.link360String +' target="_blank">Click Here</a></p>' ) : ('<p>For more information: <a href='+ shape.infoLinkString +' target="_blank">Click Here</a></p>') ) +
		'</div></div>';	
		//Add a listener to the marker: when the user clicks the marker, the infoWindow appears
		google.maps.event.addListener(shape.outlineEdge,'click',function(event){
			shape.outlineEdge.infowindow=new google.maps.InfoWindow({
				content: drawInfoWindow()
			  });
			shape.outlineEdge.infowindow.setContent(contentString);
			shape.outlineEdge.infowindow.setPosition(shape.LLcenter);
			shape.outlineEdge.infowindow.open(map);
		});
		shape.outlineEdge.setMap(map);
		shape.visible=true;
	}else{
		if(shape.visible==true && !forcetoggle){
			shape.outlineEdge.setMap(null);
			if(shape.outlineEdge.infowindow!=undefined) 
			   shape.outlineEdge.infowindow.close();
		}else 
		shape.outlineEdge.setMap(map);
		shape.visible=!shape.visible;
	}
	return shape;
}
//----------------------------------toggle parkings-----------------------------------
function toggleParking(shape,forcetoggle=false){
	//console.log(shapeID);
	console.log(shape);
	if(shape.visible==undefined){
		shape.outlineEdge= new google.maps.Polygon({
			path: shape.LLoutline,
			geodesic: true,
			strokeColor: PARKING_SELECTED_BORDER_COLOR,
			strokeOpacity: PARKING_SELECTED_BORDER_OPACITY,
			strokeWeight: PARKING_SELECTED_BORDER_SIZE,
			fillColor: 	PARKING_SELECTED_FILL_COLOR,
			fillOpacity: PARKING_SELECTED_FILL_OPACITY
		});

			var contentString = '<div id="content"><h1 id="infoWindowHeading" class="infoWindowHeading">' + 
			shape.name + ' (Zone: ' + shape.zone + ') ' + '</h1>' + '</div>';
					//Add a listener to the marker: when the user clicks the marker, the infoWindow appears
					google.maps.event.addListener(shape.outlineEdge,'click',function(event){
						shape.outlineEdge.infowindow=new google.maps.InfoWindow({
						content: drawInfoWindow()
					  });
					  shape.outlineEdge.infowindow.setContent(contentString);
					shape.outlineEdge.infowindow.setPosition(shape.LLcenter);
					shape.outlineEdge.infowindow.open(map);
				});
				shape.outlineEdge.setMap(map);
				shape.visible=true;
			
		}else{
		if(shape.visible==true && !forcetoggle){
			shape.outlineEdge.setMap(null);
			if(shape.outlineEdge.infowindow!=undefined) 
			shape.outlineEdge.infowindow.close();
			
		}else 
		shape.outlineEdge.setMap(map);
		shape.visible=!shape.visible;
	}
	return shape;
}
//----------------------------------toggle Building-parkings-----------------------------------
function toggleBuildingParking(shapeID,forcetoggle=false){
	toggleBuilding(jsonData.shapes[shapeID]);
	//console.log(shapeID);
	for(i=0;i<jsonData.shapes[shapeID].parking_IDs.length;i++){
			var parkingData = jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]];
			var infoWindowPosition = jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]].LLcenter;
			var parkingEdge = jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]].LLoutline;
			parking={};
			if(jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]].visible==undefined){
				jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]].outlineEdge=new google.maps.Polygon({
							path: parkingEdge,
							geodesic: true,
							strokeColor: PARKING_SELECTED_BORDER_COLOR,
							strokeOpacity: PARKING_SELECTED_BORDER_OPACITY,
							strokeWeight: PARKING_SELECTED_BORDER_SIZE,
							fillColor: 	PARKING_SELECTED_FILL_COLOR,
							fillOpacity: PARKING_SELECTED_FILL_OPACITY
					});
				var contentString = '<div id="content"><h1 id="infoWindowHeading" class="infoWindowHeading">' + 
					parkingData.name + ' (Zone: ' + parkingData.zone + ') ' + '</h1>' + '</div>';
					//Add a listener to the marker: when the user clicks the marker, the infoWindow appears

					jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]].outlineEdge.infowindow=new google.maps.InfoWindow({
							content: drawInfoWindow()
						  });
						jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]].outlineEdge.infowindow.setContent(contentString);
						jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]].outlineEdge.infowindow.setPosition(infoWindowPosition);
					
					google.maps.event.addListener(jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]].outlineEdge,'click',function(event){
						this.infowindow.open(map);
					});

					jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]].outlineEdge.setMap(map);
					jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]].visible=true;
			}
			else{
				if(jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]].visible==true && !forcetoggle && !jsonData.shapes[shapeID].visible){
					jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]].outlineEdge.setMap(null);
					if(jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]].outlineEdge.infowindow!=undefined) 
						jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]].outlineEdge.infowindow.close();
				}else jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]].outlineEdge.setMap(map);
					  jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]].visible=!jsonData.shapes[jsonData.shapes[shapeID].parking_IDs[i]].visible;
			}		
	}
}

//----------------------------------------toggle circles-----------------------------------------
function toggleCircle(shape,forcetoggle=false){
	if(shape.visible==undefined){
		shape.outlineEdge = new google.maps.Circle({
		strokeColor: CIRCLE_PATH_COLOR,
		strokeOpacity: 0.8,
		strokeWeight: CIRCLE_PATH_SIZE,
		fillColor: CIRCLE_FILL_COLOR,
		fillOpacity: CIRCLE_FILL_OPACITY,
		map: map,
		center: shape.LLcenter,
		radius: shape.radius
	});

		var contentString = '<div id="content"><h1 id="infoWindowHeading" class="infoWindowHeading">' + 
		shape.name + 		
		'</h1><div id="infoWindowBodyContent"><img class="infoWindowImages" src=' + 
		shape.picture + '>' +
		shape.description + 		
		'</div></div>';

		google.maps.event.addListener(shape.outlineEdge,'click',function(event){
			shape.outlineEdge.infowindow=new google.maps.InfoWindow({
				content: drawInfoWindow()
			  });
			  shape.outlineEdge.infowindow.setContent(contentString);
			  shape.outlineEdge.infowindow.setPosition(shape.LLcenter);
			  shape.outlineEdge.infowindow.open(map);
		});
		shape.outlineEdge.setMap(map);
		shape.visible=true;
			
	}else{
		if(shape.visible==true && !forcetoggle){
			shape.outlineEdge.setMap(null);
			if(shape.outlineEdge.infowindow!=undefined) 
			shape.outlineEdge.infowindow.close();
		}else 
		shape.outlineEdge.setMap(map);
		shape.visible=!shape.visible;
	}
	return shape;
}

//------------------------------------------toggle polygons----------------------------------------------------
function togglePolygon(shape,forcetoggle=false){
	if(shape.visible==undefined){
		shape.outlineEdge= new google.maps.Polygon({
			path: shape.LLoutline,
			geodesic: true,
			strokeColor: POLYGON_UNSELECTED_BORDER_COLOR,
			strokeOpacity: POLYGON_UNSELECTED_BORDER_OPACITY,
			strokeWeight: POLYGON_UNSELECTED_BORDER_SIZE,
			fillColor: 	POLYGON_UNSELECTED_FILL_COLOR,
			fillOpacity: POLYGON_UNSELECTED_FILL_OPACITY
		});

		var contentString = '<div id="content"><h1 id="infoWindowHeading" class="infoWindowHeading">' + 
		shape.name + 			
		'</h1><div id="infoWindowBodyContent"><img class="infoWindowImages" src=' + 
		shape.picture + '>' + shape.description + 			
		'<p>For more information: <a href='+ shape.infoLinkString +' target="_blank">Click Here</a></p>' +
		'</div></div>';

		google.maps.event.addListener(shape.outlineEdge,'click',function(event){
			shape.outlineEdge.infowindow=new google.maps.InfoWindow({
				content: drawInfoWindow()
			  });
			  shape.outlineEdge.infowindow.setContent(contentString);
			  shape.outlineEdge.infowindow.setPosition(shape.LLcenter);
			  shape.outlineEdge.infowindow.open(map);
		});
	
		shape.outlineEdge.setMap(map);
		shape.visible=true;
	}else{
		if(shape.visible==true && !forcetoggle){
			shape.outlineEdge.setMap(null);
			if(shape.outlineEdge.infowindow!=undefined) 
			shape.outlineEdge.infowindow.close();
		}else 
		shape.outlineEdge.setMap(map);
		shape.visible=!shape.visible;
	}
	return shape;
}

//-------------------------------------------toggle polylines----------------------------------------------
function togglePolyline(shape,forcetoggle=false){
	if(shape.visible==undefined){
		//creates the line symbols of black dots used for the polyline
		lineSymbol = {
			path: google.maps.SymbolPath.CIRCLE,
			fillOpacity: 1,
			scale: 2.5,
			fillColor: '#000000'
		};		
		//create polyline using passed value, lineSymbol, and global variables from index.html
		shape.outlineEdge = new google.maps.Polyline({
			path: shape.LLoutline,
			geodesic: true,
			strokeColor: TOUR_PATH_COLOR,
			strokeOpacity: 0,
			strokeWeight: TOUR_PATH_SIZE,
			icons: [{
				icon: lineSymbol,
				offset: '0',
				repeat: '10px'
			}],
			map: map
		});

		shape.outlineEdge.setMap(map);
		shape.visible=true;
	}else{
		if(shape.visible==true && !forcetoggle){
			shape.outlineEdge.setMap(null);
			if(shape.outlineEdge.infowindow!=undefined) 
			shape.outlineEdge.infowindow.close();
		}else 
		shape.outlineEdge.setMap(map);
		shape.visible=!shape.visible;
	}
	return shape;
}

//----------------------------------toggle pois--------------------------------------
function togglePOI(shapeID,forcetoggle=false){
if(jsonData.shapes[shapeID].visible==undefined){  
	jsonData.shapes[shapeID].poiMarker = new google.maps.Marker({
	 position: jsonData.shapes[shapeID].LLcenter,
	 title: jsonData.shapes[shapeID].name,
	 icon: jsonData.shapes[shapeID].icon,
	 map: map
	});
  
	var contentString = '<div id="content"><h1 id="infoWindowHeading" class="infoWindowHeading">' + jsonData.shapes[shapeID].name +  
	'</h1><div id="infoWindowBodyContent" style="width: 480px;">' +
	((jsonData.shapes[shapeID].picture != "") ? ('<img class="infoWindowImages" src="' + jsonData.shapes[shapeID].picture + '">') : ('<iframe title=' + jsonData.shapes[shapeID].name + 
	' width="100%" height="270" allowTransparency="true" mozallowfullscreen webkitallowfullscreen allowfullscreen style="background-color:transparent;" frameBorder="0" src=' + jsonData.shapes[shapeID].URL + 
	'></iframe>') ) +
	jsonData.shapes[shapeID].description +   
	'</div></div>';
  
	google.maps.event.addListener(jsonData.shapes[shapeID].poiMarker,'click',function(event){
	 jsonData.shapes[shapeID].poiMarker.infowindow=new google.maps.InfoWindow({
	  content: drawInfoWindow()
	   });
	 jsonData.shapes[shapeID].poiMarker.infowindow.setContent(contentString);
	 jsonData.shapes[shapeID].poiMarker.infowindow.setPosition(jsonData.shapes[shapeID].LLcenter);
	 jsonData.shapes[shapeID].poiMarker.infowindow.open(map);
	});
	jsonData.shapes[shapeID].visible=true;
   }else{
   if(jsonData.shapes[shapeID].visible==true && !forcetoggle){
	 jsonData.shapes[shapeID].poiMarker.setMap(null);
	 if(jsonData.shapes[shapeID].poiMarker.infowindow!=undefined) 
		jsonData.shapes[shapeID].poiMarker.infowindow.close();
	}else 
	jsonData.shapes[shapeID].poiMarker.setMap(map);
	jsonData.shapes[shapeID].visible=!jsonData.shapes[shapeID].visible;
   } 
  }

//----------------------------------Info Window--------------------------------------
function drawInfoWindow(shapeID){	
	return '<div id="content"><h1 id="infoWindowHeading" class="infoWindowHeading">x</h1><div id="infoWindowBodyContent"></div></div>';
}

function OpenInfoWindow (buildingCode){	
	var building_infoBoxString;
	var building_latLngCenter;		
	//parse from JSON data based on building code
	//get infoBoxString   
	building_infoBoxString = '<div id="content"><h1 id="infoWindowHeading" class="infoWindowHeading">' + 
		((jsonData.buildings[buildingCode].displayCode == "true") ? (jsonData.buildings[buildingCode].name + ' (' + jsonData.buildings[buildingCode].code + ') ' ) : (jsonData.buildings[buildingCode].name) ) + 
		'</h1><div id="infoWindowBodyContent"><img class="infoWindowImages" src=' + jsonData.buildings[buildingCode].picture + '>' + jsonData.buildings[buildingCode].infoBoxString + 
		'<p>For more information: <a href='+ jsonData.buildings[buildingCode].infoLinkString +' target="_blank">' +
		'Click Here</a></p></div></div>';
	
	//get latLngCenter
	building_latLngCenter = jsonData.buildings[buildingCode].LLcenter;
	map.setCenter(building_latLngCenter);
	infoWindow.setContent(building_infoBoxString);
	infoWindow.setPosition(building_latLngCenter);
	infoWindow.open(map);
}

//when get directions is clicked => open walkingDirectionsResultsContainer
$(function() {
	$("#walkingSelectionsSubmitButton").click(function() {
		$("#walkingDirectionsResultsContainer").show();
	});

	$("#closeWalkingDirectionsPanelButton").click(function() {
		$("#walkingDirectionsResultsContainer").hide();
	});

});


