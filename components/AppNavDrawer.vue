<template>
  <v-navigation-drawer :value="value" temporary absolute @input="$emit('input', $event)">
    <v-list shaped>
      <v-list-item-group v-model="selected" color="primary" mandatory>
        <v-list-item v-for="(item, i) in items" :key="i">
          <v-list-item-icon>
            <v-icon>{{ item.iconTitle }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script>

export default {
  name: 'AppNavDrawer',
  props: {
    value: Boolean
  },
  data() {
    return {
      selected: 0,
      items: [
        { name: 'Agenda', iconTitle: 'mdi-book' }
        // { name: 'Tasks', iconTitle: 'mdi-clipboard-check' },
        // { name: 'Labels', iconTitle: 'mdi-tag' },
        // { name: 'Settings', iconTitle: 'mdi-cog' }
      ]
    }
  }
}
</script>
