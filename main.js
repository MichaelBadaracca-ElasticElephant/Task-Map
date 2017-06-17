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
            console.log("Select Task from component")
            this.$emit( 'select-task', task );
        }
    }
});


var mainAppVm = new Vue( {
    el: '#app',
    data: {

        selectedTask: {},
        taskList: [
            //Create Task
            {
                id:1,
                title: "Pick Up Package",
                description: "Pick up package from post office",
                date: "6/18/2017",
                time: "1:30 pm",
                duration: 0.25,
                locationName: "Moorehad Post Office",
                address:"4985 Moorhead Ave, Boulder, CO 80305"
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
        //selectedTask: function () {
        //    return this.taskList[0];
        //}
    },
    methods: {
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
    }
})