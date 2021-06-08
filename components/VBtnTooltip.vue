<template>
  <v-tooltip :bottom="bottom" :left="left" :right="right" :top="top">
    <template #activator="{on, attrs}">
      <v-btn ref="tooltipButton" retain-focus-on-click v-bind="{...$attrs,...attrs}" :class="classBtn" :style="styleBtn" v-on="{...$listeners,...on}" @click.stop="raiseClickEvent">
        <slot />
      </v-btn>
    </template>
    <span> {{ tooltip }} </span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'VBtnTooltip',
  props: {
    tooltip: { type: String, required: false, default: '' },
    'tooltip-pos': { type: String, required: false, default: 'bottom' },
    'class-btn': { type: String, required: false, default: '' },
    'style-btn': { type: String, required: false, default: '' }
  },
  computed: {
    bottom() {
      if (this.tooltipPos === 'bottom') {
        return true
      }
      return false
    },
    top() {
      if (this.tooltipPos === 'top') {
        return true
      }
      return false
    },
    left() {
      if (this.tooltipPos === 'left') {
        return true
      }
      return false
    },
    right() {
      if (this.tooltipPos === 'right') {
        return true
      }
      return false
    }
  },
  methods: {
    raiseClickEvent() {
      this.$refs.tooltipButton.$el.blur();
    }
  }
};
</script>
