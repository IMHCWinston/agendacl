import Vue from 'vue'
export const state = () => ({
  tasks: [],
  labels: []
})
export const actions = {
  async getTasksQ(state) { //called once onload ~ 200-1500 ms
    const tasks = await this.$axios.$get('api/retrieve-tasks-q')
    state.commit('overwrite', tasks)
    return tasks
  },
  async getTasksL(state) { //called once onload ~ 5000 ms
    const tasks = await this.$axios.$get('api/retrieve-tasks-l')
    state.commit('overwrite', tasks)
    return tasks
  },
  async createTask(state, task) { //called from InputModal component
    //commits create task to the db
    const newTask = await this.$axios.$post('api/create-tasks', [task])
    state.commit('createTask', newTask[0])
    return newTask[0]
  },
  async updateTask(state, task) {
    if (await this.$axios.$post('api/update-tasks', [task])) {
      state.commit('updateTask', task)
      return true
    } else { return false }
  },
  async deleteTask(state, task) {
    if (await this.$axios.$post('api/delete-tasks', [task])) {
      state.commit('deleteTask', task)
      return true
    } else { return false }
  },
  //labels
  async getLabels(state) {
    const labels = await this.$axios.$get('api/retrieve-labels')
    state.commit('getLabels', labels)
    return labels
  },
  async createLabel(state, labels) {
    const createLabel = await this.$axios.$post('api/create-labels', labels)
    state.commit('createLabel', createLabel)
    return labels
  },
  async updateLabel(state, labels) {
    if (await this.$axios.$post('api/update-labels', labels)) {
      state.commit('getLabels', labels)
      return true
    } else { return false }
  },
  async deleteLabel(state, labels) {
    await this.$axios.$post('api/delete-labels', labels[0])
    state.commit('deleteLabel', labels[1])
    return true
  }

}
export const mutations = {
  overwrite(state, entries) {
    state.tasks = entries
  },
  createTask(state, entry) {
    state.tasks.push(entry)
  },
  updateTask(state, entry) {
    //find the index of the updated task
    const taskIndex = state.tasks.findIndex(task => task.id === entry.id);
    //updates the task
    //state.tasks[taskIndex] = entry
    Vue.set(state.tasks, taskIndex, entry)
  },
  deleteTask(state, entry) {
    //find the index of the updated task
    const taskIndex = state.tasks.findIndex(task => task.id === entry.id);

    state.tasks.splice(taskIndex, 1);
  },

  getLabels(state, labels) {
    state.labels = labels
  },
  createLabel(state, labels) {
    labels = labels[0]
    state.labels.push(labels)
  },
  deleteLabel(state, labelIndex) {
    //find the index of the updated task

    state.labels.splice(labelIndex, 1);
  }
}
