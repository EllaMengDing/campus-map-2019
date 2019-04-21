/***********************DECLARE GLOBAL VARIABLES TO STORE GEO DATA***********************/
var jsonData = {};
var NUMBER_OF_BUILDINGS = 40;
var NUMBER_OF_TOUR_STOPS = 9;

var MAP_ZOOM = 17;
var MAP_CENTER_COORDINATES = {
        lat: 38.8720,
        lng: -99.34238
    };

var BUILDING_SELECTED_BORDER_SIZE = 4;
var BUILDING_SELECTED_BORDER_COLOR = "#000000";
var BUILDING_SELECTED_BORDER_OPACITY = 1.0;
var BUILDING_SELECTED_FILL_COLOR = '#eaaf0f';
var BUILDING_SELECTED_FILL_OPACITY = 0.9;

var BUILDING_UNSELECTED_BORDER_SIZE = 3;
var BUILDING_UNSELECTED_BORDER_COLOR = "#eaaf0f";
var BUILDING_UNSELECTED_BORDER_OPACITY = 1.0;
var BUILDING_UNSELECTED_FILL_COLOR = '#000000';
var BUILDING_UNSELECTED_FILL_OPACITY = 0.75;

var TOUR_PATH_SIZE = 5;
var TOUR_PATH_COLOR = "#eaaf0f";
var TOUR_FILL_COLOR = '#000000';
var TOUR_FILL_OPACITY = 0.75;

var PARKING_SELECTED_BORDER_SIZE = 3;
var PARKING_SELECTED_BORDER_COLOR = "#ffffff";
var PARKING_SELECTED_BORDER_OPACITY = 1.0;
var PARKING_SELECTED_FILL_COLOR = '#eaaf0f';
var PARKING_SELECTED_FILL_OPACITY = 0.75;

var PARKING_UNSELECTED_BORDER_SIZE = 3;
var PARKING_UNSELECTED_BORDER_COLOR = "#eaaf0f";
var PARKING_UNSELECTED_BORDER_OPACITY = 1.0;
var PARKING_UNSELECTED_FILL_COLOR = '#000000';
var PARKING_UNSELECTED_FILL_OPACITY = 0.75;

var POLYGON_SELECTED_BORDER_SIZE = 3;
var POLYGON_SELECTED_BORDER_COLOR = "#ff0000";
var POLYGON_SELECTED_BORDER_OPACITY = 1.0;
var POLYGON_SELECTED_FILL_COLOR = '#00ff00';
var POLYGON_SELECTED_FILL_OPACITY = 0.75;

var POLYGON_UNSELECTED_BORDER_SIZE = 3;
var POLYGON_UNSELECTED_BORDER_COLOR = "#00ff00";
var POLYGON_UNSELECTED_BORDER_OPACITY = 1.0;
var POLYGON_UNSELECTED_FILL_COLOR = '#ff0000';
var POLYGON_UNSELECTED_FILL_OPACITY = 0.75;

var CIRCLE_PATH_SIZE = 2;
var CIRCLE_PATH_COLOR = "#ff0000";
var CIRCLE_FILL_COLOR = '#ff0000';
var CIRCLE_FILL_OPACITY = 0.35;

// This section declares each of the arrays used to hold building information
var picture = {};

//var markersCenter = {}; 
var markersEntrance = {};
var listeners = {};
var infoLinkString = {};
var contentString = "";
var outlineEdge = [];
var poiMarker = [];

var activeCategories = [];
var whetherLocationChanged;
//Campus Tour Variables
var campusTourCoordinates = [];
var campusTourPath;
var lineSymbol;
var arrowSymbol;
var tourMarkers = new Array(NUMBER_OF_TOUR_STOPS);
var videoTourMarkers = new Array(NUMBER_OF_TOUR_STOPS);
var tourContentString = new Array(NUMBER_OF_TOUR_STOPS);
var videoTourContentString = new Array(NUMBER_OF_TOUR_STOPS);

//Category Interactions Variables
var active_CampusTour = false;
var active_VideoTour = false;
var active_Academic = false;
var active_Athletics = false;
var active_PlacesOfInterest = false;
var active_ResidenceBuildings = false;
var active_ServiceBuildings = false;
var active_Food = false;
var active_EntranceMarkers = false;
var active_BuildingMarkers = false;
var active_TourMarkers = false;
var active_VideoTourMarkers = false;
var active_CampusParking = false;

var categoryStateBeforeSearch;
var walkingStateBeforeSearch;

//Walking Directions variables
var directionsService;
// Create a renderer for directions and bind it to the map.
var directionsDisplay;
// Instantiate an info window to hold step text.
var stepDisplay;
var markerArray;
var startEndMarkerArray = [];
var map;

var currentPosition;

var showBuildingInfo = 1;
var modalShown = false;

var searchResults = [];
var CampusTourInformation;
var VideoTourInformation;
var CampusParkingInformation;
var x;
var y;
var schoolBuildingArray = [];   

//----------TEMPLATES BUILT WITH MUSTACHE : Build menu buttons and hamburger menu dynamically with data from JSON-----------
$.getJSON("json_fhsuDataTypes_shapes_layers_tours.json", function(data) {
    var templateLayers = '<h3>Layers</h3>{{#layersMenuOptions}}<li class="sidebarOption toggleLayer" data-objectid="{{#layerID}}{{.}},{{/layerID}}">{{label}}</li>{{/layersMenuOptions}}<br>';
    Mustache.parse(templateLayers); // optional, speeds up future uses
    var rendered = Mustache.render(templateLayers, data);
    $('#sidebar-layers').html(rendered);
                
    var shapesKeys=Object.keys(data.shapes);
    var layersKeys=Object.keys(data.layers);
    data.buildings=[];
    data.parking=[];//36 buildings have parking lots nearby
    data.tours=[];
    data.poi=[];
    data.polyline=[];
    data.polygon=[];
    data.circle=[];
    data.parkingLots=[];// 21 parking lots
    for(i=0; i<layersKeys.length;i++){
        shapes=data.layers[layersKeys[i]].shapes;
        data.layers[layersKeys[i]].shapesObjects={};
        for(j=0;j<shapes.length;j++){
            data.layers[layersKeys[i]].shapesObjects[shapes[j]]=JSON.parse(JSON.stringify(data.shapes[shapes[j]]));
        }
    }
   
    for(i=0;i<shapesKeys.length;i++){
        switch(data.shapes[shapesKeys[i]].type){
            case 'building': 
                building=data.shapes[shapesKeys[i]];
                building.id=shapesKeys[i];
                if(data.shapes[shapesKeys[i]].parking_IDs.length>0){
                    data.parking.push(building);
                }
                //console.log(data.shapes[shapesKeys[i]].parking_IDs);
                data.buildings.push(building);
                break;
            case 'tour':
                tour=data.shapes[shapesKeys[i]];
                tour.id=shapesKeys[i];
                data.tours.push(tour);
                break;
            case 'parking':
                parking=data.shapes[shapesKeys[i]];
                //console.log(parking);
                parking.id=shapesKeys[i];
                data.parkingLots.push(parking);
                break;
            case 'poi':
                poi=data.shapes[shapesKeys[i]];
                poi.id=shapesKeys[i];
                data.poi.push(poi);
                break;
            case 'polyline':
                polyline=data.shapes[shapesKeys[i]];
                data.polyline.push(polyline);
                break;
            case 'polygon':
                polygon=data.shapes[shapesKeys[i]];
                data.polygon.push(polygon);
                break;
            case 'circle':
                circle=data.shapes[shapesKeys[i]];
                data.circle.push(circle);
                break;  					
        }
    }
    for (var i = 0; i < data.buildings.length; i++) {
        schoolBuildingArray.push(data.buildings[i]);
    }
 
    //--------------sidebar-Buildings & Parking Lots & Walking Directions & Tours-------------------
    var templateBuildingDirectory = '<h3>Building Directory</h3>{{#buildings}}<li class="sidebarOption toggleBuilding" data-objectid="{{id}}">{{name}} ({{code}})</li>{{/buildings}}';
    Mustache.parse(templateBuildingDirectory); // optional, speeds up future uses
    var rendered = Mustache.render(templateBuildingDirectory, data);
    $('#sidebar-building').html(rendered);  
    
    var templateParking = '<h3>Parking</h3>{{#parking}}<li class="sidebarOption toggleBuildingParking" data-objectid="{{id}}">{{name}}</li>{{/parking}}';
    Mustache.parse(templateParking); // optional, speeds up future uses
    var rendered = Mustache.render(templateParking, data);
    $('#sidebar-parking').html(rendered); 

    var templateDirections='{{#buildings}}<option value="{{id}}">{{name}}</option>{{/buildings}}';
    Mustache.parse(templateDirections); // optional, speeds up future uses
    var rendered = Mustache.render(templateDirections, data);
    $('#walkingDirectionsStartInput').html($('#walkingDirectionsStartInput').html()+rendered);
    $('#walkingDirectionsEndInput').html($('#walkingDirectionsEndInput').html()+rendered); 
            
    var templateTours = '<h3>Tours</h3>{{#tours}}<li class="sidebarOption toggleTour" data-objectid="{{id}}">{{name}}</li>{{/tours}}<br>';
                             
    Mustache.parse(templateTours); // optional, speeds up future uses
    var rendered = Mustache.render(templateTours, data);
    $('#sidebar-tour').html(rendered);

    //------------------------------sidebar - hamberger bar - Student Information-----------------------------------   
  var templateStudentInfo = 
        '<h4 class="sidebarOption" id="toggle-student-info" >Student Information</h4>' +
        '{{#studentData}}<table  class="student-info">' +
        '<tr style="color: #eaaf0f">' +
            '<td >Student Name:</td>' +
            '<td ><strong>{{firstName}} {{lastName}}</strong></td>' +
        '</tr>' +  
         
        '{{#classes}}' +
            '<tr style="border-top: solid 1px #eaaf0f">' +   
                '<td style="color: #eaaf0f; border-top: solid 1px #eaaf0f">Class Name:</td>' +
                '<th>{{classCode}} - {{title}}</th>' +        
                
                '<tr>' +
                    '<td style="color: #eaaf0f">Location: </td>' +
                    '<td><div class="sidebarOption" onClick="toggleBuildingHighlighted(2)">{{building}} {{room}}</div></td>' +
                '</tr>' +
                '<tr>' +
                    '<td style="color: #eaaf0f">Time: </td>' +
                    '<td>{{#days}}{{MON}}{{TUE}}{{WED}}{{THU}}{{FRI}}{{SAT}}{{SUN}}{{/days}}</td>' +
                '</tr>' +
                '<tr >' +
                    '<td style="color: #eaaf0f">Instructor: </td>' +
                    '<td >{{instructor}}</td>' + 
                '</tr>' + 
            '</tr>' + 
        '{{/classes}}' +
        
        '</table>{{/studentData}}';
    Mustache.parse(templateStudentInfo); // optional, speeds up future uses
    var rendered = Mustache.render(templateStudentInfo,data);
    $('#student-info').html(rendered);

    $(".sidebarOption").click(function() {
        $(this).toggleClass("active");
    });        
//------------------------------------------------ Search function----------------------------------
    $("#headerSearchBarInput").on("keydown", function(e) {
        if (e.keyCode == 13) {
            findSearchResults($(this).val());
        }
    });
    $("#searchButton").on("click", function(e) {
        findSearchResults($("#headerSearchBarInput").val());
    });

    $("#headerSearchBarInput2").on("keydown", function(e) {
        if (e.keyCode == 13) {
            findSearchResults($(this).val());
        }
    });
    $("#searchButton2").on("click", function(e) {
        findSearchResults($("#headerSearchBarInput2").val());
    });
     
    function findSearchResults(searchQuery) {
    searchResults = [];
    $("#searchResultsContainer").empty();
    var x;
    var y;
    var z;
    var outputText = "";

    searchQuery = searchQuery.trim();

    if (searchQuery.length >= 1 && searchQuery.length <= 255 && typeof searchQuery === "string") {
        for (x in jsonData.buildings) {
            //call functions to check for various types of matches
            inBuildingNames(x, searchQuery);
            inBuildingCodes(x, searchQuery);
            //inBuildingInfos(x, searchQuery);
        } // end for loop through buildings x

        for (y in jsonData.poi) {
            //call functions to check for various types of matches
            inPOINames(y, searchQuery);
        } // end for loop through pois y

        for (z in jsonData.parkingLots) {
            //call functions to check for various types of matches
            inParkingNames(z, searchQuery);
        } // end for loop through parking z 
    }
   
    //check if searchResults array is empty-cells
    if (searchResults.length > 0) {
        $('.sidebar-content').hide();
        $('#sidebar-search').show();
        if (!tabToggle) {
            $('.sidebar').animate({
                width: "toggle"
            });
            tabToggle = !tabToggle;
        }

        newDivContent = "";
        newBuildingNameContent = "";
        newBuildingCodeContent = "";
        //newBuildingInformationContent = "";
        newPOINameContent = "";
        newParkingNameContent = "";

        for (y = 0; y < searchResults.length; y++) {
            console.log(searchResults[y]);
            //list all buildings included on Name
            if (searchResults[y].type == "BuildingName") {
                newBuildingNameContent += "<p><a href='#' class='toggleBuilding' data-objectid='" + searchResults[y].id + "'>" + searchResults[y].building + "</a></p>";
            }
            //list all buildings included on Code
            if (searchResults[y].type == "BuildingCode") {
                newBuildingCodeContent += "<p><a href='#' class='toggleBuilding' data-objectid='" + searchResults[y].id + "'>" + searchResults[y].building + "</a></p>";
            }
            //list all buildings included on Information
            if (searchResults[y].type == "POIName") {
                newPOINameContent += "<p><a href='#' class='togglePOI' data-objectid='" + searchResults[y].id + "'>" + searchResults[y].building + "</a></p>";
            }
            if (searchResults[y].type == "ParkingName") {
                newParkingNameContent += "<p><a href='#' class='toggleParking' data-objectid='" + searchResults[y].id + "'>" + searchResults[y].building + "</a></p>";
            }
        } //end for loop through searchResults

        //Add any building name results to newDivContent
        if (newBuildingNameContent != "") {
            newDivContent += "<h4>Building Names:</h4>" + newBuildingNameContent;
        }
        //Add any building code results to newDivContent
        if (newBuildingCodeContent != "") {
            newDivContent += "<h4>Building Codes:</h4>" + newBuildingCodeContent;
        }
        //Add any poi name results to newDivContent
        if (newPOINameContent != "") {
            newDivContent += "<h4>Points of Interest:</h4>" + newPOINameContent;
        }
        //Add any parking name results to newDivContent
        if (newParkingNameContent != "") {
            newDivContent += "<h4>Parking Lots:</h4>" + newParkingNameContent;
        }
        $("#sidebar-search").html(newDivContent);
        } else {
        //add "No results were found for: " + searchQuery to searchResultsContainer
            $("#sidebar-search").html("No results found for <br /><b>" + searchQuery + "</b>");
        }
    } //end findSearchResults function

    function inBuildingNames(x, searchQuery) {
        if ((jsonData.buildings[x].name.toLowerCase()).includes(searchQuery.toLowerCase())) {
            //add Name and building's name to searchResults array
            searchResults.push({
                id:jsonData.buildings[x].id,
                type: "BuildingName",
                building: (jsonData.buildings[x].name),
                code: (jsonData.buildings[x].code)
            });
        }
    } // end inBuildingNames

    function inBuildingCodes(x, searchQuery) {
        if ((jsonData.buildings[x].code.toLowerCase()) == (searchQuery.toLowerCase())) {
            //add Code and building's name to searchResults array
            searchResults.push({
                id:jsonData.buildings[x].id,
                type: "BuildingCode",
                building: (jsonData.buildings[x].name),
                code: (jsonData.buildings[x].code)
            });
        }
    } // end inBuildingCodes

    function inPOINames(x, searchQuery) {
        if ((jsonData.poi[x].name.toLowerCase()).includes(searchQuery.toLowerCase())) {
            //**********************add pois' title and id to searchResults array with its type
            searchResults.push({
                id:jsonData.poi[x].id,
                type: "POIName",
                building: (jsonData.poi[x].name),     
            });
        }
    } // end inPOINames

    function inParkingNames(x, searchQuery) {
        console.log(x);
        console.log(jsonData.shapes[x]);
        if ((jsonData.parkingLots[x].name.toLowerCase()).includes(searchQuery.toLowerCase())) {
            //*********************add parking's name and id to searchResults array with its type
            searchResults.push({
                id:jsonData.parkingLots[x].id,
                type: "ParkingName",
                building: (jsonData.parkingLots[x].name),
                code: (jsonData.parkingLots[x].zone)
            });
        }
    } // end inParkingCodes     

    jsonData = data;
});

$(".toggle-student-info").hide();
$("#walkingDirectionsResultsContainer").hide();
$(".about").hide();
$(".help").hide();
$(".version").hide();
 
$(document).on('click','.toggleLayer',function(){
    var layers=$(this).data('objectid').split(',');
    //console.log(layers);
    for(i=0;i<layers.length-1;i++){ 
        toggleOneLayer(layers[i]);
    }
});
$(document).on('click','.toggleBuilding',function(){
    //console.log(jsonData.shapes[$(this).data('objectid')]);
    jsonData.shapes[$(this).data('objectid')] = toggleBuilding(jsonData.shapes[$(this).data('objectid')]);
});
$(document).on('click','.togglePOI',function(){
    togglePOI($(this).data('objectid'));
});
$(document).on('click','.toggleParking',function(){
    //toggleParking($(this).data('objectid'));
    jsonData.shapes[$(this).data('objectid')] = toggleParking(jsonData.shapes[$(this).data('objectid')]);
});
$(document).on('click','.toggleBuildingParking',function(){
    toggleBuildingParking($(this).data('objectid'));
});			
$(document).on('click','.toggleTour',function(){
    toggleOnetour($(this).data('objectid'));
});   


(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.2';
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

window.twttr = (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || {};
    if (d.getElementById(id)) return t;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);

    t._e = [];
    t.ready = function(f) {
        t._e.push(f);
    };
    return t;
}(document, "script", "twitter-wjs"));

initMap();
        /*This is for managing the building toggle function*/
        /*Corrects map height in desktop and mobile versions*/
        $(function() {
            $('#map').height(window.innerHeight - $('#top-navbar').height() - $('#m-b-navbar').height() - 3);
        });
        $(window).resize(function() {
            $('#map').height(window.innerHeight - $('#top-navbar').height() - $('#m-b-navbar').height() - 3);
        });
     