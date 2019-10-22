<script>
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

export default {
  name: 'BabylonDiagram',
  inject: ['SceneReady'],
  props: {
    forcesEnd: Array,
    coords: Array,
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
    elements: {
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
  },
  computed: {
    x0() {
      return this.coords[0][0];
    },
    y0() {
      return this.coords[0][1];
    },
    x1() {
      return this.coords[1][0];
    },
    y1() {
      return this.coords[1][1];
    },
    l() {
      return Math.sqrt((this.x1-this.x0)**2 + (this.y1-this.y0)**2);
    },
    startX() {
			let x = this.x0 - this.forcesEnd[2] * this.xPerp;
			return isNaN(x) ? 0 : x;
		},
		startY() {
			let y = this.y0 - this.forcesEnd[2] * this.yPerp;
			return isNaN(y) ? 0 : y;
    },
    xPerp () {
			return (this.y0 - this.y1) / (this.l) * this.scale ;
		},
		yPerp () {
			return (this.x1 - this.x0) / (this.l) * this.scale;
		},
    lines() {
      return [
        // Fx
        [
          new BABYLON.Vector3(this.x0, this.y0),
          new BABYLON.Vector3(this.x1, this.y1)
        ],
        [
          new BABYLON.Vector3(this.x0, this.y0),
          new BABYLON.Vector3(this.x0 + this.xPerp, this.y0 + this.yPerp)
        ],
        [
          new BABYLON.Vector3(this.x1, this.y1),
          new BABYLON.Vector3(this.x1 + this.xPerp, this.y1 + this.yPerp)
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
    lineOptions() {
      return {
        lines: this.lines,
        colors: this.colors,
        updatable: true,
      };
    },
    lineOptionsUpdate() {
      return {
        lines: this.lines,
        colors: this.colors,
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
