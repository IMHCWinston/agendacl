<template>
  <v-footer>
    <v-layout class="fab-container">
      <v-btn-tooltip tooltip="Labels" tooltip-pos="top" fab dark color="red darken-4" class-btn="ma-2" @click="dialogLabel = true">
        <v-icon>mdi-tag</v-icon>
      </v-btn-tooltip>
      <v-btn-tooltip tooltip="Create task" tooltip-pos="top" fab dark color="blue darken-4" class-btn="ma-2" @click="dialogCreate = true">
        <v-icon>mdi-plus</v-icon>
      </v-btn-tooltip>
    </v-layout>
    <AppDialogsLabel :value="dialogLabel" @input="dialogLabel=$event" />
    <AppDialogsCreate :value="dialogCreate" @input="dialogCreate=$event" />
    <v-alert v-if="$nuxt.isOffline" type="warning" style="position: fixed; width: 75vw; bottom: 0; left: 12vw; z-index: 100">You are offline</v-alert>
  </v-footer>
</template>

<script>

export default {
  name: 'AppFooter',
  props: {
    dialogViewTasks: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogCreate: false,
      dialogLabel: false
    }
  }
}

</script>
<style scoped>
    .fab-container {
    display: flex;
    z-index:5;
    position: fixed;
    bottom: 0;
    right: 10px;
    }
</style>
