<template>
  <v-dialog :value="value" max-width="600" @input="$emit('input', $event)">
    <v-card>
      <v-card-title>Edit Task</v-card-title>
      <v-divider />
      <v-card-text>
        <v-form>
          <v-text-field v-model="title" label="Title" :value="title" />
          <v-select v-model="label" :items="labels" :disabled="task.isClassroomCourseWork" item-text="name" item-value="id" label="Label" />
          <v-textarea v-model="description" label="Description" rows="2" :value="description" no-resize />
          <v-row>
            <v-col cols="6">
              <v-menu>
                <template #activator="{ on, attrs }">
                  <v-text-field v-model="date" autocomplete="false" readonly :disabled="labelSelectDisabled" v-bind="attrs" label="Due Date" v-on="on" />
                </template>

                <v-date-picker v-model="date" :min="dateNow" />
              </v-menu>
            </v-col>
            <v-col cols="6">
              <v-menu v-model="menuDisplay" :close-on-content-click="false">
                <template #activator="{ on, attrs }">
                  <v-text-field v-model="time" :disabled="task.isClassroomCourseWork" readonly v-bind="attrs" label="Due Time" v-on="on" />
                </template>
                <v-time-picker v-model="time" ampm-in-title @click:minute="menuDisplay=false" />
              </v-menu>
            </v-col>
          </v-row>
          <v-card-actions class="pb-0">
            <v-spacer />
            <v-btn dark color="red" @click="deleteBtn">Delete</v-btn>
            <v-btn color="primary" @click="submit">Save</v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex'
import moment from 'moment';

export default {
  name: 'AppDialogsEdit',
  props: {
    value: Boolean,
    task: Object
  },

  data() {
    return {
      title: this.task.title,
      description: this.task.description,
      date: this.task.hasDueDate ? moment(this.task.dueDate).toISOString(true).substr(0, 10) : '',
      dateNow: moment().toISOString(true).substr(0, 10),
      time: this.task.hasDueTime ? moment(this.task.dueDate).toISOString(true).substr(11, 5) : '',

      menuDisplay: false,
      label: { id: 0, name: 'None' }

    }
  },
  computed: {
    labels() {
      return this.$store.state.entries.labels
    },
    labelSelectDisabled() {
      if (this.labels.length === 0 || this.task.isClassroomCourseWork) {
        return true
      }
      return false
    }
  },
  created() {
    const label = this.findLabel(this.task, this.labels)
    label ? this.label = label : this.label = { id: 0, courseName: 'None' }
  },
  methods: {

    ...mapActions('entries', ['updateTask', 'deleteTask']),
    findLabel(task, labels) {
      const label = labels.find(label => label.id === task.labelId);
      return label
    },
    async submit() {
      this.$emit('closeEditDialog')

      let newTask = Object.assign({}, this.task);
      newTask.title = this.title
      newTask.description = this.description
      newTask.dueDate = moment(this.date).toISOString(true)

      if (this.time !== '') {
        newTask.hasDueTime = true
        newTask.dueDate = moment(this.date + ' ' + this.time).toISOString(true)
      }

      if (this.label.id !== 0) {
        newTask.labelId = this.label
      }

      await this.updateTask(newTask)
    },

    async deleteBtn() {
      this.$emit('closeEditDialog')
      let task = Object.assign({}, this.task);
      if (task.isClassroomCoursework) {
        task.isDeleted = true
        await this.updateTask(task)
      } else {
        await this.deleteTask(task)
      }
    }
  }
}
</script>
