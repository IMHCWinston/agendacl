<template>
  <div v-if="loading" class="loading-page">
    <v-progress-circular
      indeterminate
      color="indigo"
    />
  </div>
</template>

<script>
export default {
  data: () => ({
    loading: false
  }),
  methods: {
    start() {
      this.loading = true
    },
    finish() {
      this.loading = false
    }
  }
}
</script>

<style scoped>
  .loading-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 1);
    text-align: center;
    font-size: 30px;
    font-family: sans-serif;
    z-index: 10000;
    padding-top: 45vh;
    }
    .indigo--text {
        color:#9FA8DA
    }
</style>
