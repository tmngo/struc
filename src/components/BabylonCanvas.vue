<template>
  <div id="canvas-container">
    <canvas 
    	id="canvas"
      ref="canvas"
      :width="canvasWidth"
      :height="canvasHeight"
    > 
      <div v-if="config.supports">
        <babylon-support
          v-for="node in nodes"
          :key="node.id"
          :coords="node.coords"
          :fixity="node.fixity"
          :analysis-type="config.analysisFlag"
          :rendering-group="1"
          :scale="0.005 * cameraRadius"
        ></babylon-support>
      </div>
      <div v-if="config.appliedForces">
        <babylon-load
          v-for="node in nodes"
          :key="node.id"
          :coords="node.coords"
          :loads="node.loads"
          :renderingGroup="2"
          :scale="0.005 * cameraRadius"
        ></babylon-load>
      </div>
      <div v-if="config.diagramType !== 0">
        <babylon-diagram
          v-for="(element, i) in elements"
          :key="element.id"
          :material="materials[element.material]"
          :section="sections[element.section]"
          :config="config"
          :coords="[nodes[element.ends[0]].coords, nodes[element.ends[1]].coords]"
          :forces-end="forcesEnd[i]"
          :disps-end="elementDisplacements[i]"
          :w="element.w"
          :n="config.diagramSegments"
          :type="config.diagramType"
          :diagram-scales="diagramScales"
          :fixity="[nodes[element.ends[0]].fixity, nodes[element.ends[1]].fixity]"
          :renderingGroup="1"
          :scale="0.0005 * cameraRadius"
        ></babylon-diagram>
      </div>
    </canvas>
    <div id="canvas-overlay">
      <div v-show="config.nodeLabels">
        <overlay-text 
          v-for="node in nodes"
          :key="node.id"
          class="node-label"
          :coords="node.coords"
          :prefix="'N'"
          :value="node.n.toString()"
          :offsetY="config.nodeResults !== 0 ? -50 : 50"
          :offsetX="config.nodeResults !== 0 ? -50 : 50"
          :world="worldMatrix"
          :transform="transformMatrix"
          :viewport="viewport"
          @updated="needsUpdate = false"
        ></overlay-text>
      </div>
      <div v-show="config.nodeResults !== 0">
        <overlay-text 
          v-for="(node, i) in nodes"
          :key="node.id"
          class="node-label"
          :coords="node.coords"
          :prefix="''"
          :value="getNodeResult(i)"
          :offsetY="50"
          :offsetX="50"
          :world="worldMatrix"
          :transform="transformMatrix"
          :viewport="viewport"
          @updated="needsUpdate = false"
        ></overlay-text>
      </div>
      <div v-show="config.elementForces">
        <overlay-text 
          v-for="(element, i) in elements"
          :key="element.id"
          class="node-label"
          :coords="[
            (nodes[element.ends[0]].coords[0] + nodes[element.ends[1]].coords[0]) / 2,
            (nodes[element.ends[0]].coords[1] + nodes[element.ends[1]].coords[1]) / 2, 
            0]"
          :value="forcesAxial[i].toFixed(config.significantFigures)"
          :offsetX="0"
          :offsetY="40"
          :rotation=" -Math.atan(
            (nodes[element.ends[1]].coords[1] - nodes[element.ends[0]].coords[1]) 
                / (nodes[element.ends[1]].coords[0] - nodes[element.ends[0]].coords[0])
            )"
          :world="worldMatrix"
          :transform="transformMatrix"
          :viewport="viewport"
          :needsUpdate="needsUpdate"
          @updated="needsUpdate = false"
        ></overlay-text>
      </div>
    </div>
  </div>
</template>

<script>
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import debounce from 'lodash.debounce'
import BabylonDiagram from './BabylonDiagram'
import BabylonSupport from './BabylonSupport'
import BabylonLoad from './BabylonLoad'
import OverlayText from './OverlayText'

export default {
  name: 'BabylonCanvas',
  components: {
    BabylonDiagram,
    BabylonSupport,
    BabylonLoad,
    OverlayText,
  },
  provide() {
    return {
      SceneReady: this.SceneReady,
      ViewportReady: this.ViewportReady,
    };
  },
  props: {
    config: Object,
    nodes: Array,
    elements: Array,
    materials: Array,
    sections: Array,
    elementDisplacements: Array,
    forcesAxial: Array,
    forceAxialMax: Number,
    forcesEnd: Array,
    input: Object,
    nodeReactions: Array,
    nodeDisplacements: Array,
    diagramScales: Object,
  },
  data() {
    return {
      needsUpdate: false,
      nodeLabels: [],
      label: null,
      axes: null,
      axisRadius: 1,
      camera: null,
      cameraRadius: 1,
      canvas: null,
      canvasHeight: 720,
      canvasWidth: 1280,
      engine: null,
      scene: null,
      drag: false,
      dX: 0,
      dY: 0,
      gl: null,
      pointsMaterial: null,
      pointsMesh: null,
      pointsData: null,
      plane: BABYLON.Plane.FromPositionAndNormal(BABYLON.Vector3.Zero(), BABYLON.Axis.Z.negate()),
      lines: null,
      viewport: null,
      transformMatrix: null,
    }
  },
  watch: {

    numNodes(newVal, oldVal) {
      if (newVal === 0 && oldVal != 0) {
          this.pointsMesh.dispose();
      } else if (oldVal === 0) {
        this.pointsMesh = new BABYLON.Mesh("nodes", this.scene);
        this.pointsMesh.material = this.pointsMaterial;
      }
    },
    nodes: {
      handler: function () {
        this.updatePoints();
        this.updateLines();
       },
      deep: true,
    },
    config: {
      handler: function () {
        this.updatePoints();
        this.updateLines();
       },
      deep: true,
    },
    input: {
      handler: function(newVal) {
        if (newVal.command === "zoom-fit") {
          this.camera.target.x = newVal.x;
          this.camera.target.y = newVal.y;
          let w = this.engine.getRenderWidth();
          let h = this.engine.getRenderHeight()
          if (newVal.height / h > newVal.width / w) {
            console.log("taller")
            this.camera.radius = 1.1 * newVal.z;
          } else {
            this.camera.radius = 1.1 * newVal.z * h/w;
          }
        }
      },
      deep: true,
    },
    elements: {
      handler: function () { 
        this.updatePoints();
        this.updateLines();
       },
      deep: true,
    },
    'config.axes': {
      handler: function (newVal) { 
        this.axes.isVisible = newVal;
      },
    }
  },
  computed: {
    supportedNodes() {
      let arr = [];
      for (let i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].fixity[0] || this.nodes[i].fixity[1] || this.nodes[i].fixity[2]) {
          arr.push(this.nodes[i]);
        }
      }
      return arr;
    },
    nodeValues() {
      if (this.config.nodeResults === 1) {
        return this.nodeReactions;
      } else {
        return this.nodeDisplacements;
      }
    },
    worldMatrix() {
      if (this.needsUpdate) {
        // this.needsUpdate = false;
      }
      return BABYLON.Matrix.IdentityReadOnly
    },
    numNodes() {
      return this.nodes.length;
    },
    nodeVertices() {
      let arr = [];
      for (let i = 0; i < this.nodes.length; i++) {
        arr.push(...this.nodes[i].coords, 0)
      }
      return arr;
    },
    lineOptions() {
      return {
        lines: this.elementLines,
        colors: this.elementColors,
        updatable: true,
      }
    },
    elementLines() {
      let arr = [];
      for (let i = 0; i < this.elements.length; i++) {
        let e = this.elements[i];
        arr.push([
          new BABYLON.Vector3(...this.nodes[e.ends[0]].coords), 
          new BABYLON.Vector3(...this.nodes[e.ends[1]].coords)
        ]);
      }
      return arr;
    },
    /**
     * Array of colors for each vertex.
     */
    nodeColors() {
      let arr = [];
      for (let p = 0; p < this.nodes.length; p++) {
        arr.push(254/255, 254/255, p/255, 1)
        // arr.push(Math.random(), Math.random(), Math.random(), 1);
      }
      return arr;
    },
    elementColors() {
      let arr = [];
      for (let i = 0; i < this.elements.length; i++) {
        let e = this.elements[i];
        let f = this.forcesAxial[i];
        let color = new BABYLON.Color4(0.8, 0.8, 0.8);
        if (e.active) {
          color = new BABYLON.Color4(1, 1, 0.5);
        } else if (this.config.analysisFlag === 1 && this.config.trussColoring && !math.equal(this.forceAxialMax, 0)) {
          color = new BABYLON.Color4(
            f < 0.001 ? (1 + f / this.forceAxialMax)**2 : 1, 
            f > -0.001 ? (1 - f / this.forceAxialMax)**2 : (1 + 1 * f / this.forceAxialMax), 
            f > -0.001 ? (1 - f / this.forceAxialMax)**2 : 1,
          );
        }
        arr.push([color, color])
      }
      return arr;
    },
    axesOptions() {
      return {
        instance: this.axes,
        lines: [
          [new BABYLON.Vector3(-100000, 0, 0), new BABYLON.Vector3(100000, 0, 0)],
          [new BABYLON.Vector3(0, -100000, 0), new BABYLON.Vector3(0, 100000, 0)],
          // [new BABYLON.Vector3(0, 0, -100000), new BABYLON.Vector3(0, 0, 100000)],
        ],
        updatable: true,
      }
    }
  },
  beforeCreate() {
    this.SceneReady = new Promise(resolve => {
      this.resolveScene = resolve;
    });
    this.ViewportReady = new Promise(resolve => {
      this.resolveViewport = resolve;
    });
  },
  created() {
    
  },
  mounted() {
    this.init();
  },
  methods: {

    resetView() {
      this.camera.target = BABYLON.Vector3.Zero();
      this.camera.radius = 100;
    },

    init() {
      this.canvas = document.getElementById('canvas');
      // antialiasing = true
      this.engine = new BABYLON.Engine(this.canvas, true, { 
        preserveDrawingBuffer: false 
      });
      this.gl = this.engine.getRenderingCanvas('webgl').getContext('webgl2');
      this.createScene();
      this.resolveScene(this.scene);

      window.addEventListener("resize", debounce(this.resizeWindow, 250));

      // Register a render loop to repeatedly render the scene
      this.engine.runRenderLoop(() => { this.scene.render() });
    },

    createScene() {
      // Create the scene space
      this.scene = new BABYLON.Scene(this.engine);
      this.scene.clearColor = BABYLON.Color3.FromHexString("#202020")

      // Add a camera to the scene and attach it to the canvas
      this.initCamera();

      // Viewport
      this.viewport = this.camera.viewport.toGlobal(
          this.engine.getRenderWidth(),
          this.engine.getRenderHeight(),
      );
      this.resolveViewport(this.viewport);

      // on camera change e.g. window resize
      this.camera.onProjectionMatrixChangedObservable.add(debounce(this.onProjMatrixChange, 50));

      // on view change e.g. zoom, pan
      this.camera.onViewMatrixChangedObservable.add(debounce(this.onViewMatrixChange, 50));

      this.initPointerEvents();

      // Axes
      let redX = BABYLON.Color4.FromHexString("#AF4757ff")
      let greenY = BABYLON.Color4.FromHexString("#6a802aff");
      let blueZ = BABYLON.Color4.FromHexString("#356FADff")
      this.axes = BABYLON.MeshBuilder.CreateLineSystem("axes", { 
        lines: this.axesOptions.lines, 
        colors: [
          [redX, redX],
          [greenY, greenY],
          [blueZ, blueZ],
        ],
        updatable: true,
      }, this.scene);
      this.axes.renderingGroupId = 0;

      // Node material
      this.pointsMaterial = new BABYLON.StandardMaterial("nodeMaterial", this.scene);
      this.pointsMaterial.pointsCloud = true;
      this.pointsMaterial.pointSize = 9; 
      this.pointsMaterial.disableLighting = true;
      this.pointsMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1)

      // Node geometry
      this.pointsMesh = new BABYLON.Mesh("nodes", this.scene);
      this.pointsMesh.renderingGroupId = 3;
      this.pointsData = new BABYLON.VertexData();
      this.pointsMesh.material = this.pointsMaterial;

      this.updatePoints();

      // Element geometry
      this.lines = BABYLON.MeshBuilder.CreateLineSystem("lineSystem", this.lineOptions, this.scene);
      this.lines.renderingGroupId = 1;

      // Element color
      // this.lines.color = new BABYLON.Color3(1, 1, 0)
      this.scene.afterRender = () => {
        
      };
    },

    initCamera() {
      this.camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 10000, BABYLON.Vector3.Zero(), this.scene);
      this.camera.attachControl(this.canvas, true, true);
      this.camera.allowUpsideDown = false;
      this.camera.lowerAlphaLimit = -Math.PI / 2;
      this.camera.upperAlphaLimit = -Math.PI / 2;
      this.camera.lowerBetaLimit = Math.PI / 2;
      this.camera.upperBetaLimit = Math.PI / 2;

      this.camera.pinchDeltaPercentage = 0.01;
      this.camera.fov = 0.1
      this.camera.maxZ = 60000;
      // this.camera.pinchToPanMaxDistance = 1;
      // this.camera.panningInertia = 0.5;
      // this.camera.inertia = 0.7;
      // this.camera.wheelPrecision = 0.1;
      this.cameraRadius = this.camera.radius;
      this.camera.inertia = 0.7;
      this.camera.lowerRadiusLimit = 10;
      this.camera.upperRadiusLimit = 40000;
      this.camera.upperBetaLimit = Math.PI / 2 - 0.1;
      this.camera.angularSensibilityX = this.camera.angularSensibilityY = 500;

      this.addControls(this.scene, this.camera);
    },

    initPointerEvents() {
      this.scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
          case BABYLON.PointerEventTypes.POINTERDOWN:
            this.handlePointerDown(pointerInfo)
            break;
          // case BABYLON.PointerEventTypes.POINTERUP:
          //     console.log("POINTER UP");
          //     break;
          case BABYLON.PointerEventTypes.POINTERMOVE:
            this.handlePointerMove(pointerInfo);
            break;
          // case BABYLON.PointerEventTypes.POINTERWHEEL:
          //     console.log("POINTER WHEEL");
          //     break;
          // case BABYLON.PointerEventTypes.POINTERPICK:
          //     console.log("POINTER PICK");
          //     break;
          // case BABYLON.PointerEventTypes.POINTERTAP:
          //     console.log("POINTER TAP");
          //     break;
          // case BABYLON.PointerEventTypes.POINTERDOUBLETAP:
          //     console.log("POINTER DOUBLE-TAP");
          //     break;
        }
      });
    },

    getNodeResult(i) {
      if (this.config.analysisFlag === 0) {
        return `${this.nodeValues[i][0].toFixed(this.config.significantFigures)} 
              ${this.nodeValues[i][1].toFixed(this.config.significantFigures)} 
              ${this.nodeValues[i][2].toFixed(this.config.significantFigures)}`
      }
      return `${this.nodeValues[i][0].toFixed(this.config.significantFigures)} 
              ${this.nodeValues[i][1].toFixed(this.config.significantFigures)}`
    },

    handlePointerDown(pointerInfo) {
      // console.log(pointerInfo.event)
      const pos = this.getPosition(this.scene, this.camera, this.plane);
      let pixels = new Uint8Array(4);
      if (this.scene.pointerX) {
        let renderHeight = this.engine.getRenderHeight();
        this.scene.render();
        this.gl.readPixels(this.scene.pointerX, renderHeight - this.scene.pointerY, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
      }
      this.$emit('pointerdown', pos, pixels)
    },

    handlePointerMove(pointerInfo) {
      const pos = this.getPosition(this.scene, this.camera, this.plane);
      if (this.config.mode === "draw-node") {
        this.$emit('pointermove', pos)
      }
    },

    onViewMatrixChange() {
      // console.log("view matrix")  
      this.needsUpdate = true;
      this.cameraRadius = this.camera.radius;
      this.transformMatrix = this.scene.getTransformMatrix();
    },

    onProjMatrixChange() {
      // console.log("proj matrix")
      this.needsUpdate = true;
      this.updateViewportGlobal();
    },

    // update nodes
    updatePoints() {
      this.pointsData.positions = this.nodeVertices;
      this.pointsMesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, this.nodeColors);
      this.pointsData.applyToMesh(this.pointsMesh); 
      this.pointsMesh.renderingGroupId = 3;
    },

    updateLines() {
      this.lines.dispose();
      this.lines = BABYLON.MeshBuilder.CreateLineSystem("lineSystem", this.lineOptions, this.scene);
      this.lines.renderingGroupId = 1;
      // this.lines.color = new BABYLON.Color3(1, 1, 0);
    },

    updateViewportGlobal() {
      if (this.camera === null) {
        this.viewport = null;
      }
      this.camera.viewport.toGlobalToRef(
          this.engine.getRenderWidth(),
          this.engine.getRenderHeight(),
          this.viewport,
      );
    },

    resizeWindow() {
      this.engine.resize();
    },

    /** Add map-like controls to an ArcRotate camera.
     * @param {BABYLON.Scene} scene
     * @param {BABYLON.ArcRotateCamera} camera
     */
    addControls(scene, camera) {
      

      const plane = BABYLON.Plane.FromPositionAndNormal(BABYLON.Vector3.Zero(), BABYLON.Axis.Z.negate());
      const inertialPanning = BABYLON.Vector3.Zero();
      
      /** @type {BABYLON.Vector3} */
      let initialPos;
      const panningFn = () => {
        const pos = this.getPosition(scene, camera, plane);
        this.panning(pos, initialPos, camera.inertia, inertialPanning);
      };

      const inertialPanningFn = () => {
        if (inertialPanning.x !== 0 || inertialPanning.y !== 0 || inertialPanning.z !== 0) {
          camera.target.addInPlace(inertialPanning);
          inertialPanning.scaleInPlace(camera.inertia);
          this.zeroIfClose(inertialPanning);
        }
      };

      const wheelPrecisionFn = () => {
        camera.wheelPrecision = 1 / camera.radius * 1000;
      };

      const zoomFn = (p,e) => {
        const delta = this.zoomWheel(p,e,camera);
        this.zooming(delta, scene, camera, plane, inertialPanning);
      }

      const prvScreenPos = BABYLON.Vector2.Zero();
      const rotateFn = () => {
        this.rotating(scene, camera, prvScreenPos);
      };

      const removeObservers = () => {
        scene.onPointerObservable.removeCallback(panningFn);
        scene.onPointerObservable.removeCallback(rotateFn);
      }

      scene.onPointerObservable.add((p, e) => {
        removeObservers();
        if (p.event.button === 0) {
          initialPos = this.getPosition(scene, camera, plane);
          scene.onPointerObservable.add(panningFn, BABYLON.PointerEventTypes.POINTERMOVE);
        } else {
          prvScreenPos.copyFromFloats(scene.pointerX, scene.pointerY);
          scene.onPointerObservable.add(rotateFn, BABYLON.PointerEventTypes.POINTERMOVE);
        }
      }, BABYLON.PointerEventTypes.POINTERDOWN);

      scene.onPointerObservable.add((p, e) => {
        removeObservers();
      }, BABYLON.PointerEventTypes.POINTERUP);

      scene.onPointerObservable.add(zoomFn, BABYLON.PointerEventTypes.POINTERWHEEL);

      scene.onBeforeRenderObservable.add(inertialPanningFn);
      scene.onBeforeRenderObservable.add(wheelPrecisionFn);

      // stop context menu showing on canvas right click
      scene.getEngine().getRenderingCanvas().addEventListener("contextmenu", (e) => {
        e.preventDefault();
      });
    },

    /** Get pos on plane.
     * @param {BABYLON.Scene} scene
     * @param {BABYLON.ArcRotateCamera} camera
     * @param {BABYLON.Plane} plane
     */
    getPosition(scene, camera, plane) {
      const ray = scene.createPickingRay(
          scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), camera, false);
      const distance = ray.intersectsPlane(plane);

      // not using this ray again, so modifying its vectors here is fine
      return distance !== null ?
          ray.origin.addInPlace(ray.direction.scaleInPlace(distance)) : null;
    },

    /** Return offsets for inertial panning given initial and current
     * pointer positions.
     * @param {BABYLON.Vector3} newPos
     * @param {BABYLON.Vector3} initialPos
     * @param {number} inertia
     * @param {BABYLON.Vector3} ref
     */
    panning(newPos, initialPos, inertia, ref) {
      const directionToZoomLocation = initialPos.subtract(newPos);
      const panningX = directionToZoomLocation.x * (1-inertia);
      const panningY = directionToZoomLocation.y * (1-inertia);
      const panningZ = directionToZoomLocation.z * (1-inertia);
      ref.copyFromFloats(panningX, panningY, panningZ);
      return ref;
    },

    /** Get the wheel delta divided by the camera wheel precision.
     * @param {BABYLON.PointerInfoPre} p
     * @param {BABYLON.EventState} e
     * @param {BABYLON.ArcRotateCamera} camera
     */
    zoomWheel(p, e, camera) {
      const event = p.event;
      event.preventDefault();
      let delta = 0;
      if (event.deltaY) {
        delta = -event.deltaY;
      } else if (event.wheelDelta) {
        delta = event.wheelDelta;
      } else if (event.detail) {
        delta = -event.detail;
      }
      delta /= camera.wheelPrecision;
      return delta;
    },

    /** Zoom to pointer position. Zoom amount determined by delta.
     * @param {number} delta
     * @param {BABYLON.Scene} scene
     * @param {BABYLON.ArcRotateCamera} camera
     * @param {BABYLON.Plane} plane
     * @param {BABYLON.Vector3} ref
     */
    zooming(delta, scene, camera, plane, ref) {
      if (camera.radius - camera.lowerRadiusLimit < 1 && delta > 0) {
        return;
      } else if (camera.upperRadiusLimit - camera.radius < 1 && delta < 0) {
        return;
      }
      const inertiaComp = 1 - camera.inertia;
      if (camera.radius - (camera.inertialRadiusOffset + delta) / inertiaComp <
            camera.lowerRadiusLimit) {
        delta = (camera.radius - camera.lowerRadiusLimit) * inertiaComp - camera.inertialRadiusOffset;
      } else if (camera.radius - (camera.inertialRadiusOffset + delta) / inertiaComp >
            camera.upperRadiusLimit) {
        delta = (camera.radius - camera.upperRadiusLimit) * inertiaComp - camera.inertialRadiusOffset;
      }

      const zoomDistance = delta / inertiaComp;
      const ratio = 1.99 * zoomDistance / camera.radius;
      const vec = this.getPosition(scene, camera, plane);

      const directionToZoomLocation = vec.subtract(camera.target);
      const offset = directionToZoomLocation.scale(ratio);
      offset.scaleInPlace(inertiaComp);
      ref.addInPlace(offset);

      camera.inertialRadiusOffset += delta;
    },

    /** Rotate the camera
     * @param {BABYLON.Scene} scene
     * @param {BABYLON.Vector2} prvScreenPos
     * @param {BABYLON.ArcRotateCamera} camera
     */
    rotating(scene, camera, prvScreenPos) {
      const offsetX = scene.pointerX - prvScreenPos.x;
      const offsetY = scene.pointerY - prvScreenPos.y;
      prvScreenPos.copyFromFloats(scene.pointerX, scene.pointerY);
      this.changeInertialAlphaBetaFromOffsets(offsetX, offsetY, camera);
    },

    /** Modifies the camera's inertial alpha and beta offsets.
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {BABYLON.ArcRotateCamera} camera
     */
    changeInertialAlphaBetaFromOffsets(offsetX, offsetY, camera) {
      const alphaOffsetDelta = offsetX / camera.angularSensibilityX;
      const betaOffsetDelta = offsetY / camera.angularSensibilityY;
      camera.inertialAlphaOffset -= alphaOffsetDelta;
      camera.inertialBetaOffset -= betaOffsetDelta;
    },

    /** Sets x y or z of passed in vector to zero if less than Epsilon.
     * @param {BABYLON.Vector3} vec
     */
    zeroIfClose(vec) {
        if (Math.abs(vec.x) < BABYLON.Epsilon) {
            vec.x = 0;
        }
        if (Math.abs(vec.y) < BABYLON.Epsilon) {
            vec.y = 0;
        }
        if (Math.abs(vec.z) < BABYLON.Epsilon) {
            vec.z = 0;
        }
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#canvas-overlay {
  .node-label {
    color: #ffffffd0;
    pointer-events: none;
    position: absolute;
    font-size: 0.875rem;
  }
}
</style>
