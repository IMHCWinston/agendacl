<template>
  <v-app-bar app>
    <v-tooltip bottom>
      <template #activator="{ on, attrs }">
        <v-app-bar-nav-icon v-bind="attrs" v-on="on" @click.stop="$emit('nav-icon-click')" />
      </template>
      <span>Main Menu</span>
    </v-tooltip>
    <!-- App Logo Here -->
    <v-toolbar-title />
    <v-spacer />
    <v-btn-tooltip tooltip="Previous Week" icon @click="$emit('prev-week')">
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn-tooltip>

    <v-menu offset-y>
      <template #activator="{ on, attrs }">
        <v-btn text v-bind="attrs" v-on="on">
          <v-toolbar-title>{{ label }}</v-toolbar-title>
        </v-btn>
      </template>
      <v-date-picker v-model="date" @click:date="computeWeek" />
    </v-menu>

    <v-btn-tooltip icon tooltip="Next Week" @click="$emit('next-week')">
      <v-icon>mdi-chevron-right</v-icon>
    </v-btn-tooltip>
    <v-spacer />
    <v-btn-tooltip icon tooltip="Go to Homepage">
      <v-icon>mdi-home</v-icon>
    </v-btn-tooltip>
    <v-btn-tooltip icon tooltip="Log out" @click="redirect">
      <v-icon>mdi-logout</v-icon>
    </v-btn-tooltip>
  </v-app-bar>
</template>

<script>
import moment from 'moment'

export default {
  name: 'AppNavBar',
  props: {
    currWeek: Number,
    url: String
  },
  data() {
    return {
      date: moment().toISOString(true).substr(0, 10)
    }
  },

  computed: {
    weekData() {
      let mon = this.moment().day(1 + (this.currWeek * 7))
      let sun = this.moment().day(7 + (this.currWeek * 7))

      mon = mon.format('D MMMM')
      sun = sun.format('D MMMM')

      return { mon, sun }
    },
    label() {
      let label = ''
      if (this.currWeek === 0) {
        label = "This Week's Diary"
      } else if (this.currWeek === 1) {
        label = "Next Week's Diary"
      } else if (this.currWeek === -1) {
        label = "Last Week's Diary"
      } else {
        label = this.weekData.mon + ' - ' + this.weekData.sun
      }
      label = this.weekData.mon + ' - ' + this.weekData.sun
      return label
    }

  },

  methods: {
    moment() {
      return moment();
    },
    redirect() {
      window.location.href = this.url;
    },
    computeWeek() {
      let setDate = moment(this.date, 'YYYY-MM-DD').day(7)
      let currentSunday = moment().day(6)
      let diffDay = setDate.diff(currentSunday, 'day')
      let diffWeek = (diffDay / 7)
      this.$emit('change-week', diffWeek)
      // this works, idk how, but im not coplaining
    }
  }

}
</script>
