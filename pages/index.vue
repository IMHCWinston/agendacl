
<template>
  <v-app dark>
    <AppNavBar :curr-week="currWeek"
               :url="url"
               @nav-icon-click="drawer = !drawer" @prev-week="currWeek = currWeek - 1" @next-week="currWeek = currWeek + 1"
               @change-week="changeWeek"
    />
    <AppNavDrawer v-model="drawer" />
    <a :href="url">login</a>
    <AppMain
      :day-datas="dayDatas"

      @create-btn-click="dialogCreate=true"

      @view-tasks-click="dialogViewTasks=true"
    />
    <AppFooter />
  </v-app>
</template>

<script>
import moment from 'moment'
import { mapActions } from 'vuex'

export default {
  name: 'App',
  async asyncData({ $axios }) { //asyncData hook is called before created hook, use to preload components
    const url = await $axios.$get('api/google-url');
    console.log(url)
    return { url } //url is appended to vue data property
  },

  data: () => ({
    //Auth
    signedIn: false,
    //Time control
    dayData: moment(),
    currWeek: 0,
    //Toggle views
    drawer: false,
    dialogEdit: false,
    dialogLabel: false,
    dialogCreate: false,
    dialogViewTasks: false
  }),
  computed: {
    dayDatas() {
      //The week that will be displayed

      let dayDatas = []
      for (let day = 1; day < 8; day++) {
        dayDatas.push(this.moment().day(day + (this.currWeek * 7)))
      }

      return dayDatas //returns array
    },
    modalDayData() {
      return this.dayData
    }
  },
  async created() {
    this.$vuetify.theme.dark = false
    if (await this.$axios.$get('api/has-signed-in')) {
      this.signedIn = true
      await this.getTasksQ()
      await this.getLabels()
      await this.getTasksL()
    } else {
      this.$nuxt.$router.replace(this.url)
    }

    // Initializing the dates
  },
  methods: {
    ...mapActions('entries', ['getTasksQ', 'getTasksL', 'getLabels']),
    moment() {
      return moment();
    },
    async addTask(task) {
      task = [task]

      const res = await this.$axios.$post('api/create-tasks', task)

      this.entrie = [...this.entrie, res[0]]
    },
    async toggleComplete(entry) {
      const updEntry = { ...entry, isCompleted: !entry.isCompleted }

      await this.$axios.$post('api/update-tasks', [updEntry])
      const res = await this.$axios.$get('api/retrieve-tasks-q')

      this.entrie = res
    },
    openModal(dayData) {
      this.dayData = dayData
    },
    changeWeek(diff) {
      this.currWeek = diff
    }
  }

};

/*
THINGS TO DO
5. Add Tooltips
*/

</script>

<style>
html {
  overflow-y:auto
}

.light-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.light-scrollbar::-webkit-scrollbar-thumb {
  background: #b0b0b0;
  border-radius: 7px;
}

</style>
