<template>
  <v-dialog :value="value" max-width="600" @input="onDialogExit">
    <v-card max-height="90vh" style="overflow-y: hidden">
      <div class="d-flex flex-column" style="max-height: inherit">
        <v-card-title>Manage Labels</v-card-title>
        <v-divider />
        <div class="flex-grow-1 light-scrollbar" style="overflow-y: auto">
          <v-list class="pa-0">
            <v-card>
              <v-list-item>
                <v-row class="pa-0 ma-0">
                  <v-col cols="6" class="py-0">
                    <v-select
                      v-model="select" :items="items" item-text="courseName" item-value="id" label="Subject"
                      return-object
                    />
                  </v-col>
                  <v-col cols="6" class="py-0">
                    <v-text-field
                      v-model="select.name"
                      autofocus
                      autocomplete="off"
                      label="Label"
                      counter="10"
                      append-outer-icon="mdi-plus"
                      @click:append-outer="addLabel"
                    />
                  </v-col>
                </v-row>
              </v-list-item>
              <v-spacer />
              <v-divider />
              <v-list-item v-for="(item, index) in labels" :key="item.id"
                           :item="item"
                           :index="index"
              >
                <v-row class="pa-0 ma-0">
                  <v-col cols="6" class="py-0">
                    <v-text-field v-model="item.courseName" readonly />
                  </v-col>
                  <v-col cols="6" class="py-0">
                    <v-text-field
                      v-model="item.name"
                      label="Label"
                      append-outer-icon="mdi-delete"
                      @click:append-outer="deleteDialogLabel(item,index)"
                    />
                  </v-col>
                </v-row>
              </v-list-item>
            </v-card>
          </v-list>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'AppDialogsLabel',

  props: {
    value: Boolean
  },
  data() {
    return {
      select: { id: undefined, name: '', isGCLabel: false, courseName: 'Custom Label' },
      items: [],
      labels: []

    }
  },
  computed: {
    label() {
      return this.$store.state.entries.labels
    }

  },
  watch: {
    label: {
      deep: true,
      handler(labels) {
        this.labels = JSON.parse(JSON.stringify(labels))
      }
    }
  },

  async created() {
    let GCLabels = await this.getGCLabels()
    console.log(GCLabels)
    let labels = this.$store.state.entries.labels
    for (let i = 1; i < labels.length; i++) {
      let index = GCLabels.findIndex(function(o) {
        return o.courseId === labels[i].courseId;
      })
      GCLabels.splice(index, 1);
    }
    this.items = GCLabels
    this.labels = []
    for (let obj of this.label) {
      this.labels.push(Object.assign({}, obj))
    }
  },
  methods: {
    ...mapActions('entries', ['createLabel', 'updateLabel', 'deleteLabel']),
    async getGCLabels() {
      let GCLabels = [{ id: undefined, name: '', isGCLabel: false, courseName: 'Custom Label' }]
      const courses = await this.$axios.$get('api/list-courses')

      for (let i = 0; i < courses.length; i++) {
        const newGClabel = {
          id: undefined,
          name: '',
          isGCLabel: true,
          courseId: courses[i].id,
          courseName: courses[i].name
        }
        GCLabels.push(newGClabel)
      }

      return GCLabels
    },
    async addLabel() {
      if (this.select.name !== '') {
        await this.createLabel([this.select])
        this.select = { id: undefined, name: '', isGCLabel: false, courseName: 'Custom Label' }
      }
    },
    async deleteDialogLabel(label, index) {
      console.log(index)
      await this.updateLabel(this.labels)
      await this.deleteLabel([[label], index])
    },
    async onDialogExit() {
      console.log(this.labels)
      await this.updateLabel(this.labels)
      this.select = { id: undefined, name: '', isGCLabel: false, courseName: 'Custom Label' }
      this.$emit('input', this.$event);
    }

  }
}
</script>
