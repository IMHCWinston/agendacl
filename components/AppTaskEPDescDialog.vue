<template>
  <v-dialog :value="value" max-width="600" @input="$emit('input',$event)">
    <v-card max-height="90vh" style="overflow-y: hidden">
      <div class="d-flex flex-column" style=" overflow-y: hidden">
        <v-card-title>Description</v-card-title>
        <div class="flex-grow-1" style="overflow-y: auto">
          <v-card-actions class="pb-0">
            <v-textarea class="mb-0 pb-0 textarea-max" rows="1" auto-grow solo readonly :value="task.description" />
          </v-card-actions>
        </div>
        <v-card-title v-if="task.isClassroomCourseWork">Classroom Description</v-card-title>
        <div v-if="task.isClassroomCourseWork" class="flex-grow-1" style="overflow-y: auto">
          <v-card-actions class="pb-0">
            <v-textarea class="mb-0 pb-0 textarea-max" rows="1" auto-grow solo readonly :value="task.courseWorkDescription" />
          </v-card-actions>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  name: 'AppTaskEPDescDialog',
  props: {
    value: Boolean,
    task: {
      type: Object,
      default() {
        return { id: undefined }
      }
    }
  }
}
</script>
<style scoped>
.textarea-max::v-deep textarea{
   max-height: 70vh;
    overflow: auto;
}
</style>
