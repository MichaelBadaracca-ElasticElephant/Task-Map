var item = Vue.component( 'task', {
    template: `
                <div class="task-in-list" v-on:click="selectTask(task)">          
                    <h2>{{i + 1}}. {{task.title}}</h2>    
                    <div class="task-info">
                        <h4>{{time()}} on {{task.dateTime.toDateString()}}</h4>
                        <h4>{{task.locationName}}</h4>
                        <h4>{{task.address}}</h4>
                    </div>
                    <div class="task-controls">
                        <button class="glyphicon glyphicon-trash btn btn-danger" v-on:click="removeTask(task)"></button>
                        <button class="glyphicon glyphicon-pencil btn btn-info" v-on:click=""></button>
                    </div>
                    
                </div>
              `,
    props: ['task','i'],
    data: function () {
        return {}
    },
    
    computed: {

    },
    methods: {
        removeTask: function ( task ) {
            this.$emit( 'remove-task', task );
        },
        selectTask: function ( task ) {
            this.$emit( 'select-task', task );
        },
        time: function () {
            var time = formatAMPM( this.task.dateTime );
            return time;
        }
    }
});

var mainAppVm = new Vue( {
    el: '#app',
    data: {
        previouslySelectedTask: {},
        selectedTask: {},
        selectedTimeAsString: "",
        placesSearch: {},
        autocomplete: {},
        directionsDisplay: null,
        directionsService: null,
        taskList: [
            {
                title: "Pick Up Delivery Truck",
                description: "Pick up delivery truck",
                dateTime: new Date( "2017-06-22T10:00" ),
                locationName: "Open Door Brewing Company",
                address: "2030 Ionosphere St G, Longmont, CO 80504, USA",
                lat: 40.1343087,
                lng: -105.10346270000002,
            },
            {
                title: "Hazel's Delivery",
                description: "5 cases Libertas, 5 cases Over the Moon, 5 cases Hopgave",
                dateTime: new Date( "2017-06-22T11:00" ),
                locationName: "Hazel's Beverage World",
                address: "1955 28th St, Boulder, CO 80301",
                lat: 40.0207742,
                lng: -105.26005520000001,
            },
            {
                title: "Perry's Sales Call",
                description: "Meet with Steve Lucheck",
                dateTime: new Date( "2017-06-22T12:30" ),
                locationName: "Parry's Pizzeria & Bar",
                address: "100 E 120th Ave, Northglenn, CO 80233, USA",
                lat: 39.9123284,
                lng: -104.9869617,
            },
            {
                title: "Petty John's Delivery",
                description: "10 cases Libertas, 10 cases Hopgave",
                dateTime: new Date( "2017-06-22T14:00" ),
                locationName: "Pettyjohn's Liquor and Wine (and Beer!)",
                address: "613 S Broadway, Boulder, CO 80305, USA",
                lat: 39.98448500000001,
                lng: -105.25003600000002,
            },
            {
                title: "Rayback Sales Call",
                description: "Meet with Janet Blucher",
                dateTime: new Date( "2017-06-22T15:00" ),
                locationName: "Rayback Collective",
                address: "2775 Valmont Rd, Boulder, CO 80304, USA",
                lat: 40.029514,
                lng: -105.25940400000002,
            },
            {
                title: "Collaboration Meeting at Odd 13",
                description: "Meet with head brewer",
                dateTime: new Date( "2017-06-22T16:30" ),
                locationName: "Dark Horse",
                address: "301 E Simpson St, Lafayette, CO 80026, USA",
                lat: 39.9983913,
                lng: -105.08785339999997,
            },
            {
                title: "Delivery at Dark Horse",
                description: "1 1/2 bbl Libertas, 1/6 bbl Over the Moon",
                dateTime: new Date( "2017-06-22T18:00" ),
                locationName: "Hazel's Beverage World",
                address: "2922 Baseline Rd, Boulder, CO 80303, USA",
                lat: 39.999115,
                lng: -105.25519229999998,
            },
            //{
            //    title: "Drop Off Delivery Truck",
            //    description: "Pick up delivery truck",
            //    dateTime: new Date( "2017-06-22T20:00" ),
            //    locationName: "Open Door Brewing Company",
            //    address: "2030 Ionosphere St G, Longmont, CO 80504, USA",
            //    lat: 40.1343087,
            //    lng: -105.10346270000002,
            //},
        ],
    },

    computed: {
        mapData: function () {
            var mapMarkers = [];
            var points = [];

            for ( var taskCount = 0; taskCount < this.taskList.length; taskCount++ ) {
                var task = this.taskList[taskCount];
                //create a marker
                //mapMarkers.push( this.makeMarker( task, taskCount ) );

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
        },
        map: function () {
            return new google.maps.Map( document.getElementById( 'map' ), {
                zoom: 13,
                center: { lat: this.taskList[0].lat, lng: this.taskList[0].lng }
            });
        },
    },
    watch: {
        // whenever question changes, this function will run
        mapData: function () {
            console.log( "Refreshing map" )
            this.drawMap();
        },
        selectedTimeAsString: function () {
            var dateObj = new Date( this.selectedTimeAsString );
            this.selectedTask.dateTime = dateObj;
            this.sortTasksByTime();
        }
    },
    methods: {
        getMapScript: function () {
            $.get( "/googleMapsApiKey", function ( googleMapsApiKey ) {
                var googleMapsApiScript = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=mainAppVm.initMap`;
                $.getScript( googleMapsApiScript, function () {
                    console.log( "Google maps script loaded" );
                    mainAppVm.initAutocomplete();
                });
            });
        },
        testFunction: function () {
            console.log( "Test function" );
        },
        //*** MAPS START ***
        initMap: function () {

            this.directionsDisplay = new google.maps.DirectionsRenderer;
            this.directionsDisplay.setOptions( {
                suppressMarkers: false,
                //draggable: true
                //markerOptions: new google.maps.markerOptions()
            })
            this.directionsService = new google.maps.DirectionsService;
            this.directionsDisplay.setMap( this.map );
            this.drawMap();
        },

        drawMap: function () {
            this.calculateAndDisplayRoute( this.directionsService, this.directionsDisplay, this.mapData );
        },

        calculateAndDisplayRoute: function ( directionsService, directionsDisplay, mapData ) {
            var selectedMode = "DRIVING"
            directionsService.route( {
                origin: mapData.startingPoint,
                destination: mapData.endingPoint,
                waypoints: mapData.wayPoints,
                optimizeWaypoints: false,
                travelMode: google.maps.TravelMode[selectedMode]
            }, function ( response, status ) {
                if ( status == 'OK' ) {
                    directionsDisplay.setDirections( response );
                } else {
                    window.alert( 'Directions request failed due to ' + status );
                }
            });
        },
        makeMarker: function ( task, count ) {
            new google.maps.Marker( {
                position: { lat: task.lat, lng: task.lng },
                map: this.map,
                label: makeMarkerLabel(task,count)
                //draggable:true
            })
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
                selected: true,
                description: "",
                dateTime: new Date(),
                locationName: "",
                address: "",
                lat: 0,
                lng: 0
            };
            this.taskList.push( newTask );
            this.selectedTask = newTask;

            //create new task and push onto array
            //make it the selected task
        },
        removeTask: function ( task ) {
            this.taskList.splice( $.inArray( task, this.taskList ), 1 );
        },
        selectTask: function ( task ) {
            this.selectedTask = task;
            //Update selected time as string for date picker
            console.log( "*************" )
            console.log( "Tasks Time", this.selectedTask.dateTime );
            //console.log( "Tasks time as string", convertDateTimeToLocalString( this.selectedTask.dateTime ) )


            this.selectedTimeAsString = convertDateTimeToLocalString( this.selectedTask.dateTime );
            console.log( "*************" )

        },
    },
    created: function () {
        this.sortTasksByTime()
        this.selectedTask = this.taskList[0];
        this.selectedTask = this.taskList[0];
        this.selectedTime = this.selectedTask.dateTime;
        
    },
    beforeCreate: function () {
        getMapScript();
    }
})

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
    var markerLabel = `${count + 1} - ${time} `
    return markerLabel;
}

function getMapScript() {
    $.get( "/googleMapsApiKey", function ( googleMapsApiKey ) {
        var googleMapsApiScript = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=mainAppVm.initMap`;
        $.getScript( googleMapsApiScript, function () {
            console.log( "Google maps script loaded" );
            mainAppVm.initAutocomplete();
        });
    });
}

//Set a variable to true on a task when selected
//When a different task 


//Convert local string to date
//Convert date to local string