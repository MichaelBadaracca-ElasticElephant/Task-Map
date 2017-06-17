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

    },
    methods: {
        getPlacesScript: function () {
            $.get( "/googleMapsApiKey", function ( googleMapsApiKey ) {
                var googlePlacesApiScript = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
                $.getScript( googlePlacesApiScript, function () {
                    console.log( "Google places script loaded" );
                    // Initialize Autocomplete once the script is loaded
                    // Need to reference as mainAppVm rather than this, because it is being called outside of the Vue scope
                    mainAppVm.initAutocomplete();
                    
                });
            });
        },
        testFunction: function () {
            console.log( "Test function" );
        },
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
            console.log( "Select class" );
            this.selectedTask = task;
        }
    },
    created: function () {
        this.selectedTask = this.taskList[0];
        this.getPlacesScript();
        
    }
})