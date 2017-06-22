var item = Vue.component( 'task', {
    template: `
                <div class="task-in-list" v-on:click="selectTask(task)" v-bind:class='{selected:task.isSelected}' v-bind:class='{hovered:task.isHovered}'>          
                    <h2>{{i + 1}}. {{task.title}}</h2>    
                    <div class="task-info">
                        <h4>{{time()}} on {{task.dateTime.toDateString()}}</h4>
                        <h4>{{task.locationName}}</h4>
                        <h4>{{task.address}}</h4>
                    </div>
                    <div class="task-controls">
                        <button class="glyphicon glyphicon-trash btn btn-danger" v-on:click="removeTask(task)"></button>
                    
                    </div>
                    
                </div>
              `,
        //<button class="glyphicon glyphicon-pencil btn btn-info" v- on:click = "" ></button >
    props: ['task', 'i'],
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