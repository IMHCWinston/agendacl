<template>
  <v-dialog :value="value" max-width="600" @input="$emit('input', $event)">
    <v-card>
      <v-card-title>Create Task</v-card-title>
      <v-divider />
      <v-card-text>
        <v-form>
          <v-text-field label="Title" />
          <v-select v-model="label" :items="labels" item-text="name" item-value="id" label="Label" :disabled="labelSelectDisabled" />
          <v-textarea label="Description" rows="2" no-resize />
          <v-row>
            <v-col cols="6">
              <v-menu>
                <template #activator="{ on, attrs }">
                  <v-text-field v-model="date" autocomplete="false" readonly v-bind="attrs" label="Due Date" v-on="on" />
                </template>
                <v-date-picker v-model="date" :min="dateNow" />
              </v-menu>
            </v-col>
            <v-col cols="6">
              <v-menu v-model="menuDisplay" :close-on-content-click="false">
                <template #activator="{ on, attrs }">
                  <v-text-field v-model="time" readonly v-bind="attrs" label="Due Time" v-on="on" />
                </template>
                <v-time-picker v-model="time" ampm-in-title @click:minute="menuDisplay=false" />
              </v-menu>
            </v-col>
          </v-row>
          <div class="d-flex justify-end">
            <v-btn color="primary" @click="submit">Save</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex'
import moment from 'moment';

export default {
  name: 'AppDialogsCreate',
  props: {
    value: Boolean
  },
  data() {
    return {
      title: '',
      date: moment().toISOString(true).substr(0, 10),
      dateNow: moment().toISOString(true).substr(0, 10),
      time: '',
      menuDisplay: false,
      label: { id: 0, name: 'None' }

    }
  },
  computed: {
    labels() {
      return this.$store.state.entries.labels
    },
    labelSelectDisabled() {
      if (this.labels.length === 0) {
        return true
      }
      return false
    }
  },
  methods: {

    ...mapActions('entries', ['createTask']),
    async submit() {
      this.$emit('closeEditDialog')

      let newTask = { //sample normal task
        id: undefined,
        title: this.title,
        labelId: undefined,

        description: this.description, //user description, if empty set to ""
        dueDate: moment(this.date).toISOString(true),
        dateCreated: moment().toISOString(true),
        hasDueTime: false,
        hasDueDate: true,
        isCompleted: false,
        isDeleted: false,
        isClassroomCourseWork: false
      }
      if (this.label.id !== 0) {
        newTask.labelId = this.label
      }

      if (this.time !== '') {
        newTask.hasDueTime = true
        newTask.dueDate = moment(this.date + ' ' + this.time).toISOString(true)
      }

      await this.createTask(newTask)
    }
  }
}
</script>

<style>

</style>
