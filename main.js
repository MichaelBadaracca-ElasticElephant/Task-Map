var item = Vue.component( 'task', {
    template: `
                <li class="task-in-list" v-on:click="selectTask(task)">
                    <h2>{{task.title}}</h2>
                    <h3>{{task.dateTime.toString()}}</h3>
                    <h3>{{task.locationName}}</h3>
                    <h3>{{task.address}}</h3>
                    <button v-on:click="removeTask(task)">Remove</button>
                </li>
              `,
    data: function () {
        return {}
    },
    props: ['task'],
    computed: {

    },
    methods: {
        removeTask: function ( task ) {
            this.$emit( 'remove-task', task );
        },
        selectTask: function ( task ) {
            this.$emit( 'select-task', task );
        }
    }
});

var mainAppVm = new Vue( {
    //components: { VueTimepicker },
    el: '#app',
    data: {

        selectedTask: {},
        selectedTimeAsString: "",
        placesSearch: {},
        autocomplete: {},
        directionsDisplay: null,
        directionsService: null,
        taskList: [
            //Create Task
            {
                id: 1,
                title: "Pick Up Package",
                description: "Pick up package from post office",
                date: "6/18/2017",
                time: "1:30 pm",
                dateTime: new Date( "2017-06-19T14:45" ),
                duration: 0.25,
                locationName: "Moorehad Post Office",
                address: "4985 Moorhead Ave, Boulder, CO 80305",
                lat: 39.9866824,
                lng: -105.23722179999999,
            },
            {
                id: 2,
                title: "Get Beer",
                description: "Get beer for Micahl's party",
                date: "6/18/2017",
                time: "4:30 pm",
                dateTime: new Date( "2017-06-19T20:30" ),
                duration: 0.25,
                locationName: "Hazel's Beverage World",
                address: "1955 28th St, Boulder, CO 80301",
                lat: 40.0207742,
                lng: -105.26005520000001,
            },
            {
                id: 3,
                title: "Micahl's Party",
                description: "Micahl's birthday party",
                date: "6/18/2017",
                time: "7:00 pm",
                dateTime: new Date( "2017-06-19T03:15" ),
                duration: 0.25,
                locationName: "Hapa",
                address: "1117 Pearl St, Boulder, CO 80302",
                lat: 40.018063,
                lng: -105.28089749999998,
            }
        ],
    },

    computed: {
        mapData: function () {
            var mapMarkers = [];
            var points = [];


            for ( var taskCount = 0; taskCount < this.taskList.length; taskCount++ ) {
                var task = this.taskList[taskCount];
                //create a marker
                mapMarkers.push( this.makeMarker( task, taskCount ) );

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
            console.log( "#######" )
            console.log( "SelectedTimeAsString", this.selectedTimeAsString );



            var dateObj = new Date( this.selectedTimeAsString );
            console.log( "DateObj", dateObj );
            this.selectedTask.dateTime = dateObj;
            console.log( "#######" )
            this.sortTasksByTime();
        }
    },
    methods: {
        getMapScript: function () {
            console.log( "GOT HERE" );
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
                suppressMarkers: true,
                draggable: true
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
                label: this.makeMarkerLabel(task,count)
                //draggable:true
            })
        },
        makeMarkerLabel: function ( task, count ) {
            var time = this.formatAMPM( task.dateTime );
            var markerLabel = `${count+1} - ${time} `
            return markerLabel;
        },
        formatAMPM: function ( date ) {
            //Code modified from this forum: https://stackoverflow.com/questions/8888491/how-do-you-display-javascript-datetime-in-12-hour-am-pm-format
            //TODO: fix timezone offset problem
            var timeZoneOffset = date.getTimezoneOffset();
            var timeZoneOffsetInHours = timeZoneOffset / 60;

            var hours = date.getHours();
            //console.log("INITIAL HOURS", date.getHours() );
            //console.log( "OFFSET HOURS", hours );


            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
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
                id: this.taskList.length,
                title: "Untitled Task",
                description: "",
                date: "",
                time: "",
                dateTime: "",
                duration: 0,
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
        initializeDatePicker: function () {
            $( '#scrollDefaultExample' ).timepicker( { 'scrollDefault': 'now' });
        }
    },
    created: function () {
        this.sortTasksByTime()
        this.selectedTask = this.taskList[0];
        this.selectedTime = this.selectedTask.dateTime;
        this.getMapScript();

    }
})

$( document ).ready( function () {
    mainAppVm.initializeDatePicker();
    updateLocalTimePicker( mainAppVm.selectedTask.dateTime );
})

function convertDateTimeToLocalString( datetime ) {
    //BUG: for some reason converting to the ISO string is off by 6 hours
    //as a temporary admittedly hacky work around you could subtract six hours before converting

    console.log( "-----------" );
    console.log( "Datetime", datetime );

    var timeZoneOffset = datetime.getTimezoneOffset();
    var timeZoneOffsetInHours = timeZoneOffset / 60;
    var offsetDateTimeInMs = datetime.setHours( datetime.getHours() - timeZoneOffsetInHours );
    var offsetDateTime = new Date( offsetDateTimeInMs )
    //console.log( "Offset datetime", offsetDateTime);

    console.log( "Timezone Offset", timeZoneOffsetInHours );
    var dateTimeISOString = offsetDateTime.toISOString();
    //var dateTimeISOString = datetime.toUTCString();
    console.log( "ISO String", dateTimeISOString )
    //this takes something like 1908-03-25T20:45:00.000Z and takes the last character off to make it 1908-03-25T20:45:00.000 which is an acceptable format for the datetime-local picker
    var dateTimeStringFormatted = dateTimeISOString.substring( 0, dateTimeISOString.length - 1 );
    console.log( "datetimeformattedd", dateTimeStringFormatted );
    console.log( "-----------" );
    return dateTimeStringFormatted;
}

function updateLocalTimePicker( datetime ) {
    document.getElementById( "date-time-picker" ).value = convertDateTimeToLocalString( datetime );
}






//sort when the date changes