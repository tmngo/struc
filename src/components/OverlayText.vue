<template>
  <div 
    v-show="updated"
    class="node-label"
    :style="style"
  >
    {{ prefix + value }}
  </div>
</template>

<script>
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import debounce from 'lodash.debounce';

export default {
  name: 'OverlayText',
  inject: ['ViewportReady'],
  props: {
    coords: Array,
    prefix: {
      type: String,
      default: '',
    },
    value: {
      type: [String, Number],
    },
    rotation: {
      type: Number,
      default: 0,
    },
    viewport: Object,
    transform: Object,
    world: Object,
    offsetX: {
      type: Number,
      default: 0,
    },
    offsetY: {
      type: Number,
      default: 0,
    },
    opacity: {
      type: Number,
      default: 0,
    }
  },
  data() {
    return {
      updated: false,
      screenVector: null,
      top: 0,
      left: 0,
      showText: false,
      debounceUpdate: debounce(function() {
        this.update();
        this.updated = true;
      }, 50)
    }
  },
  watch: {
    coords: {
      handler: function() {
        this.updated = false;
        this.debounceUpdate();
      },
    },
    viewport: {
      handler: function() {
        this.updated = false;
        this.debounceUpdate();
      },
      deep: true,
    },
    transform: {
      handler: function() {
        this.updated = false;
        this.debounceUpdate();
      },
      deep: true,
    }
  },
  computed: {
    position() {
      return new BABYLON.Vector3(...this.coords);
    },
    style() {
      return { 
        top: `${this.top}px`,
        left: `${this.left}px`,
        transform: `translate(${-50}%,${-50}%) 
            rotate(${this.rotation}rad) 
            translate(${this.offsetX}%,${this.offsetY}%)`,
        'background-color': `rgba(32,32,32,${this.opacity})`,
      }
    },
  },
  created() {
  },
  mounted() {
    this.debounceUpdate();
  },
  destroyed() {
  },
  methods: {
    update() {
      if (!this.transform) {
        return;
      }
      this.screenVector = BABYLON.Vector3.Project(
        this.position,
        this.world,
        this.transform,
        this.viewport,
      );
      this.top = this.screenVector.y;
      this.left = this.screenVector.x;
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
div {
  color: #ffffff30;
  width: min-content;
}
</style>