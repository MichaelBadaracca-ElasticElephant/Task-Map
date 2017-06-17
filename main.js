var item = Vue.component( 'task', {
    template: `
                <li class="task-in-list">
                    <h2>{{task.title}}</h2>
                    <h3>{{task.time}}</h3>
                    <h3>{{task.locationName}}</h3>
                    <h3>{{task.address}}</h3>
                    <button>Edit</button>
                </li>
              `,
    data: function () {
        return {}
    },
    props: ['task'],
    computed: {

    },
    methods: {
        //check to see if not enough money
        //buyItem: function ( item ) {
        //    this.$emit( 'buy-item', item )
        //},
        //sellItem: function ( item ) {
        //    this.$emit( 'sell-item', item )
        //}
    }
});


var mainAppVm = new Vue( {
    el: '#app',
    data: {
        taskList: [
            //Create Task
            {
                id:1,
                title: "Pick Up Package",
                descrition: "Pick up package from post office",
                date: "6/18/2017",
                time: "1:30 pm",
                duration: 0.25,
                locationName: "Moorehad Post Office",
                address:"4985 Moorhead Ave, Boulder, CO 80305"
            },
            {
                id: 2,
                title: "Get Beer",
                descrition: "Get beer for Micahl's party",
                date: "6/18/2017",
                time: "4:30 pm",
                duration: 0.25,
                locationName: "Hazel's Beverage World",
                address: "1955 28th St, Boulder, CO 80301"
            },
            {
                id: 3,
                title: "Micahl's Party",
                descrition: "Micahl's birthday party",
                date: "6/18/2017",
                time: "7:00 pm",
                duration: 0.25,
                locationName: "Hapa",
                address: "1117 Pearl St, Boulder, CO 80302"
            },
            {
                id: 4,
                title: "Micahl's Party",
                descrition: "Micahl's birthday party",
                date: "6/18/2017",
                time: "7:00 pm",
                duration: 0.25,
                locationName: "Hapa",
                address: "1117 Pearl St, Boulder, CO 80302"
            }

        ]
    },

    computed: {
    },
    methods: {
        newTask: function () {
            this.taskList.push( {
                id: this.taskList.length,
                title: "Untitled Task",
                descrition: "",
                date: "",
                time: "",
                duration: 0,
                locationName: "",
                address: ""
            })
            //create new task and push onto array
            //make it the selected task
        }
    }
})