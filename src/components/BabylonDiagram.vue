<script>
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

export default {
  name: 'BabylonDiagram',
  inject: ['SceneReady'],
  props: {
    config: Object,
    coords: Array,
    fixity: Array,
    forcesEnd: Array,
    dispsEnd: Array,
    section: Object,
    material: Object,
    n: {
      type: Number,
    },
    renderingGroup: Number,
    scale: {
      type: Number,
      default: 1,
    },
    diagramScales: Object,
    type: Number,
    w: {
      type: Array,
    },
  },
  data() {
    return {
      scene: null,
      mesh: null,
    }
  },
  watch: {
    n: {
      handler: function() {
        this.replace();
      },
    },
    fixity: {
      handler: function() {
        this.update();
      },
      deep: true,
    },
    elements: {
      handler: function() {
        this.replace();
      },
      deep: true,
    },
    'config.diagramScale': {
      handler: function() {
        this.update();
      },
    },
    w: {
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
    dx() {
      return this.coords[1][0] - this.coords[0][0];
    },
    dy() {
      return this.coords[1][1] - this.coords[0][1];
    },
    l() {
      return Math.sqrt((this.x1-this.x0)**2 + (this.y1-this.y0)**2);
    },
    totalScale () {
      return this.scale * this.config.diagramScale * this.typeScales[this.type];
    },
    xT () {
			return (this.y0 - this.y1) / (this.l) * this.totalScale;
		},
		yT () {
			return (this.x1 - this.x0) / (this.l) * this.totalScale;
    },
    typeScales() {
      return [
        1, 
        this.diagramScales.w/2, 
        this.diagramScales.v, 
        this.diagramScales.m, 
        this.diagramScales.r, 
        this.diagramScales.d
      ]
    },
    EI() {
      return this.material.E * this.section.Iz;
    },
    values() {
      switch (this.type) {
        case 0:
          return []
        case 1:
          return this.loadValues;
        case 2: 
          return this.shearValues;
        case 3: 
          return this.momentValues;
        case 4: 
          return this.rotationValues;
        case 5:
          return this.dispValues;
        default:
          return [];
          break;
      }
    },
    loadValues() {
      let arr = [this.w[1]];
      for (let i = 1; i < this.n; i++) {
        arr.push(this.w[1])
      }
      arr.push(this.w[1])
      return arr;
    },
    momentValues() {
      let arr = [-this.forcesEnd[2]];
      for (let i = 1; i < this.n; i++) {
        let x = i/this.n * this.l;
        arr.push(
          -this.forcesEnd[2] // -M
          + this.forcesEnd[1] * x // V*x
          + this.w[1]/2 * x**2, // 0.5w*x^2
        )
      }
      arr.push(this.forcesEnd[5])
      return arr;
    },
    curvatureValues() {
      let arr = [-this.forcesEnd[2]/this.EI];
      for (let i = 1; i < this.n; i++) {
        let x = i/this.n * this.l;
        arr.push(
          (-this.forcesEnd[2] // -M
          + this.forcesEnd[1] * x // V*x
          + this.w[1]/2 * x**2) / this.EI // 0.5w*x^2
        )
      }
      arr.push(this.forcesEnd[5] / this.EI)
      return arr;
    },
    rotationValues() {
      let arr = [this.dispsEnd[2]]
      for (let i = 1; i < this.n; i++) {
        let x = i/this.n * this.l;
        arr.push(
          this.dispsEnd[2] // -theta
          + (-this.forcesEnd[2] * x
          + 0.5 * this.forcesEnd[1] * x**2 // V*x
          + this.w[1]/6 * x**3) // 0.5w*x^2
          / this.EI
        )
      }
      arr.push(this.dispsEnd[5])
      return arr;
    },
    dispValues() {
      let arr = [this.dispsEnd[1]]
      for (let i = 1; i < this.n+1; i++) {
        let x = i/this.n * this.l;
        arr.push(
          this.dispsEnd[1] 
          + this.dispsEnd[2] * x // -theta
          + (-this.forcesEnd[2]/2 * x**2
          + this.forcesEnd[1]/6 * x**3 // V*x
          + this.w[1]/24 * x**4) // 0.5w*x^2
          / this.EI 
        )
      }
      return arr;
    },
    shearValues() {
      let arr = [this.forcesEnd[1]];
      for (let i = 1; i < this.n; i++) {
        arr.push(
          this.forcesEnd[1] // V
          + this.w[1] * (i/this.n * this.l) // w*x
        )
      }
      arr.push(-this.forcesEnd[4])
      return arr;
    },
    lines() {
      if (this.type === 0) {
        return [];
      }
      // initial vertical line
      let arr = [
        [
          new BABYLON.Vector3(this.x0, this.y0),
          new BABYLON.Vector3(this.x0 + this.xT * this.values[0], this.y0 + this.yT * this.values[0]),
        ],
      ]
      // line segments
      for (let i = 0; i < this.n; i++) {
        let j = i+1;
        arr.push([
            new BABYLON.Vector3(this.x0 + i/this.n*this.dx + this.xT * this.values[i], this.y0 + i/this.n*this.dy + this.yT * this.values[i]),
            new BABYLON.Vector3(this.x0 + j/this.n*this.dx + this.xT * this.values[j], this.y0 + j/this.n*this.dy + this.yT * this.values[j]),
          ])
      }
      // final vertical line
      arr.push(
        [
          new BABYLON.Vector3(this.x1 + this.xT * this.values[this.n], this.y1 + this.yT * this.values[this.n]),
          new BABYLON.Vector3(this.x1, this.y1),
        ],
      )
      return arr;
    },
    colors() {
      let color = new BABYLON.Color4(0.2,0.8,0.7,1);
      let arr = []
      for (let i = 0; i < this.n+2; i++) {
        arr.push([color, color])
      }
      return arr;
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
