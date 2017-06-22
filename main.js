
var mainAppVm = new Vue( {
    el: '#app',
    data: {
        hasGoogleMapsScriptLoaded: false,
        infowindow: {},
        previouslySelectedTask: {},
        selectedTask: {},
        selectedTimeAsString: "",
        placesSearch: {},
        autocomplete: {},
        directionsDisplay: null,
        directionsService: null,
        taskList: [
            {
                title: "Start at Open Door",
                isSelected: false,
                isHovered: false,
                isCompleted: false,
                description: "Pick up delivery truck",
                dateTime: new Date( "2017-06-22T09:00" ),
                locationName: "Open Door Brewing Company",
                address: "2030 Ionosphere St G, Longmont, CO 80504, USA",
                lat: 40.1343087,
                lng: -105.10346270000002,
            },
            {
                title: "Hazel's Delivery",
                isSelected: false,
                isHovered: false,
                isCompleted: false,
                description: "5 cases Libertas, 5 cases Over the Moon, 5 cases Hopgave",
                dateTime: new Date( "2017-06-22T10:00" ),
                locationName: "Hazel's Beverage World",
                address: "1955 28th St, Boulder, CO 80301",
                lat: 40.0207742,
                lng: -105.26005520000001,
            },
            {
                title: "Harvest's Sales Call",
                isSelected: false,
                isHovered: false,
                isCompleted: false,
                description: "Meet with Steve Lucheck",
                dateTime: new Date( "2017-06-22T12:30" ),
                locationName: "Harvest Wine & Spirits",
                address: "13075 Arapahoe Ave, Boulder, CO 80303, USA",
                lat: 40.015131,
                lng: -105.25207949999998,
            },
            {
                title: "Petty John's Delivery",
                isSelected: false,
                isHovered: false,
                isCompleted: false,
                description: "10 cases Libertas, 10 cases Hopgave",
                dateTime: new Date( "2017-06-22T16:00" ),
                locationName: "Pettyjohn's Liquor and Wine (and Beer!)",
                address: "613 S Broadway, Boulder, CO 80305, USA",
                lat: 39.98448500000001,
                lng: -105.25003600000002,
            },
            {
                title: "Rayback Sales Call",
                isSelected: false,
                isHovered: false,
                isCompleted: false,
                description: "Meet with Janet Blucher",
                dateTime: new Date( "2017-06-22T10:30" ),
                locationName: "Rayback Collective",
                address: "2775 Valmont Rd, Boulder, CO 80304, USA",
                lat: 40.029514,
                lng: -105.25940400000002,
            },
            {
                title: "Collaboration Meeting at Odd 13",
                isSelected: false,
                isHovered: false,
                isCompleted: false,
                description: "Meet with head brewer",
                dateTime: new Date( "2017-06-22T13:15" ),
                locationName: "Dark Horse",
                address: "301 E Simpson St, Lafayette, CO 80026, USA",
                lat: 39.9983913,
                lng: -105.08785339999997,
            },
            {
                title: "Delivery at Dark Horse",
                isSelected: false,
                isHovered: false,
                isCompleted: false,
                description: "1 1/2 bbl Libertas, 1/6 bbl Over the Moon",
                dateTime: new Date( "2017-06-22T17:00" ),
                locationName: "Hazel's Beverage World",
                address: "2922 Baseline Rd, Boulder, CO 80303, USA",
                lat: 39.999115,
                lng: -105.25519229999998,
            },
        ],
    },

    computed: {

        //make map data the list of marker and waypoitns as data
        //it gets this information from the tasks
        //a watcher watches this infomration
        markerData: function () {


            console.log( this.taskList );

            if ( this.hasGoogleMapsScriptLoaded ) {
                var mapMarkers = [];
                var points = [];

                for ( var taskCount = 0; taskCount < this.taskList.length; taskCount++ ) {
                    var task = this.taskList[taskCount];
                    //create a marker
                    //mapMarkers.push( this.makeMarker( task, taskCount ) );
                    this.makeMarker( task, taskCount );

                }

                return "";
            } else {
                console.log( "Maps not loaded yet" )
                return false;
            }
        },

        routeData: function () {


            console.log( this.taskList );

            if ( this.hasGoogleMapsScriptLoaded ) {
                console.log("Maps Loaded now")


                var mapMarkers = [];
                var points = [];

                for ( var taskCount = 0; taskCount < this.taskList.length; taskCount++ ) {
                    var task = this.taskList[taskCount];

                    //create a waypoint if there are valid coordinates
                    //TODO: have a more rigorious test on whether the coordinates are valid
                    //Google seems to be able to tell when it give a popup saying they are invalid
                    if ( task.lat !== 0 && task.lng !== 0 ) {
                        var wayPoint = {
                            location: { lat: task.lat, lng: task.lng },
                            stopover: true
                        }
                        points.push( wayPoint );
                    }
                }

                //first marker is the start, last marker is the end, everything inbetween is a waypoint
                var routeInfo = {
                    startingPoint: points[0].location,
                    endingPoint: points[points.length - 1].location,
                    //The waypoints include everything but the first and last points
                    wayPoints: points.slice( 1, points.length - 1 ),
                }

                
                return routeInfo;
            } else {
                console.log( "Maps not loaded yet" )
                return false;
            }
        },
        map: function () {
            return new google.maps.Map( document.getElementById( 'map' ), {
                zoom: 15,
                center: { lat: this.taskList[0].lat, lng: this.taskList[0].lng }
            });
        },
    },
    watch: {
        // whenever question changes, this function will run
        routeData: function () {
            console.log( "Refreshing map" )
            this.drawRoute();
        },
        markerData: function () {
            this.directionsDisplay.setMap( this.map );
        },
        selectedTimeAsString: function () {
            var dateObj = new Date( this.selectedTimeAsString );
            this.selectedTask.dateTime = dateObj;
            this.sortTasksByTime();
        },
        hasGoogleMapsScriptLoaded: function () {
            console.log( "VALUE CHANGED", this.hasGoogleMapsScriptLoaded )
        }
    },
    methods: {
        //*** MAPS START ***
        initMap: function () {

            this.directionsDisplay = new google.maps.DirectionsRenderer;
            this.directionsDisplay.setOptions( {
                suppressMarkers: true,
                //draggable: true
                //markerOptions: new google.maps.markerOptions()
            })
            this.directionsService = new google.maps.DirectionsService;
            this.directionsDisplay.setMap( this.map );
            //this.drawRoute();
        },

        drawRoute: function () {
           
            this.calculateAndDisplayRoute( this.directionsService, this.directionsDisplay, this.routeData );
        },

        calculateAndDisplayRoute: function ( directionsService, directionsDisplay, routeData ) {

            console.log( "MAP DATA", routeData )
            var selectedMode = "DRIVING"
            directionsService.route( {
                origin: routeData.startingPoint,
                destination: routeData.endingPoint,
                waypoints: routeData.wayPoints,
                optimizeWaypoints: false,
                travelMode: google.maps.TravelMode[selectedMode]
            }, function ( response, status ) {
                if ( status == 'OK' ) {

                    console.log( "RESPONSE", response );
                    directionsDisplay.setDirections( response );

                    directionsDisplay.setMap( mainAppVm.map );
                } else {
                    window.alert( 'Directions request failed due to ' + status );
                }
            });
        },

        makeMarker: function ( task, count ) {


            //make the icon darker, the later in time it is
            //use rgb to add to the color

            var red = 255;
            var green = 255;
            var blue = 255;

            var color = `rgb(${red},${green},${blue})`;

            var multiplier = -40;

            color = `rgb(${red + count * (multiplier + 5)},${green + count * (multiplier+10)},${blue + count * multiplier})`


            //choose marker icon
            var icon = {
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: 5,
                fillColor: color,
                fillOpacity: 1,
                strokeColor: "black",
                strokeWeight:2
            };
            if ( task.isSelected ) {
                icon = {
                    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                    scale: 5,
                    fillColor: color,
                    fillOpacity: 1,
                    strokeColor: "red",
                    
                    strokeWeight: 2
                };
            }

            if ( task.isCompleted ) {
                icon = {
                    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                    scale: 5,
                    fillColor: color,
                    fillOpacity: 1,
                    strokeColor: "#3baa2c",
                    strokeWeight: 2
                };
            }

            if ( task.isHovered ) {
                icon = {
                    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                    scale: 5,
                    fillColor: color,
                    fillOpacity: 1,
                    strokeColor: "orange",
                    strokeWeight: 2
                };
            }  

            var marker = new google.maps.Marker( {
                position: { lat: task.lat, lng: task.lng },
                anchorPoint: { x: 0, y: -5 },
                map: this.map, 
                //title: task.title,
                //icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                icon: icon,
                label: makeMarkerLabel(task,count)
                //draggable:true
            })


            marker.addListener( 'mouseover', function () {
                task.isHovered = true;
            });

            // assuming you also want to hide the infowindow when user mouses-out
            marker.addListener( 'mouseout', function () {
                task.isHovered = false;
            });

            marker.addListener( 'mousedown', function () {
                

                task.isSelected = true;

                //need to make previously selected marker is selected talks
                //this.previouslySelectedTask.isSelected = false;
                
                //mainAppVm.selectTask( task );
;            });


            this.makeInfoWindow( marker, task, count );
        },

        makeInfoWindow: function ( marker, task, count ) {

            var infoWindowTemplate = 
                `<div class="task-in-list" v-on:click="selectTask(task)" v-bind:class='{selected:task.isSelected}'>          
                    <h2>${count+1}. ${task.title}</h2>    
                    <div class="task-info">
                        <h4>${formatAMPM( task.dateTime)} on ${task.dateTime.toDateString()}</h4>
                        <h4>${task.locationName}</h4>
                        <h4>${task.address}</h4>
                        <p>${task.description}</p>
                    </div>
                </div>`

            google.maps.event.addListener( marker, 'click', function () {
                infowindow.setContent( infoWindowTemplate );
                infowindow.open( map, this );
            });

        },
        
        //*** MAPS END ***

        //*** PLACES AUTOCOMPLETE START ***
        initAutocomplete: function () {
            // Referencing Google API documentation found here: https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-addressform?authuser=1
            // Create the autocomplete object, restricting the search to geographical
            // location types.
            autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */( document.getElementById( 'autocomplete' ) ),
                { types: [] });

            // When the user selects an address from the dropdown, populate the address in the corresponding task
            autocomplete.addListener( 'place_changed', this.fillInAddress );
        },
        geolocate: function () {
            // Bias the autocomplete object to the user's geographical location,
            // as supplied by the browser's 'navigator.geolocation' object.
            if ( navigator.geolocation ) {
                navigator.geolocation.getCurrentPosition( function ( position ) {
                    var geolocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    var circle = new google.maps.Circle( {
                        center: geolocation,
                        radius: position.coords.accuracy
                    });
                    autocomplete.setBounds( circle.getBounds() );
                });
            }
        },
        fillInAddress: function () {
            //Populate model with information from autocompleted place
            var place = autocomplete.getPlace();
            this.selectedTask.lat = place.geometry.location.lat()
            this.selectedTask.lng = place.geometry.location.lng()
            this.selectedTask.address = place.formatted_address;
            this.selectedTask.locationName = place.name;
        },
        //*** PLACES AUTOCOMPLETE END ***


        sortTasksByTime: function () {
            //sorts tasks by ascending order (earliest to latest)
            this.taskList.sort( function ( task1, task2 ) {
                return task1.dateTime - task2.dateTime;
            });
        },

        newTask: function () {

            var newTask = {
                title: "New Task",
                isSelected: true,
                isHovered: false,
                isCompleted: false,
                description: "",
                dateTime: new Date(),
                locationName: "",
                address: "",
                lat: 0,
                lng: 0
            };
            this.taskList.unshift( newTask );
            this.selectedTask = newTask;
            updateLocalTimePicker( mainAppVm.selectedTask.dateTime );

            //create new task and push onto array
            //make it the selected task
        },
        removeTask: function ( task ) {
            this.taskList.splice( $.inArray( task, this.taskList ), 1 );
        },
        selectTask: function ( task ) {
            this.previouslySelectedTask = this.selectedTask;
            this.selectedTask = task;
            this.previouslySelectedTask.isSelected = false;
            this.selectedTask.isSelected = true;
            this.selectedTimeAsString = convertDateTimeToLocalString( this.selectedTask.dateTime );
        },
    },
    created: function () {
        console.log( "created" );
        this.sortTasksByTime()
        this.selectedTask = this.taskList[0];
        this.selectedTask = this.taskList[0];
        this.selectedTime = this.selectedTask.dateTime;
        
    },
    beforeCreate: function () {
        getMapScript();
    }
})


//****************** END OF VUE ******************
var infowindow = {};

$( document ).ready( function () {
    updateLocalTimePicker( mainAppVm.selectedTask.dateTime );
})

function convertDateTimeToLocalString( datetime ) {
    //BUG: for some reason converting to the ISO string is off by 6 hours
    //as a temporary admittedly hacky work around you could subtract six hours before converting

    var timeZoneOffset = datetime.getTimezoneOffset();
    var timeZoneOffsetInHours = timeZoneOffset / 60;
    var offsetDateTimeInMs = datetime.setHours( datetime.getHours() - timeZoneOffsetInHours );
    var offsetDateTime = new Date( offsetDateTimeInMs )

    var dateTimeISOString = offsetDateTime.toISOString();

    //this takes something like 1908-03-25T20:45:00.000Z and takes the last character off to make it 1908-03-25T20:45:00.000 which is an acceptable format for the datetime-local picker
    var dateTimeStringFormatted = dateTimeISOString.substring( 0, dateTimeISOString.length - 1 );
    return dateTimeStringFormatted;
}

function updateLocalTimePicker( datetime ) {
    document.getElementById( "date-time-picker" ).value = convertDateTimeToLocalString( datetime );
}

function formatAMPM( date ) {
        //Code modified from this forum: https://stackoverflow.com/questions/8888491/how-do-you-display-javascript-datetime-in-12-hour-am-pm-format
        //TODO: fix timezone offset problem
        //var timeZoneOffset = date.getTimezoneOffset();
        //var timeZoneOffsetInHours = timeZoneOffset / 60;

        var hours = date.getHours();


        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
}


function makeMarkerLabel ( task, count ) {
    var time = this.formatAMPM( task.dateTime );

    //Make the title abbreviated after a certain length
    var titleLength = 7;
    var abbreviatedTitle = "";
    if ( task.title.length > titleLength ) {
        abbreviatedTitle = task.title.substring( 0, titleLength );
        abbreviatedTitle += "...";
    }

    var labelText = `${count + 1}. ${time} ${abbreviatedTitle} `
    var label = {
        text: labelText,
        color: "black",
        //fontWeight: "0px",
        fontSize: "20px",
    }
    return label;
}

function getMapScript() {
    $.get( "/googleMapsApiKey", function ( googleMapsApiKey ) {
        var googleMapsApiScript = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=mainAppVm.initMap`;
        $.getScript( googleMapsApiScript, function () {
            console.log( "Google maps script loaded" );
            mainAppVm.hasGoogleMapsScriptLoaded = true;
            mainAppVm.initAutocomplete();
            infowindow = new google.maps.InfoWindow( {
                content: "Hello"
            });
        });
    });
}