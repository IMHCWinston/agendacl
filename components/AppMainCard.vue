<template>
  <v-card class="rounded-cards mt-3" :height="cardHeight" outlined style="overflow: hidden">
    <div class="d-flex flex-column fill-height">
      <v-card-title class="blue darken-4 grey--text text--lighten-4" :class="{'red darken-4':isToday}" style="user-select:none" @click="detectClick">
        {{ day.format('dddd') }}
        <v-spacer />
        {{ day.format('D') }}
      </v-card-title>
      <v-divider />
      <div class="flex-grow-1 overflow-y-auto light-scrollbar" style="overflow-x: hidden">
        <v-expansion-panels v-model="panels" accordion>
          <AppTaskEP
            v-for="task in tasks"
            :key="task.dueDate + task.id"
            :task="task"

            @action-btn-click="retractPanel"
          />
        </v-expansion-panels>
      </div>
    </div>
    <AppMainCardCreate v-model="value" :day="day" @close-create-dialog="value=false" />
    <AppMainCardViewTasks v-model="valueView" :day="day" :tasks="tasks" />
  </v-card>
</template>
<script>
import moment from 'moment'

export default {
  name: 'AppMainCard',
  props: {
    day: {
      type: Object,
      default() {
        return moment()
      }
    }

  },
  data() {
    return {
      panels: [],
      value: false,
      valueView: false,

      timeoutId: null,
      numClicks: 0,

      isToday: moment().isSame(this.day, 'day')
    }
  },
  computed: {
    cardHeight() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs': return ''
        case 'sm': return ''
        case 'md': return '35vh'
        case 'lg': return '35vh'
        case 'xl': return '35vh'
        default : return ''
      }
    },
    tasks() {
      let todaysTasks = []
      let tasks = this.$store.state.entries.tasks
      let i = 0; let len = tasks.length

      while (i < len) {
        if (tasks[i].hasDueDate && !tasks[i].isDeleted) {
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
  },
  methods: {
    moment() {
      return moment();
    },
    retractPanel() {
      this.panels = [];
    },

    detectClick() {
      this.numClicks++;
      if (this.numClicks === 1) { // the first click in .2s
        let self = this;
        setTimeout(function() {
          switch (self.numClicks) { // check the event type
            case 1:

              self.valueView = true;
              break;
            default:

              self.value = true;
          }
          self.numClicks = 0; // reset the first click
        }, 200); // wait 0.2s
      } // if
    } // detectClick function
  }

}
</script>

<style scoped>
.rounded-cards {
  border-radius:10px;
}
</style>
