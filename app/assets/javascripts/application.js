// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require rails-ujs
//= require jquery
//= require_tree .



$(document).ready(function() {



    // Deal with typed instead of spoken
    $("#readout").on('keyup', function (e) {
      if (e.keyCode == 13) {
          // grab output typed in
          var output = $("#readout").val()
          dialogue(output)
          $("#readout").val("")
          $("#readout").blur()
      }
    })
    
})










/////////////////////////////// Maps functionality for navigation and directions
//////////////////////////////  basic configurations and then functional elements

var map;
var newLat = 0;
var newLng = 0;
var panelDetails;
var adpSummary;
var routeTimeEst;
var routeDistEst;


function loadMap() {

    /// check if our map exists, if not then load it in

    if ($("#map").length < 1) {
      var mapsHtml = '<div id="maps"><div id="navigation"><div class="navlist"><div id="directionsPanel" style="height 100%;"></div></div></div><div id="mapOverlay"><h3>Loading maps...<span></span></h3></div><div id="map"></div></div>'
      $("#eye").append(mapsHtml)

      $.loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyAwpA8PHX57_8RCU8iCCDdIEViCWrpy44k&libraries=drawing&callback=initMap', function() { });
    }

    ///// Maps functionality

    // Fade in maps after a second so we don't get background flicker!
    setTimeout(function() {
        $("#maps").css("opacity", "1")
        $("#mapOverlay h3 span").css("width", "100%").css("opacity", "1")
    }, 150)
    setTimeout(function() {
        $("#mapOverlay").fadeOut("fast")
        $("#readout").val(" ")
    }, 600)

	setTimeout(function() {

		// scenic route
		// loadDestination(dest, true)

		// normal destination
		loadDestination("grand central station")
	}, 750)

}

function loadDestination(destination, scenic) {

    mapQuery = destination
    mapAction = ""

    var origin = "410 south 4th street brooklyn new york"
    var oLat = 0
    var oLng = 0

    // Geocode origin & dest
    var geocoder; geocoder = new google.maps.Geocoder(); geocoder.geocode( { 'address': origin }, function(results, status) { if (status == 'OK') {oLat = results[0].geometry.location.lat();oLng = results[0].geometry.location.lng();} else {console.log('GeoCode failed: ' + status);}})
    geocoder = new google.maps.Geocoder(); geocoder.geocode( { 'address': mapQuery}, function(results, status) { if (status == 'OK') {newLat = results[0].geometry.location.lat();newLng = results[0].geometry.location.lng();} else {console.log('GeoCode failed: ' + status);}})

    setTimeout(function() {

        // var newDLat = newCoords[0]
        // var newDLng = newCoords[1]

        // console.log(newLat)
        // console.log(newLng)

        // fade in navigation panel
        $("#navigation").fadeIn("fast")

        // Maps request function is set up as below:
        // mapsRequest(destination, dName, dLat, dLng, origin, oName, oLat, oLng)
        mapsRequest(mapQuery, mapQuery, newLat, newLng, origin, origin, oLat, oLng, scenic)

    }, 1000)
}

function removeMap() {

    $("#readout").val(" ")
    $("#map").fadeOut("slow")
}

// Set destination, origin and travel mode.

function getGeocode(address, lat, lng) {
    var geocoder; geocoder = new google.maps.Geocoder(); geocoder.geocode( { 'address': address}, function(results, status) { if (status == 'OK') {lat = results[0].geometry.location.lat();lng = results[0].geometry.location.lng();} else {console.log('GeoCode failed: ' + status);}})
}

function mapsRequest(destination, dName, dLat, dLng, origin, oName, oLat, oLng, scenic) {
    var tm = 'DRIVING'
    if (scenic == true) {
      tm = 'BICYCLING'
    }
    var request = {
      destination: destination,
      origin: origin,
      travelMode: tm
    };

    var directionsDisplay = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#00ffff"
        }
    });

    // Pass the directions request to the directions service.
    var directionsService = new google.maps.DirectionsService();
    directionsService.route(request, function(response, status) {
      console.log("STATUS ------")
      console.log(status)
      console.log(response)
      if (status == 'OK') {
        // Display the route on the map.
        directionsDisplay.setDirections(response);
        directionsDisplay.setPanel(document.getElementById('directionsPanel'))
        panelDetails = directionsDisplay.panel

        setTimeout(function() {
            routeTimeEst = $("span[jstcache=82]").text()
            routeDistEst = $("span[jstcache=56]").text()

            // replace goal icon
            $('img[jstcache="67"]').parent().html("<img src='/assets/icon_destination.png' />")

            // prepend with icons
            $("span[jstcache=56]").html('<img src="/assets/icon_distance.png" />' + routeDistEst)
            $("span[jstcache=58]").html('<img src="/assets/icon_stopwatch.png" />About ' + routeTimeEst)

            // Add time remaining
            var d = new Date();
            var h = d.getHours()
            var m = d.getMinutes()
            var minInt = routeTimeEst.replace(/[^0-9.]/g, "")
            var est = parseInt(m) + parseInt(minInt)
            var totalEst = ((parseInt(h) + 11) % 12 + 1) + ":" + ((minInt + 59) % 60 + 1);
            $(".adp-summary").append('<span><i class="far fa-clock"></i> ' + totalEst + '</span>')
        }, 200)

        setTimeout(function() {

            responsiveVoice.speak("About " + routeDistEst + ", and should take " + routeTimeEst + ".", "UK English Female", {rate: 1});

            // Set destination in HM emulator
            $.ajax({ type: 'GET', url: '/setdestination?lat=' + dLat + '&lon=' + dLng + '&dest=' + dName });
        }, 1000)
      }
    });

    var cyanDotTop = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#05bfc0',
        fillOpacity: 1,
        scale: 8,
        strokeColor: '#05bfc0',
        strokeWeight: 3,
        labelOrigin: new google.maps.Point(19, -3),
    };

    var cyanDotBot = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#05bfc0',
        fillOpacity: 1,
        scale: 8,
        strokeColor: '#05bfc0',
        strokeWeight: 3,
        labelOrigin: new google.maps.Point(23, -3),
    };

    new google.maps.Marker({
        position: {lat: dLat, lng: dLng},
        map: map,
        label: {text: dName, color: "white", fontSize: "28px", fontWeight: "300"},
        icon: cyanDotBot
    });

    new google.maps.Marker({
        position: {lat: oLat, lng: oLng},
        map: map,
            label: {text: oName, color: "white", fontSize: "28px", fontWeight: "300"},
        icon: cyanDotTop
    });


    // Speak out the directions!
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 40.7128, lng: -74.0059},
      zoom: 10,
      zoomControl: false,
      scaleControl: true,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      styles: [
        {
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#0b1732"
            }
          ]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#038f94"
            }
          ]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#1a3646"
            }
          ]
        },
        {
          "featureType": "administrative.country",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#4b6878"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#64779e"
            }
          ]
        },
        {
          "featureType": "administrative.province",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#4b6878"
            }
          ]
        },
        {
          "featureType": "landscape.man_made",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#051d2d"
            }
          ]
        },
        {
          "featureType": "landscape.man_made",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#040f27"
            }
          ]
        },
        {
          "featureType": "landscape.natural",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#01151e"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#0a1a3a"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#6f9ba5"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#1d2c4d"
            }
          ]
        },
        {
          "featureType": "poi.business",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#023e58"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#124750"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#000"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#fff"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#033751"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#054f62"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#014b80"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#255763"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#b0d5ce"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#023e58"
            }
          ]
        },
        {
          "featureType": "road.local",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#02294a"
            }
          ]
        },
        {
          "featureType": "road.local",
          "elementType": "labels",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "transit",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "transit",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#98a5be"
            }
          ]
        },
        {
          "featureType": "transit",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#1d2c4d"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#283d6a"
            }
          ]
        },
        {
          "featureType": "transit.station",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#3a4762"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#0e1626"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#4e6d70"
            }
          ]
        }
      ]
    });

    var drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.MARKER,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['marker', 'circle', 'polygon', 'polyline', 'rectangle']
      },
      markerOptions: {icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'},
      circleOptions: {
        fillColor: '#ffff00',
        fillOpacity: 1,
        strokeWeight: 5,
        clickable: false,
        editable: true,
        zIndex: 1
      }
    });
    drawingManager.setMap(map);
}

jQuery.loadScript = function (url, callback) {
    jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
}





///// generate random users to seed the database with a ton of random people
function generatePeople() {

  $.ajax({
    url: 'https://randomuser.me/api?results=250&nat=us,dk,fr,gb',
    dataType: 'json',
    success: function(data) {
      // console.log(data.results);

      data.results.forEach(function(el,index){
        var fullName = el.name.first + " " + el.name.last
        var fullUsername = el.name.first[0] + el.name.last

        $.get("/createuser?name=" + fullName + "&username=" + fullUsername)
      })
    }
  });
}




/////////// identify language in text

function identifyLanguage(text) {

    $.get("/identifylanguage?text=" + text, function(data){

        var d = data
        var j = JSON.parse(d).languages[0].language

        // console.log(d)
        console.log(j)

    })
}








function embedWaves() {

  var embed = '<canvas id="waves"></canvas>'
    $("#wavesContainer").append(embed)
    var waves = new SineWaves({
      el: document.getElementById('waves'),
      speed: 3,
      width: 700,
      height: 40,
      ease: 'SineInOut',
      wavesWidth: '100%',
      waves: [
      {
        timeModifier: .5,
        lineWidth: 3,
        amplitude: -15,
        wavelength: 140
      },
      {
        timeModifier: 1.25,
        lineWidth: 2,
        amplitude: -25,
        wavelength: 270
      },
      {
        timeModifier: 0.25,
        lineWidth: 5,
        amplitude: -10,
        wavelength: 350
      }
      ],

      // Called on window resize
      resizeEvent: function() {
      var gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
      gradient.addColorStop(0,"rgba(0,0,0, 0)");
      gradient.addColorStop(0.5,"rgba(0,0,0, 1)");
      gradient.addColorStop(1,"rgba(0,0,0, 0)");

      var index = -1;
      var length = this.waves.length;
      while(++index < length){
      this.waves[index].strokeStyle = gradient;
      }

      // Clean Up
      index = void 0;
      length = void 0;
      gradient = void 0;
      }
    });
}





///////////// message array sorting function.  This is used specifically to sort arrays with dats in the [2] place
// it is used like:  a.sort(sortFunction);

function sortFunction(a, b) {
    if (a[2] === b[2]) {
        return 0;
    }
    else {
        return (a[2] < b[2]) ? -1 : 1;
    }
}









////////////////////////// function dialogue for the dialogue stack
//////////////////// Dialogue Stack variables
var intents = []
var entities = []
var quantity = 0
var machineResponse = ""
var userResponse = ""
var showDemo;

function dialogue(text) {

    // clear metadata
    intents = []
    entities = []
    quantity = 0
    machineResponse = ""

    // Prepare dailogue text by downcasing
    var preparedText = text.toLowerCase()

    ////////////////////// Run through to find intents, calculate the intent here

    // Text wants to "create", so unify for add, new, create, start, etc.
    if (preparedText.includes("create") || preparedText.includes("add") || preparedText.includes("new") || preparedText.includes("start") || preparedText.includes("make")) {
        intents.push("add")
    }
    if (preparedText.includes("hello") || preparedText.includes("hi") || preparedText.includes("hey")) {
        intents.push("hello")
    }
    if (preparedText.includes("last") || preparedText.includes("recent")) {
        intents.push("recent")
    }
    if (preparedText.includes("fill") || preparedText.includes("fix") || preparedText.includes("check")) {
        intents.push("fix")
    }
    if (preparedText.includes("find") || preparedText.includes("show") || preparedText.includes("calculate") || preparedText.includes("can i see")) {
        intents.push("find")
    }
    if (preparedText.includes("help")) {
        intents.push("help")
    }
    if (preparedText.includes("save")) {
        intents.push("save")
    }
    if (preparedText.includes("upload") || preparedText.includes("up load") || preparedText.includes("load up") || preparedText.includes("loadup")) {
        intents.push("upload")
    }
    if (preparedText.includes("tutorial") || preparedText.includes("demo") || preparedText.includes("run through")) {
        if (preparedText.includes("manual") || preparedText.includes("directed")) {
          intents.push("manual tutorial")
        } else {
          intents.push("tutorial")
        }
    }
    if (preparedText.includes("average") || preparedText.includes("mean")) {
        intents.push("average")
    }
    if (preparedText.includes("merge")) {
        intents.push("merge")
    }
    if (preparedText.includes("top") || preparedText.includes("highest")) {
        intents.push("top")
    }
    if (preparedText.includes("setup") || preparedText.includes("set up")) {
        intents.push("setup")
    }
    if (preparedText.includes("say") || preparedText.includes("speak")) {
        intents.push("say")
    }
    if (preparedText.includes("play")) {
        intents.push("play")
    }
    if (preparedText.includes("can you text") || preparedText.includes("send a text") || preparedText.includes("text my friend")) {
        intents.push("text")
    }
    if (preparedText.includes("take me to") || preparedText.includes("direct me to") || preparedText.includes("direct to") || preparedText.includes("navigate me to") || preparedText.includes("navigate to")) {
        intents.push("navigate")
    }
    if (preparedText.includes("open")) {
        intents.push("open")
    }
    if (preparedText.includes("close")) {
        intents.push("close")
    }
    if (preparedText.includes("remove")) {
        intents.push("remove")
    }
    if (preparedText.includes("off")) {
        intents.push("off")
    }
    if (preparedText.includes("on")) {
        intents.push("on")
    }
    if (preparedText.includes("lock")) {
        intents.push("lock")
    }
    if (preparedText.includes("unlock")) {
        intents.push("unlock")
    }
    if (preparedText.includes("activate")) {
        intents.push("activate")
    }
    if (preparedText.includes("deactivate")) {
        intents.push("deactivate")
    }
    if (preparedText.includes("start")) {
        intents.push("start")
    }
    if (preparedText.includes("stop")) {
        intents.push("stop")
    }
    if (preparedText.includes("arm")) {
        intents.push("arm")
    }
    if (preparedText.includes("unarm")) {
        intents.push("unarm")
    }
    if (preparedText.includes("trigger")) {
        intents.push("trigger")
    }



    ////////////////////// Determine entities from text
    if (preparedText.includes("document") || preparedText.includes("documents") || preparedText.includes("doc")) {
        entities.push("document")
    }
    if (preparedText.includes("file")) {
        entities.push("file")
    }
    if (preparedText.includes("uploads") || preparedText.includes("upload")) {
        entities.push("upload")
    }
    if (preparedText.includes("map")) {
        entities.push("map")
    }
    if (preparedText.includes("tables")) {
        entities.push("tables")
    }
    if (preparedText.includes("presentation")) {
        entities.push("presentation")
    }
    if (preparedText.includes("api")) {
        entities.push("api")
    }
    if (preparedText.includes("video") || preparedText.includes("youtube")) {
        entities.push("video")
    }
    if (preparedText.includes("music") || preparedText.includes("song")) {
        entities.push("music")
    }
    if (preparedText.includes("media")) {
        entities.push("media")
    }
    if (preparedText.includes("contact")) {
        entities.push("contact")
    }
    if (preparedText.includes("window")) {
        entities.push("window")
    }
    if (preparedText.includes("door")) {
        entities.push("door")
    }
    if (preparedText.includes("climate")) {
        entities.push("climate")
    }
    if (preparedText.includes("dash")) {
        entities.push("dash")
    }
    if (preparedText.includes("port")) {
        entities.push("port")
    }
    if (preparedText.includes("engine")) {
        entities.push("engine")
    }
    if (preparedText.includes("trunk")) {
        entities.push("trunk")
    }
    if (preparedText.includes("lights")) {
        entities.push("lights")
    }
    if (preparedText.includes("charging")) {
        entities.push("charging")
    }
    if (preparedText.includes("emergency")) {
        entities.push("emergency")
    }
    if (preparedText.includes("flashers")) {
        entities.push("flashers")
    }
    if (preparedText.includes("roof")) {
        entities.push("roof")
    }
    if (preparedText.includes("theft alarm")) {
        entities.push("theft")
    }
    if (preparedText.includes("parking brake")) {
        entities.push("pbrake")
    }
    if (preparedText.includes("parking ticket")) {
        entities.push("pticket")
    }
    if (preparedText.includes("valet")) {
        entities.push("valet")
    }
    if (preparedText.includes("gas flap")) {
        entities.push("gflap")
    }

    ///////////////////////// Determine if there is a quantity mentioned, here we calculate quantities

    if (preparedText.includes("first") || preparedText.includes("second") || preparedText.includes("third") || preparedText.includes("1") || preparedText.includes("2") || preparedText.includes("3")) {

        if (preparedText.includes("first") || preparedText.includes("1")) {
            quantity = 1
        } else if (preparedText.includes("second") || preparedText.includes("2")) {
            quantity = 2
        } else if (preparedText.includes("third") || preparedText.includes("3")) {
            quantity = 3
        } else if (preparedText.includes("fourth") || preparedText.includes("4")) {
            quantity = 4
        } else if (preparedText.includes("fifth") || preparedText.includes("5")) {
            quantity = 5
        } else if (preparedText.includes("sixth") || preparedText.includes("6")) {
            quantity = 6
        } else if (preparedText.includes("seventh") || preparedText.includes("7")) {
            quantity = 7
        }

    } else if (preparedText.includes("one") || preparedText.includes("two") || preparedText.includes("three")) {
        if (preparedText.includes("one")) {
            quantity = 1
        } else if (preparedText.includes("two")) {
            quantity = 2
        } else if (preparedText.includes("three")) {
            quantity = 3
        } else if (preparedText.includes("four")) {
            quantity = 4
        } else if (preparedText.includes("five")) {
            quantity = 5
        } else if (preparedText.includes("six")) {
            quantity = 6
        } else if (preparedText.includes("seven")) {
            quantity = 7
        }
    }

    if (preparedText.includes("dozen")) {

        if (quantity == 0) {
            quantity = 1
        }
        quantity = quantity*12
    }



    //////////////// Dialogue Stack after we've determined intents and entitites

    // We just wanted to say hello!
    if (intents.indexOf("hello") > -1) {

      machineResponse = "Hi there"

      // if we also want the machine to say it..
      if (intents.indexOf("say") > -1) {
          machineResponse = "Hello there."
          responsiveVoice.speak(machineResponse, "UK English Female", {rate: 1});

          setTimeout(function(){
            writeDialogue(machineResponse)
          }, 750)
      }
    }


    if (intents.indexOf("find") > -1 && preparedText.includes("ad")) {

        $(".content .item").fadeOut(150)
        $(".content .score").fadeOut(150)
        $(".content h3").fadeOut(150)
        $(".content p").fadeOut(150)
        setTimeout(function() {
          $(".search").css("display", "block").css("opacity","1")          
          $(".search .element").each(function(index, el) {
            var d = 175
            d = d*(index+1)
            console.log(el)
            setTimeout(function(){
              $(el).addClass("in")
            },d)
          })
        }, 300)
    }


    ///////// deal with navigation

    if (intents.indexOf("upload") > -1 && entities.indexOf("file") > -1) {
        // upload
        $(".uploads-form").addClass("in")
        setTimeout(function() {
          $(".uploads-form .file-input").click()
        }, 250)
    }


    // Log intents, entities
    console.log("Intents: " + intents)
    console.log("Entities: " + entities)



    // If we're in a place where we want the user input to show as a message...
    // and make sure there is a message

    if (typeof outputDialogue != "undefined") {
        writeDialogue(preparedText)
    }

}








///////// output dialoge
function writeDialogue(m,d) {

    var delay = d

    if (typeof d == "undefined") {
      delay = 7500
    }

    // Create the message html object
    var messageHtml = '<p class="out message"><span>' + m + '</span></p>'

    // Append to conversation list
    $(".dialogue").append(messageHtml)

    // Turn on new message
    setTimeout(function() {
      
      // Move the message
      $(".dialogue p.out").removeClass("out")

      // eliminate readout
      $("#readout").val("")

      var el = $(".dialogue p").last()

      // prepare to fade this
      setTimeout(function() {
          el.addClass("fadeout")

          setTimeout(function() {
            el.remove()
          }, 150)
      }, delay)

    }, 120)
}




