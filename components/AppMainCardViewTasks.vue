<template>
  <v-dialog :value="value" max-width="600" @input="$emit('input', $event)">
    <v-card max-height="90vh" style="overflow-y: hidden">
      <div class="d-flex flex-column" style="max-height: inherit">
        <v-card-title>View Tasks</v-card-title>
        <v-divider />
        <div class="flex-grow-1" style="overflow-y: auto">
          <v-expansion-panels accordion>
            <!--Ideally use v-for-->
            <AppTaskEP
              v-for="task in tasks"
              :key="task.dueDate + task.id"
              :task="task"
            />
          </v-expansion-panels>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from 'moment'

export default {
  name: 'AppMainCardViewTasks',
  props: {
    value: Boolean,
    tasks: {
      type: Array,
      default() {
        return []
      }
    },
    day: {
      type: Object,
      default() {
        return moment()
      }
    }
  },
  data() {
    return {
    }
  },
  methods: {
    tasksView() {
      let todaysTasks = []
      let tasks = this.tasks
      let i = 0; let len = tasks.length

      while (i < len) {
        if (tasks[i].hasDueDate) {
          let date = tasks[i].dueDate
          date = moment(date)

          if (date.isSame(this.day, 'day')) {
            todaysTasks.push(tasks[i])
          }
        }
        i++
      }
      const newarr = todaysTasks.sort((a, b) => {
        return moment(a.dueDate).diff(b.dueDate);
      });

      return todaysTasks //array of tasks filtered depending on day
    }
  }
}
</script>
