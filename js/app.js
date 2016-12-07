// Global Variables

var map;

var bounceTimer;

var markers = [];


function init() {


    map = new google.maps.Map(document.getElementById('gmap'), {
        center: { lat: 40.730610, lng: -73.935242},
        zoom: 10
    });

    if(!map) {
        alert("Google Maps are not available. Please try again later!!!");
        return;
    }

    // Famous location of NewYork City

    var marklocations = [
        {
            title: 'Central Park',
            location: {lat: 40.785091 ,lng: -73.968285 },
            id: 'ChIJ4zGFAZpYwokRGUGph3Mf37k'
        },
        {
            title: 'Empire State Building',
            location: {lat: 40.748817, lng: -73.985428},
            id: 'ChIJaXQRs6lZwokRY6EFpJnhNNE'
        },
        {
            title: 'Statue of Liberty',
            location: {lat: 40.689247,lng: -74.044502},
            id: 'ChIJPTacEpBQwokRKwIlDXelxkA'
        },
        {
            title: 'Rockefeller Center',
            location: {lat: 40.758438,lng: -73.978912},
            id: 'ChIJ9U1mz_5YwokRosza1aAk0jM'
        },
        {
            title: 'Grand Central Station',
            location: {lat: 40.752998,lng: -73.977056},
            id: 'ChIJhRwB-yFawokRi0AhGH87UTc'
        }
    ];



    var infoWindow = new google.maps.InfoWindow();

    // Get position and title from array

    for (var i = 0; i < marklocations.length; i++) {
        var position = marklocations[i].location;
        var title = marklocations[i].title;
        var locId = marklocations[i].id;

            var marker = new google.maps.Marker({
                map: map,
                title: title,
                animation: google.maps.Animation.DROP,
                position: position,
                id: locId
            });

            marker.addListener('click', function() {
                viewInfoWindow(this, infoWindow);
            });


        markers.push(marker);

        //Event listeners for animating the marker

        google.maps.event.addListener(marker, 'mouseover', function() {
                if (this.getAnimation() === null || typeof this.getAnimation() === undefined) {
                    clearTimeout(bounceTimer);

                    var that = this;

                    bounceTimer = setTimeout(function() {
                        that.setAnimation(google.maps.Animation.BOUNCE);
                    },
                    1);
                }
            });

            google.maps.event.addListener(marker, 'mouseout', function() {

                if (this.getAnimation() !== null) {
                    this.setAnimation(null);
                }
                clearTimeout(bounceTimer);
            });
     }



    // Search box code

    var searchBox = new google.maps.places.SearchBox(document.getElementById('schAdd'));

    var input = document.getElementById('pac-input');

    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);

    searchBox.setBounds(map.getBounds());

    // When user selects any prediction from the Picklist

    searchBox.addListener('schAdd', function() {

        searchPlaces(this);
    });

    // After selecting the prediction user clicks GO button

    document.getElementById('letsgo').addEventListener('click', nearByPlaces);

}


// Knockout ViewModel code which includes wikipedia api

var ViewModel = function() {

    var self = this;

    getWiki = function() {

           // Wikipedia Api code
           var wikiTitle = document.getElementById('schAdd').value;

           var wikiurl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + wikiTitle + '&format=json&callback=wikiCallback';

            $.ajax({
                url: wikiurl,
                dataType: 'jsonp',
            }).done(function(response) {
                var wikiInfo = response[1];
                var wikiStore = wikiInfo[0];
                var url = 'http://en.wikipedia.org/wiki/' + wikiStore;
                $('.wiki-links').append('<li><a href="' + url + '">' + wikiStore + '</a></li>');
                }).fail(function() {
                     alert("Failed to get Wikipedia response");
                }, 8000);
    };


};


ko.applyBindings(new ViewModel());


    // Hard coded locations info window details.


    function viewInfoWindow(marker, infowindow) {
        if(infowindow.marker != marker) {
            infowindow.marker = marker;
            getPlaces(marker, infowindow);
        }
    }


   // This function will loop through the listings and hide all of them

    function hideMarkers(markers) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }

    // This function fires when the user selects a searchbox picklist item.

    function searchPlaces(searchBox) {
        hideMarkers(markers);
        var places = searchBox.getPlaces();

        //For each place, get icon, name and location
        if(places.length === 0) {
            window.alert('We did not find any places matching that search');
        } else {
            showMarkers(places);
        }
    }


    // This function fire when user selects GO on places search.
    // It will do a nearby search using the entered query string or place.

    function nearByPlaces() {
        var bounds = map.getBounds();
        hideMarkers(markers);

        var placesService = new google.maps.places.PlacesService(map);
        placesService.textSearch({
            query: document.getElementById("schAdd").value,
            bounds: bounds
        }, function(results, status) {
            if(status === google.maps.places.PlacesServiceStatus.OK) {
                showMarkers(results);
            }
        });
    }

    // Function specially for search box entered locations
    // This function create markers for each place found in either places search

    function showMarkers(places) {
        var bounds = new google.maps.LatLngBounds();
        for(var i= 0; i < places.length; i++) {
            var place = places[i];
            var icon = {
                url: place.icon,
                size: new google.maps.Size(40, 40),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(15, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place

            var marker = new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                animation: google.maps.Animation.DROP,
                position: place.geometry.location,
                id: place.place_id
            });

            google.maps.event.addListener(marker, 'mouseover', function() {
                if (this.getAnimation() === null || typeof this.getAnimation() === undefined) {
                    clearTimeout(bounceTimer);

                    var that = this;

                    bounceTimer = setTimeout(function() {
                        that.setAnimation(google.maps.Animation.BOUNCE);
                    },
                    1);
                }
            });

            google.maps.event.addListener(marker, 'mouseout', function() {

                if (this.getAnimation() !== null) {
                    this.setAnimation(null);
                }
                clearTimeout(bounceTimer);
            });


// Single infowindow for place details

    var infoWindow = new google.maps.InfoWindow();

// if a marker is clicked, show place details

    marker.addListener('click', function() {
        if(infoWindow.marker == this) {
            console.log("This Infowindow already is on this marker!");
        } else {
            getPlaces(this, infoWindow);
        }
    });
            markers.push(marker);
            if(place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        }
        map.fitBounds(bounds);
     }

    // Place details search function - which is executed when marker is selected
    // for more details for user

     function getPlaces(marker, infowindow) {
        var service = new google.maps.places.PlacesService(map);
        service.getDetails({
            placeId: marker.id
        }, function(place, status) {
            if(status === google.maps.places.PlacesServiceStatus.OK) {

                // Set marker property on this infowindow

                infowindow.marker = marker;

                var contentString = '<div>' + '<strong>' + place.name + '</strong>' + '<br>' + place.formatted_address +
                                    '<br>' + 'Phone Number: ' + place.international_phone_number + '<br>' + 'Place Rating: ' + place.rating +'/5' +
                                    '<br><br><img src="' + place.photos[0].getUrl({ maxHeight: 100, maxWidth: 200}) + '">' + '<br>' + 'WikiLink:' + '<br><a href="http://en.wikipedia.org/wiki/' + place.name + '">' + place.name +  '</a></div>';

                infowindow.setContent(contentString);
                infowindow.open(map, marker);
                infowindow.addListener('closeclick', function() {
                    infowindow.marker = null;
                });
            }
        });
     }
