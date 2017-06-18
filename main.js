var item = Vue.component( 'task', {
    template: `
                <li class="task-in-list" v-on:click="selectTask(task)">
                    <h2>{{task.title}}</h2>
                    <h3>{{task.time}}</h3>
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
            console.log( "Select Task from component" )
            this.$emit( 'select-task', task );
        }
    }
});


var mainAppVm = new Vue( {
    el: '#app',
    data: {

        selectedTask: {},
        placesSearch: {},
        autocomplete: {},
        startLat: -25.363,
        startLng: 131.044,
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
                duration: 0.25,
                locationName: "Moorehad Post Office",
                address: "4985 Moorhead Ave, Boulder, CO 80305"
            },
            {
                id: 2,
                title: "Get Beer",
                description: "Get beer for Micahl's party",
                date: "6/18/2017",
                time: "4:30 pm",
                duration: 0.25,
                locationName: "Hazel's Beverage World",
                address: "1955 28th St, Boulder, CO 80301"
            },
            {
                id: 3,
                title: "Micahl's Party",
                description: "Micahl's birthday party",
                date: "6/18/2017",
                time: "7:00 pm",
                duration: 0.25,
                locationName: "Hapa",
                address: "1117 Pearl St, Boulder, CO 80302"
            },
            {
                id: 4,
                title: "Micahl's Party",
                description: "Micahl's birthday party",
                date: "6/18/2017",
                time: "7:00 pm",
                duration: 0.25,
                locationName: "Hapa",
                address: "1117 Pearl St, Boulder, CO 80302"
            }

        ],
    },

    computed: {
        mapLocations: function () {
            //this.initMap()
            return {
                uluru: { lat: this.startLat, lng: this.startLng },
                sydney: { lat: -33.868937, lng: 151.207788 },
                brisbane: { lat: -27.465970, lng: 153.027510 },
                wayPoints: [{ location: "Brisbane, Queensland", stopover: true },
                { location: new google.maps.LatLng( - 24.990553, 151.954581 ), stopover: true }, { location: "Bundaberg, Queensland", stopover: true }]
            }
        },
        map: function () {
            console.log( "map recomputed" )
            return new google.maps.Map( document.getElementById( 'map' ), {
                zoom: 4,
                center: this.mapLocations.uluru
            });
        },
        uluruMarker: function () {
            return new google.maps.Marker( {
                position: this.mapLocations.mapLocationsuluru,
                map: this.map
            })
        },
        sydneyMarker: function () {
            return new google.maps.Marker( {
                position: this.mapLocations.sydney,
                map: this.map
            })
        },
        brisbaneMarker: function () {
            return new google.maps.Marker( {
                position: this.mapLocations.brisbane,
                map: this.map
            })
        }

    },
    watch: {
        // whenever question changes, this function will run
        mapLocations: function () {
            this.drawMap();
        }
    },
    methods: {
        getMapScript: function () {
            console.log( "GOT HERE" );
            $.get( "/googleMapsApiKey", function ( googleMapsApiKey ) {
                var googleMapsApiScript = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=mainAppVm.initMap`;
                $.getScript( googleMapsApiScript, function ( data, textStatus, jqxhr ) {
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
            this.directionsService = new google.maps.DirectionsService;
            this.directionsDisplay.setMap( this.map );
            this.drawMap();
        },

        drawMap: function () {
            this.calculateAndDisplayRoute( this.directionsService, this.directionsDisplay, this.mapLocations );
        },

        calculateAndDisplayRoute: function ( directionsService, directionsDisplay, mapLocations ) {
            var selectedMode = "DRIVING"
            directionsService.route( {
                origin: mapLocations.uluru,
                destination: mapLocations.sydney,
                waypoints: mapLocations.wayPoints,
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
            var place = autocomplete.getPlace();
            this.selectedTask.address = place.formatted_address;
            this.selectedTask.locationName = place.name;

        },
        //*** PLACES AUTOCOMPLETE END ***
        newTask: function () {

            var newTask = {
                id: this.taskList.length,
                title: "Untitled Task",
                description: "",
                date: "",
                time: "",
                duration: 0,
                locationName: "",
                address: ""
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
        },
        initializeDatePicker: function () {
            $( '#scrollDefaultExample' ).timepicker( { 'scrollDefault': 'now' });
        }
    },
    created: function () {
        this.selectedTask = this.taskList[0];
        this.getMapScript();

    }
})

$( document ).ready( function () {
    mainAppVm.initializeDatePicker();
})
