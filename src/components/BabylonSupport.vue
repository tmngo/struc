<script>
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

export default {
  name: 'BabylonSupport',
  inject: ['SceneReady'],
  props: {
    coords: Array,
    fixity: Array,
    renderingGroup: Number,
    scale: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      scene: null,
      mesh: null,
    }
  },
  watch: {
    coords: {
      handler: function() {
        this.replace();
      },
      deep: true,
    },
    scale: {
      handler: function() {
        this.update();
      },
    },
    fixity: {
      handler: function() {
        this.replace();
      },
      deep: true,
    }
  },
  computed: {
    f () {
			return math.sqrt(this.node.loads[0]**2 + this.node.loads[1]**2);
		},
    lines() {
      return [
        // Fx
        [
          new BABYLON.Vector3(this.coords[0] - 0.25 * this.scale, this.coords[1], this.coords[2]),
          new BABYLON.Vector3(this.coords[0] - 1.2 * this.scale, this.coords[1], this.coords[2])
        ],
        [
          new BABYLON.Vector3(this.coords[0] - 0.25 * this.scale, this.coords[1], this.coords[2]),
          new BABYLON.Vector3(this.coords[0] - 0.5 * this.scale, this.coords[1] - 0.25 * this.scale, this.coords[2])
        ],
        [
          new BABYLON.Vector3(this.coords[0] - 0.25 * this.scale, this.coords[1], this.coords[2]),
          new BABYLON.Vector3(this.coords[0] - 0.5 * this.scale, this.coords[1] + 0.25 * this.scale, this.coords[2])
        ],
        // Fy
        [
          new BABYLON.Vector3(this.coords[0], this.coords[1] - 0.25 * this.scale, this.coords[2]),
          new BABYLON.Vector3(this.coords[0], this.coords[1] - 1.2 * this.scale, this.coords[2])
        ],
        [
          new BABYLON.Vector3(this.coords[0], this.coords[1] - 0.25 * this.scale, this.coords[2]),
          new BABYLON.Vector3(this.coords[0] - 0.25 * this.scale, this.coords[1] - 0.5 * this.scale, this.coords[2])
        ],
        [
          new BABYLON.Vector3(this.coords[0], this.coords[1] - 0.25 * this.scale, this.coords[2]),
          new BABYLON.Vector3(this.coords[0] + 0.25 * this.scale, this.coords[1] - 0.5 * this.scale, this.coords[2])
        ],
        // Fz
        [
          new BABYLON.Vector3(this.coords[0], this.coords[1], this.coords[2] - 0.25 * this.scale),
          new BABYLON.Vector3(this.coords[0], this.coords[1], this.coords[2] - 1.2 * this.scale)
        ],
        [
          new BABYLON.Vector3(this.coords[0], this.coords[1], this.coords[2] - 0.25 * this.scale),
          new BABYLON.Vector3(this.coords[0], this.coords[1] - 0.25 * this.scale, this.coords[2] - 0.5 * this.scale)
        ],
        [
          new BABYLON.Vector3(this.coords[0], this.coords[1], this.coords[2] - 0.25 * this.scale),
          new BABYLON.Vector3(this.coords[0], this.coords[1] + 0.25 * this.scale, this.coords[2] - 0.5 * this.scale)
        ],
      ];
    },
    colors() {
      let magenta = new BABYLON.Color4(1,0,1,1);
      return [
        [magenta, magenta],
        [magenta, magenta],
        [magenta, magenta],
        [magenta, magenta],
        [magenta, magenta],
        [magenta, magenta],
        [magenta, magenta],
        [magenta, magenta],
        [magenta, magenta],
      ];
    },
    visibleLines() {
      return this.lines.filter((line, i) => this.fixity[Math.floor(i / 3)], this);
    },
    visibleColors() {
      return this.colors.filter((color, i) => this.fixity[Math.floor(i / 3)], this);
    },
    lineOptions() {
      return {
        lines: this.visibleLines,
        colors: this.visibleColors,
        updatable: true,
      };
    },
    lineOptionsUpdate() {
      return {
        lines: this.visibleLines,
        colors: this.visibleColors,
        instance: this.mesh,
      };
    },
  },
  created() {
  },
  async mounted() {
    this.scene = await this.SceneReady;
    this.init()
  },
  destroyed() {
    this.destroy()
  },
  methods: {
    init() {
      this.mesh = BABYLON.MeshBuilder.CreateLineSystem("testLines", this.lineOptions, this.scene);
      this.mesh.renderingGroupId = this.renderingGroup;
    },
    update() {
      if (this.mesh) {
        this.mesh = BABYLON.MeshBuilder.CreateLineSystem("testLines", this.lineOptionsUpdate);
      }
    },
    replace() {
      this.destroy();
      this.init();
    },
    destroy() {
      if (this.mesh) {
        this.mesh.dispose();
      }
    }
  },
  render() {

  }
}
</script>
