<template>
  <v-main>
    <v-container>
      <v-row justify="center">
        <v-col v-for="day in dayDatas" :key="day.format('d')" cols="12" sm="6" md="4">
          <AppMainCard :day="day" @view-tasks-click="$emit('view-tasks-click')" />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>

export default {
  name: 'AppMain',

  props: {
    dayDatas: Array
  },
  data() {
    return {

    }
  },
  methods: {

  }
}
</script>
