<script>
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

export default {
  name: 'BabylonLoad',
  inject: ['SceneReady'],
  props: {
    coords: Array,
    loads: Array,
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
        this.update();
      },
      deep: true,
    },
    scale: {
      handler: function() {
        this.update();
      },
    },
    loads: {
      handler: function() {
        this.replace();
      },
      deep: true,
    }
  },
  computed: {
    f () {
			return math.sqrt(this.loads[0]**2 + this.loads[1]**2);
    },
    m () {
			return this.loads[2]
    },
    angle() {
      return math.atan2(this.loads[1], this.loads[0])
    },
    quaternion() {
      return new BABYLON.Quaternion(0, 0, 0, this.angle)
    },
    lines() {
      let arr = [];
      let matrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Z, this.angle);
      let v1 = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(-0.25, 0, 0), matrix).scale(this.scale);
      if (this.f !== 0) {
        arr.push([
          v1,
          BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(-1.2, 0, 0), matrix).scale(this.scale),
        ],
        [
          v1,
          BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(-0.4, -0.15, 0), matrix).scale(this.scale)
        ],
        [
          v1,
          BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(-0.4, 0.15, 0), matrix).scale(this.scale)
        ])
      }
      if (this.m !== 0) {
        let sign = this.m > 0 ? 1 : -1;
        arr.push([
          new BABYLON.Vector3(-0.215*sign, -0.52, 0).scale(this.scale),
          new BABYLON.Vector3(0, -0.61, 0).scale(this.scale)
        ],
        [
          new BABYLON.Vector3(0.43*sign, -0.43, 0).scale(this.scale),
          new BABYLON.Vector3(0, -0.61, 0).scale(this.scale)
        ],
        
        [
          new BABYLON.Vector3(0.43*sign, 0.43, 0).scale(this.scale),
          new BABYLON.Vector3(0, 0.61, 0).scale(this.scale)
        ],
        [
          new BABYLON.Vector3(0, 0.61, 0).scale(this.scale),
          new BABYLON.Vector3(-0.215*sign, 0.52, 0).scale(this.scale)
        ])
        arr.push([
          new BABYLON.Vector3(0.43*sign, -0.43, 0).scale(this.scale),
          new BABYLON.Vector3(0.61*sign, 0, 0).scale(this.scale)
        ],
        [
          new BABYLON.Vector3(0.61*sign, 0, 0).scale(this.scale),
          new BABYLON.Vector3(0.43*sign, 0.43, 0).scale(this.scale),
        ],
        [
          new BABYLON.Vector3(-0.43*sign, 0.43, 0).scale(this.scale),
          new BABYLON.Vector3((-.43+.081)*sign, 0.43+.196, 0).scale(this.scale),
        ],
        [
          new BABYLON.Vector3(-0.43*sign, 0.43, 0).scale(this.scale),
          new BABYLON.Vector3((-.43+.196)*sign, (.43-0.081), 0).scale(this.scale),
        ])
      }
      

      return arr;
    },
    colors() {
      let color = new BABYLON.Color4(1,0.3,0.3,1);
      return [
        [color, color],
        [color, color],
        [color, color],
        [color, color],
        [color, color],
        [color, color],
        [color, color],
        [color, color],
        [color, color],
        [color, color],
        [color, color],
        [color, color],
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
      this.mesh.position = new BABYLON.Vector3(...this.coords)
    },
    update() {
      if (this.mesh) {
        this.mesh = BABYLON.MeshBuilder.CreateLineSystem("testLines", this.lineOptionsUpdate);
        this.mesh.position = new BABYLON.Vector3(...this.coords)
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
