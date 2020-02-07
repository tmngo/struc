<template>
  <div id="app" ref="app">
			
		<!-- Settings -->
		<canvas-settings 
			id="canvas-settings-container"
			:config="config"
			@loaded="loadStructure(config.loadValue)"
			@saved="config.saveValue=saveStructure()"
		>
			<!-- Header -->
			<div id="canvas-header" class="bar">
				<div class="home"><a href="https://timmngo.github.io">timmngo.github.io</a></div>
				<button 
					class="btn btn-outline-dark" 
					:class="{ toggled : (config.mode === 'navigate') }"
					title="Pan"
					@click="config.mode='navigate';config.display=false"
				><i class="icon-pan-outline"></i></button>
				<button 
					class="btn btn-outline-dark" 
					title="Zoom fit"
					@click="zoomFit"
				><i class="icon-crop-free"></i></button>
				<button 
					class="btn btn-outline-dark" 
					:class="{ toggled : (config.mode === 'draw-node') }"
					title="Draw node"
					@click="config.mode='draw-node';config.display=false"
				><i class="icon-draw-node-outline"></i></button>
				<button 
					class="btn btn-outline-dark" 
					:class="{ toggled : (config.mode === 'draw-elem') }"
					title="Draw element"
					@click="config.mode='draw-elem';config.display=false"
				><i class="icon-create-elem-outline"></i></button>
				<button 
					class="btn btn-outline-dark" 
					title="Settings"
					@click="config.display=!config.display;config.mode='navigate'"
				><i class="icon-settings"></i></button>
				
			</div>
		</canvas-settings>

		<!-- Canvas -->
		<!-- <div id="canvas-container"
			@mousemove.left="panMove($event)" 
			@mousedown.left="handleMouseDown" 
			@mousedown.middle="panOn" 
			@touchstart="panOnTouch($event)"
			@touchmove="panMoveTouch($event)"
			@wheel.prevent="zoomCanvas($event)"
			@mouseup="panOff"
			@mouseleave="panOff"
			@touchend="panOff"
		>
			
			<svg 
				id="canvas" 
				ref="canvas" 
				class="select-none"
				draggable="false"
				@dragstart.prevent	
			>
				<rect 
					id="rect-canvas" 
					width="100%" 
					height="100%" 
				/>
				<circle 
					v-show="config.mode==='draw-node'"
					:cx="cursor.x" 
					:cy="cursor.y" 
					:r="2" 
					fill="#ffffff"
				/>
				<path 
					v-show="config.mode==='draw-elem' && drawElem.ends[0] !== null"
					stroke="white"
					stroke-dasharray="3"
					:d="drawElemDef"
				/>
				<path v-show="config.axes" class="axis axis-x" :d="axisXDef"/>
				<path v-show="config.axes" class="axis axis-y" :d="axisYDef"/>

				<component
					:is="(config.analysisFlag=== 1) ? 'ElementPathAxial' : 'ElementPath'"
					v-for="(elem, i) in elements"
					:key="elem.id"
					:element="elem"
					:l="elementLengths[i]"
					:endNodes="[nodes[elem.ends[0]], nodes[elem.ends[1]]]"
					:element-force="elementAxials[i]"
					:end-forces="elementForces[i]"
					:displacements="elementDisplacements[i]"
					:view="config"
					:max-axial="elementMaxAxial"
					:moment-scale="momentDiagramAutoScale"
					:shear-scale="shearDiagramAutoScale"
					:transform="elementTransformations[i]"
					:colors="colors"
					:trussColoring="config.trussColoring"
					@selection="activeElement = $event"
				></component>
				<component
					:is="(config.analysisFlag=== 1) ? 'NodeCircleAxial' : 'NodeCircle'"
					v-for="(node, i) in nodes"
					:key="node.id"
					:node="node"
					:i="i"
					:displacements="displacements[i]"
					:reactions="reactions[i]"
					:view="config"
					:colors="colors"
					@selection="handleMouseDown"
				></component>
			</svg>
		</div> -->

		<babylon-canvas  
			:config="config"
			:nodes="nodes"
			:elements="elements"
			:forces-axial="elementAxials"
			:force-axial-max="elementMaxAxial"
			:forces-end="elementForces"
			:materials="materials"
			:sections="sections"
			:diagram-scales="diagramScales"
			:node-reactions="reactions"
			:node-displacements="displacements"
			:element-displacements="elementDisplacementsLocal"
			:input="input"
			@pointerdown="handleMouseDown2" 
			@pointermove="handleMouseMove"
			ref="canvasContainer"
		></babylon-canvas>

		<!-- Properties -->
		<div class="properties">
			
			<div 
				v-show="config.mode==='draw-node'"
				class="panel"
			>
				<span>Draw node</span>
				<label>X</label>
				<div> <!-- world = screen / scale -->
					{{ cursor.x }}
				</div>
				<label>Y</label>
				<div>
					{{ -cursor.y }}
				</div>
				<label>Snap increment</label>
				<input
					type="number"
					min="1"
					v-model="config.snapIncrement"
				>
			</div>

			<div 
				v-show="config.mode==='draw-elem'"
				class="panel"
			>
				<span>Draw element</span>
				<label>Material</label>
				<select v-model="drawElem.material">
					<option 
						v-for="(mat, i) in materials" 
						:key="mat.id"
						:value="i"
					>{{ mat.n }}</option>	
				</select>
				<label>Section</label>
				<select v-model="drawElem.section">
					<option 
						v-for="(sec, i) in sections" 
						:key="sec.id"
						:value="i"
					>{{ sec.n }}</option>	
				</select>
				<label>Start release</label>
				<div><input type="checkbox" v-model="drawElem.releases[0]"/></div>
				<label>End release</label>
				<div><input type="checkbox" v-model="drawElem.releases[1]"/></div>
			</div>

			<div
				v-show="isUnstable && nodes.length > 0" 
				class="structure-info"
			>Structure unstable</div>
		</div>

		<!-- Nodes -->
		<array-list
			v-show="config.panel === 'nodes'"
			:headings="config.analysisFlag === 0 ? ['#', 'x', 'y', '', 'fx', '', 'fy', '', 'mz'] : ['#', 'x', 'y', '', 'fx', '', 'fy']"
			:widths="[2, 3, 3, 1.25, 3, 1.25, 3, 1.25, 3]"
		>
			<template slot="header">
				<div style="display: flex; min-height: 26px">
					<div>{{ 'Nodes' }} ({{ nodes.length }})</div>
				</div>
				<node-row-add
					:nodes="nodes"
					@submit="addNode"
				></node-row-add>
			</template>
			<node-row
				v-show="config.nodeTableVisibility"
				v-for="(node, i) in nodes"
				:key="node.id"
				:node="node"
				:nodes="nodes"
				:analysisFlag="config.analysisFlag"
				@remove="removeNode(i)"
				@mouseenter="node.active = true"
				@mouseexit="node.active = false"
			></node-row>
		</array-list>

		<!-- Elements -->
		<array-list
			v-show="config.panel === 'elements'"
			:headings="config.analysisFlag === 0 ? ['#', 'node i', 'node j', 'mat', 'sec', 'wx', 'wy', 'releases'] : ['#', 'node i', 'node j', 'mat', 'sec']"
			:widths="[2, 3, 3, 4, 4, 3, 3, 2.5]"
		>
			<template slot="header">
				<div style="display: flex; min-height: 26px">
					<div>{{ 'Elements' }} ({{ elements.length }})</div>
				</div>
				<element-row-add
					:elements="elements"
					:nodes="nodes"
					@submit="addElement"
				></element-row-add>
			</template>
			<element-row
				v-show="config.elemTableVisibility"
				v-for="(element, i) in elements"
				:key="element.id"
				:element="element"
				:nodes="nodes"
				:materials="materials"
				:sections="sections"
				:analysisFlag="config.analysisFlag"
				@remove="removeElement(i)"
			>
			</element-row>
		</array-list>

		<!-- Materials -->
		<array-list
			v-show="config.panel === 'materials'"
			:headings="config.analysisFlag === 0 ? ['#', 'E'] : ['#', 'E']"
			:widths="[4, 3, 3, 3, 3, 2	]"		
		>
			<template slot="header">
				<div style="display: flex; min-height: 26px">
					<div>{{ 'Materials' }} ({{ materials.length }})</div>
				</div>
				<div class="table-dark row-submission">
					<div class="cell-button">
						<button 
							type="button" 
							class="btn btn-outline-success submit" 
							@click="addMaterial" 
						><i class="icon-add"></i>
						</button>
					</div>
				</div>
			</template>
			<material-row
				v-for="(material, i) in materials"
				:key="material.id"
				:material="material"
				:analysisFlag="config.analysisFlag"
				@remove="removeMaterial(i)"
			>
			</material-row>
		</array-list>

		<!-- Sections -->
		<array-list
			v-show="config.panel === 'sections'"
			:headings="config.analysisFlag === 0 ? ['#', 'A', 'Iz', 'Ay', 'Zz'] : ['#', 'A', 'Iz']"
			:widths="[4, 3, 3, 3, 3]"			
		>
			<template slot="header">
				<div style="display: flex; min-height: 26px">
					<div>{{ 'Sections' }} ({{ sections.length }})</div>
				</div>
				<div class="table-dark row-submission">
					<div class="cell-button">
						<button 
							type="button" 
							class="btn btn-outline-success submit" 
							@click="addSection" 
						><i class="icon-add"></i>
						</button>
					</div>
				</div>
			</template>
			<section-row
				v-for="(section, i) in sections"
				:key="section.id"
				:section="section"
				:analysisFlag="config.analysisFlag"
				@remove="removeSection(i)"
			>
			</section-row>
		</array-list>

		<!-- Sidebar -->
		<div class="sidebar bar">
			<button 
				title="Nodes"
				class="btn btn-outline-dark" 
				:class="{ toggled : (config.panel === 'nodes') }"
				@click="togglePanel('nodes')"
			><i class="icon-big-nodes"></i></button>
			<button 
				title="Elements"
				class="btn btn-outline-dark" 
				:class="{ toggled : (config.panel === 'elements') }"
				@click="togglePanel('elements')"
			><i class="icon-elements"></i></button>
			<button 
				title="Materials"
				class="btn btn-outline-dark" 
				:class="{ toggled : (config.panel === 'materials') }"
				@click="togglePanel('materials')"
			><i class="icon-blocks"></i></button>
			<button 
				title="Sections"
				class="btn btn-outline-dark" 
				:class="{ toggled : (config.panel === 'sections') }"
				@click="togglePanel('sections')"
			><i class="icon-section"></i></button>
		</div>
  </div>
</template>

<script>
import math from 'mathjs'
import debounce from 'lodash.debounce'

import ArrayList from './components/ArrayList'
import BabylonCanvas from './components/BabylonCanvas'
import CanvasSettings from './components/CanvasSettings'
import ElementPath from './components/ElementPath'
import ElementPathAxial from './components/ElementPathAxial'
import ElementRow from './components/ElementRow'
import ElementRowAdd from './components/ElementRowAdd'
import InputNumber from './components/InputNumber'
import MaterialRow from './components/MaterialRow'
import NodeCircle from './components/NodeCircle'
import NodeCircleAxial from './components/NodeCircleAxial'
import NodeRow from './components/NodeRow'
import NodeRowAdd from './components/NodeRowAdd'
import SectionRow from './components/SectionRow'

export default {
  name: 'App',
  components: {
		ArrayList,
		BabylonCanvas,
    CanvasSettings,
    ElementPath,
		ElementPathAxial,
		ElementRow,
    ElementRowAdd,
		InputNumber,
		MaterialRow,
    NodeCircle,
    NodeCircleAxial,
    NodeRow,
    NodeRowAdd,
		SectionRow,
  },
  data() { 
    return {
			activeElement: null,
			captureButton: -1,
			captureToggle: false,
			colors: {
				nodeFill: '#ffffff',
				elementFill: '#ffffff'
			},
			analysisFlag: 0,
      config: {
				analysisFlag: 0,
        appliedForces: true,
				axes: true,
				significantFigures: 3,
				display: false,
				diagramScale: 1,
				diagramSegments: 6,
				diagramType: 1,
				displacedShapeDiagrams: false,
        elementForces: true,
				elementLoads: true,
				momentDiagrams: false,
				diagramValues: false,
				mode: 'navigate',
				panel: 'nodes',
				nodeLabels: true,
				nodeResults: 1,
        x: 256,
        y: 200,
        reactions: true,
				scale: 3,
				scaleMin: 0.01,
				scaleMax: 40,
				shearDiagrams: false,
				snapIncrement: 1,
				supports: true,
				trussColoring: true,
				nodeTableVisibility: true,
				elemTableVisibility: true,
				canvasW: 512,
				canvasH: 472,
				loadValue: '',
				saveValue: '',
			},
			cursor: {
				x: 0,
				y: 0,
			},
			drawElem: {
				ends: [null, null],
				material: 0,
				section: 0,
				releases: [false, false]
			},
			elements: [],
			input: {},
			materials: [],
			nextNodeId: 1,
			nextElementId: 1,
			nextMaterialId: 1,
			nextSectionId: 1,
      nodes: [],
      panX: 0,
			panY: 0,
			prevDiff: -1,
			midX: 0,
			midY: 0,
			scroll: 0,
			sections: [],
    }
	},
	computed: {
		/*****************/
		/* Parsed inputs */
		/*****************/

		nDOF () {
			if (this.config.analysisFlag === 1) {
				return this.nodes.length * 2
			}
			return this.nodes.length * 3
		},

		concentratedLoads () {
			if (this.config.analysisFlag === 1) {
				return this.nodes.map(node => node.loads.slice(0, -1))
			}
			return this.nodes.map(node => node.loads)
		},

		fixity () {
			if (this.config.analysisFlag === 1) {
				return this.nodes.map(node => [
					node.fixity[0] ? 0 : NaN, 
					node.fixity[1] ? 0 : NaN
				])
			}
			return this.nodes.map(node => [
				node.fixity[0] ? 0 : NaN, 
				node.fixity[1] ? 0 : NaN, 
				node.fixity[2] ? 0 : NaN
			])
		},

		fixityReshaped () {
			if (this.fixity.length === 0) return []
			return math.reshape(this.fixity, [1, this.nDOF])[0];
		},

		degF () {
			return this.fixityReshaped.map((value, i) => (isNaN(value)) ? i : NaN).filter(value => !isNaN(value))
		},

		degS () {
			return this.fixityReshaped.map((value, i) => (value == 0) ? i : NaN).filter(value => !isNaN(value))
		},

		/*******************/
		/* Node properties */
		/*******************/

		nElements() {
			return this.nodes.map(node => node.incElements[0].length + node.incElements[1].length)
		},

		nReleases() {
			let arr = [];
			for (let i = 0; i < this.nodes.length; i++) {
				let node = this.nodes[i];
				let n = 0;
				for (let j = 0; j < node.incElements[0].length; j++) {
					if (node.incElements[0][j].releases[0]) n++;
				}
				for (let j = 0; j < node.incElements[1].length; j++) {
					if (node.incElements[1][j].releases[1]) n++;
				}
				arr.push(n);
			}
			return arr;
		},

		nodeDOF () {
			if (this.config.analysisFlag === 1) {
				return this.nodes.map((node, i) => [2*i, 2*i + 1])
			}
			return this.nodes.map((node, i) => [3*i, 3*i + 1, 3*i + 2])
		},

		/**********************/
		/* Element properties */
		/**********************/

		elementEnds () {
			return this.elements.map(elem => [...elem.ends, ...elem.releases])
		},

		elementDOF () {
			return this.elementEnds.map(ends => this.nodeDOF[ends[0]].concat(this.nodeDOF[ends[1]]))
		},

		elementLengths () {
			return this.elements.map(elem => this.getElementLength(elem))
		},

		elementTransformations () {
			return this.elements.map((elem, i) => this.getElementTransform(elem, i))
		},

		elementStiffnessMatricesLocal () {
			return this.elements.map((elem, i) => this.getElementKLocal(elem, i))
		},

		elementStiffnessMatrices () {
			return this.elements.map((elem, i) => this.getElementKGlobal(elem, i))
		},

		elementFixedEndForcesLocal () {
			return this.elements.map((elem, i) => this.computeElementFixedEndForces(elem, i))
		},

		elementFixedEndForcesGlobal () {
			return this.elementFixedEndForcesLocal.map((forces, i) => 
				math.multiply(
					math.transpose(this.elementTransformations[i]), 
					forces
				)
			)
		},

		/****************/
		/* Load vectors */
		/****************/

		pF () {
			if (this.degF.length === 0) return [];
			return math.subset(
				math.reshape(
					this.concentratedLoads, 
					[this.nDOF, 1]
				), 
				math.index(this.degF, 0)
			);
		},

		pS () {
			return math.subset(
				math.reshape(
					this.concentratedLoads, 
					[this.nDOF, 1]
				), 
				math.index(this.degS, 0)
			);
		},

		fef () {
			return this.elementFixedEndForcesGlobal.reduce((F, f, i) => 
					math.subset(
						F, 
						math.index(this.elementDOF[i], 0), 
						math.add(
							math.subset(F, math.index(this.elementDOF[i], 0)), 
							f
						)
					), 
					math.zeros(this.nDOF, 1)
			)
		},

		fefF () {
			if (this.degF.length === 0) return [];
			return math.subset(this.fef, math.index(this.degF, 0))
		},

		fefS () {
			return math.subset(this.fef, math.index(this.degS, 0))
		},

		/**********************/
		/* Stiffness matrices */
		/**********************/

		kAssembled () {
			if (this.elementDOF.length === 0) return [];
			// return math.matrix(this.elementStiffnessMatrices.reduce((K, k, i) => math.subset(K, math.index(this.elementDOF[i], this.elementDOF[i]), math.add(math.subset(K, math.index(this.elementDOF[i], this.elementDOF[i])), k)), math.zeros(this.nDOF, this.nDOF)), 'sparse');

			let K = math.zeros(this.nDOF, this.nDOF);
			for (let i = 0; i < this.elements.length; i++) {
				let k = this.elementStiffnessMatrices[i];
				let index = math.index(this.elementDOF[i], this.elementDOF[i]);
				let subset = math.subset(K, index);
				K = math.subset(K, index, math.add(subset, k));
			}
			return math.matrix(K, 'sparse');
		},
		
		kFF () {
			if (this.kAssembled.length === 0 || this.degF.length === 0) return []
			return math.subset(this.kAssembled, math.index(this.degF, this.degF))
		},

		kSF () {
			if (this.kAssembled.length === 0 || this.degF.length === 0 || this.degS.length === 0) return []
			return math.subset(this.kAssembled, math.index(this.degS, this.degF))
		},

		condEst () {
			return math.log10(this.estimateCondition(this.kFF))
		},

		isUnstable () {
			return this.condEst > 12 
					|| this.condEst === 0 
					|| isNaN(this.condEst) 
					|| this.condEst < 0 
					|| this.degF.length < 1
		},

		/***********/
		/* Results */
		/***********/

		dF () {
			if (this.isUnstable) return null
			if (this.degF.length === 1) {
				return math.lusolve([[this.kFF]], [[math.subtract(this.pF, this.fefF)]])
			}
			return math.lusolve(this.kFF, math.subtract(this.pF, this.fefF))
		},

		d () {
			if (this.isUnstable) return null
			if (this.degF.length === 1) {
				return math.subset(
					math.zeros(this.nDOF, 1), 
					math.index(this.degF, 0), 
					this.dF[0][0]
				);
			} else {
				return math.subset(
					math.zeros(this.nDOF, 1), 
					math.index(this.degF, 0), 
					math.matrix(this.dF)
				);
			}
		},

		fS () {
			if (this.isUnstable) return null
			return math.add(math.multiply(this.kSF, this.dF), math.subtract(this.fefS, this.pS))
		},

		f () {
			if (this.isUnstable) return null
			return math.subset(math.zeros(this.nDOF, 1), math.index(this.degS, 0), this.fS);
		},

		/***********/
		/* Outputs */
		/***********/

		displacements () {
			if (this.isUnstable) {
				if (this.config.analysisFlag === 1) {
					return this.nodes.map(e => [NaN, NaN]) 
				}
				return this.nodes.map(e => [NaN, NaN, NaN]) 
			}
			if (this.config.analysisFlag === 1) {
				return math.reshape(this.d, [this.nodes.length, 2])._data
			}
			return math.reshape(this.d, [this.nodes.length, 3])._data
		},

		reactions () {
			if (this.isUnstable) return this.nodes.map(e => [NaN, NaN, NaN])
			if (this.config.analysisFlag === 1) {
				return math.reshape(this.f, [this.nodes.length, 2])._data
			}
			return math.reshape(this.f, [this.nodes.length, 3])._data
		},

		elementForces () {
			if (this.isUnstable) return this.elements.map(e => [NaN, NaN, NaN, NaN, NaN, NaN])
			return this.elementStiffnessMatricesLocal.map((k, i) => 
				math.transpose(
					math.add(
						math.multiply(
							k, 
							this.elementTransformations[i], 
							math.subset(
								this.d, 
								math.index(this.elementDOF[i], 0)
							) 
						), 
						this.elementFixedEndForcesLocal[i]
					)
				)._data[0])
		},

		elementAxials () {
			if (this.config.analysisFlag === 1) {
				return this.elementForces.map(elem => elem[1])
			}
			return this.elementForces.map(elem => elem[3])
		},

		elementDisplacements () {
			return this.elementEnds.map((elem, i) => this.displacements[elem[0]].concat(this.displacements[elem[1]]))
		},

		elementDisplacementsLocal () {
			return this.elementDisplacements.map((d, i) => 
				math.multiply(
					this.elementTransformations[i], 
					d
				)
			)
		},

		/*****************/
		/* UI properties */
		/*****************/

		axisXDef() {
			return 'M0,' + this.config.y + 'L1920,' + this.config.y;
		},

		axisYDef () {
			return 'M' + this.config.x + ',0L' + this.config.x + ',1080';
		},

		drawElemDef () {
			return `M${this.drawElem.ends[0] !== null ? (this.nodes[this.drawElem.ends[0]].coords[0] * this.config.scale + this.config.x) : 0}`
				+ `,${this.drawElem.ends[0] !== null ? (-this.nodes[this.drawElem.ends[0]].coords[1] * this.config.scale + this.config.y) : 0}` 
				+ `L${this.cursor.x},${this.cursor.y}`;
		},

		elementMaxAxial () {
			let max = 0;
			for (let i=0; i < this.elements.length; i++) {
				if (math.larger(math.abs(this.elementAxials[i]), max)) {
					max = math.abs(this.elementAxials[i]);
				}
			}
			return max;
		},

		elementMaxMoment () {
			if (this.config.analysisFlag === 1) {
				return 1;
			}
			let max = 0;
			let endForces = math.number(this.elementForces);
			for (let i = 0; i < this.elements.length; i++) {
				max = math.max(math.abs(endForces[i][2]), max);			
				max = math.max(math.abs(endForces[i][5]), max);
				if (this.elements[i].w[1] !== 0) {
					let x = this.elementLengths[i] / 2;
					let midValue = -endForces[i][2] // -M
          	+ endForces[i][1] * x // V*x
          	+ this.elements[i].w[1]/2 * x**2; // 0.5w*x^2
					max = math.max(math.abs(midValue), max);
				}
			}
			return max;
		},

		elementMaxShear () {
			if (this.config.analysisFlag === 1) {
				return 1;
			}
			let max = 0;
			let endForces = math.number(this.elementForces);
			for (let i = 0; i < this.elements.length; i++) {
				max = math.max(math.abs(endForces[i][1]), max);			
				max = math.max(math.abs(endForces[i][4]), max);			
			}
			return max;
		},

		elementMaxLoad() {
			let max = 0;
			let elems = this.elements;
			for (let i = 0; i < elems.length; i++) {
				max = math.max(math.abs(elems[i].w[1]), max);
			}
			return max;
		},

		elementMaxDisp() {
			if (this.config.analysisFlag === 1) {
				return 1;
			}
			let max = 0;
			let endForces = this.elementForces;
			let endDisps = this.elementDisplacementsLocal;
			for (let i = 0; i < this.elements.length; i++) {
				
				max = math.max(math.abs(endDisps[i][1]), max);
				max = math.max(math.abs(endDisps[i][4]), max);
				
				if (this.elements[i].w[1] !== 0) {
					let x = this.elementLengths[i] / 2;
					let midValue = endDisps[i][1] 
						+ endDisps[i][2] * x // -theta
						+ (-endForces[i][2]/2 * x**2
						+ endForces[i][1]/6 * x**3 // V*x
						+ this.elements[i].w[1]/24 * x**4) // 0.5w*x^2
						/ this.materials[this.elements[i].material].E
						/ this.sections[this.elements[i].section].Iz
					max = math.max(math.abs(midValue), max);
				}
			}
			return max;
		},

		elementMaxRotation() {
			if (this.config.analysisFlag === 1) {
				return 1;
			}
			let max = 0;
			let endForces = this.elementForces;
			let endDisps = this.elementDisplacementsLocal;
			for (let i = 0; i < this.elements.length; i++) {
				
				max = math.max(math.abs(endDisps[i][2]), max);
				max = math.max(math.abs(endDisps[i][5]), max);
				
				if (this.elements[i].w[1] !== 0) {
					let x = this.elementLengths[i] / 2;
					let midValue = endDisps[i][2] // -theta
						+ (-endForces[i][2] * x
						+ 0.5 * endForces[i][1] * x**2 // V*x
						+ this.elements[i].w[1]/6 * x**3) // 0.5w*x^2
						/ this.materials[this.elements[i].material].E
						/ this.sections[this.elements[i].section].Iz
					max = math.max(math.abs(midValue), max);
				}
			}
			return max;
		},

		diagramScales() {
			return {
				w: (this.elementMaxLoad === 0) ? 1 : 45 / this.elementMaxLoad,
				v: (this.elementMaxShear === 0) ? 1 : 45 / this.elementMaxShear,
				m: (this.elementMaxMoment === 0) ? 1 : 45 / this.elementMaxMoment,
				r: (this.elementMaxRotation === 0) ? 1 : 45 / this.elementMaxRotation,
				d: (this.elementMaxDisp === 0) ? 1 : 45 / this.elementMaxDisp,
			}
		},

	},
	created: function () {
		this.initProperties();
		this.initStructure();
		window.addEventListener("beforeunload", function(e) {
			e = e || window.event;
			// For IE and Firefox prior to version 4
			if (e) {
					e.returnValue = 'Sure?';
			}
			// For Safari
			return 'Sure?';
		});
	},
	mounted: function () {
		// this.config.canvasW = this.getCanvasWidth();
		// this.config.canvasH = this.getCanvasHeight();
		// this.config.x = this.config.canvasW / 2;
		// this.config.y = this.config.canvasH / 2;
		window.addEventListener("resize", this.resizeWindow);
		
	},
	methods: {

		initProperties() {
			this.addSection({
				n: 's1',
				A: 1,
				Iz: 100,
				Iy: 100,
				J: 100,
				Cw: 1,
				Ay: 1,
				Az: 1,
				Zz: 1,
				Zy: 1,
			},);
			this.addMaterial({
				n: 'm1',
				E: 29000,
				v: 1,
				Fy: 1,
				yieldSurface: [0, 0, 0],
				specificWeight: 1,
			});
			this.config.scale = 0.35;
		},

		initStructure() {
			// triangular 
			// this.addNodes([
			// 	{
			// 		coords: [0, 0],
			// 		fixity: [true, true]
			// 	},
			// 	{
			// 		coords: [1000, 0],
			// 		loads: [0, -10, 0],
			// 	},
			// 	{
			// 		coords: [0, 1000],
			// 		fixity: [true, true]
			// 	},
			// ]);
			// this.addElement({ ends: [0, 1], releases: [false, true] })
			// this.addElement({ ends: [2, 1], releases: [false, false] })

			// bridge
			this.addNodes([
				{coords: [0, 0], fixity: [true, true, true],},
				// {coords: [250, 0],},
				// {coords: [250, 250],},
				// {coords: [500, 0],loads: [10, -20, 0]},
				// {coords: [500, 250],},
				// {coords: [750, 0],},
				// {coords: [750, 250],},
				{coords: [500, 0],fixity: [false, false, false]},
				{coords: [1000, 0],fixity: [false, false, false]},
			]);
			this.addElement({ ends: [0, 1], w: [0, 1] });
			this.addElement({ ends: [1, 2], w: [0, 1] });
			// this.addElement({ ends: [0, 2]});
			// this.addElement({ ends: [1, 2]});
			// this.addElement({ ends: [1, 3]});
			// this.addElement({ ends: [2, 3]});
			// this.addElement({ ends: [2, 4]});
			// this.addElement({ ends: [3, 4]});
			// this.addElement({ ends: [3, 5]});
			// this.addElement({ ends: [3, 6]});
			// this.addElement({ ends: [4, 6]});
			// this.addElement({ ends: [5, 6]});
			// this.addElement({ ends: [5, 7]});
			// this.addElement({ ends: [6, 7]});
			this.config.analysisFlag = 0;
		},

		/********************/
		/* Analysis methods */
		/********************/

		getElementLength(elem) {
			return math.norm(math.subtract(this.nodes[elem.ends[1]].coords, this.nodes[elem.ends[0]].coords))
		},

		getElementTransform(elem, i) {
			let dx = this.nodes[elem.ends[1]].coords[0] - this.nodes[elem.ends[0]].coords[0];
			let dy = this.nodes[elem.ends[1]].coords[1] - this.nodes[elem.ends[0]].coords[1];
			let l = this.elementLengths[i];
			let c = dx / l;
			let s = dy / l;
			if (this.config.analysisFlag === 1) {
				return [
					[c, s, 0, 0], 
					[0, 0, c, s], 
				];
			}
			return [
				[c, s, 0, 0, 0, 0], 
				[-s, c, 0, 0, 0, 0], 
				[0, 0, 1, 0, 0, 0], 
				[0, 0, 0, c, s, 0], 
				[0, 0, 0, -s, c, 0], 
				[0, 0 , 0, 0, 0, 1]
			];
		},

		getElementKLocal(elem, i) {
			let l = this.elementLengths[i];
			let mat = this.materials[elem.material];
			let sec = this.sections[elem.section]
			let e = mat.E;
			let a = sec.A;

			let k;
			
			if (this.config.analysisFlag === 1) {
				k = [
					[a, -a],
					[-a, a],
				];
				return math.multiply(k, e / l);
			}

			let il2 = 12 * sec.Iz / l ** 2;
			let il = 6* sec.Iz / l;
			let i2 = 2 * sec.Iz;
			let i4 = 4 * sec.Iz;

			let i3l2 = 3 * sec.Iz / l ** 2;
			let i3l = 3 * sec.Iz / l;
			let i3 = 3 * sec.Iz;

			if (elem.releases[0] && elem.releases[1]) {	
				// pinned-pinned
				k = [
					[a, 0, 0, -a, 0, 0],
					[0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0],
					[-a, 0, 0, a, 0, 0],
					[0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0],
				]
			} else if (!elem.releases[0] && elem.releases[1]) {	
				// fixed-pinned
				k = [
					[a, 0, 0, -a, 0, 0],
					[0, i3l2, i3l, 0, -i3l2, 0],
					[0, i3l, i3, 0, -i3l, 0],
					[-a, 0, 0, a, 0, 0],
					[0, -i3l2, -i3l, 0, i3l2, 0],
					[0, 0, 0, 0, 0, 0],
				]
			} else if (elem.releases[0] && !elem.releases[1]) {	
				// pinned-fixed
				k = [
					[a, 0, 0, -a, 0, 0],
					[0, i3l2, 0, 0, -i3l2, i3l],
					[0, 0, 0, 0, 0, 0],
					[-a, 0, 0, a, 0, 0],
					[0, -i3l2, 0, 0, i3l2, -i3l],
					[0, i3l, 0, 0, -i3l, i3],
				]
			} else {	
				// fixed-fixed
				k = [
					[a, 0, 0, -a, 0, 0],
					[0, il2, il, 0, -il2, il],
					[0, il, i4, 0, -il, i2],
					[-a, 0, 0, a, 0, 0],
					[0, -il2, -il, 0, il2, -il],
					[0, il, i2, 0, -il, i4],
				]
			}
			return math.multiply(k, e / l);
		},

		getElementKGlobal(elem, i) {
			let t = this.elementTransformations[i];
			return math.multiply(math.transpose(t), this.elementStiffnessMatricesLocal[i], t);
		},

		computeElementFixedEndForces(elem, i) {
			let wx = elem.w[0];
			let wy = elem.w[1]
			let l = this.elementLengths[i];
			if (this.config.analysisFlag === 1) {
				return [
					[-wx*l/2],
					[-wx*l/2]
				]
			}
			return [
				[-wx*l/2], [-wy*l/2], [-wy*l*l/12],
				[-wx*l/2], [-wy*l/2], [wy*l*l/12]
			]
		},

		/******************/
		/* Matrix methods */
		/******************/

		// Estimates the condition number of the assembled stiffness matrix. 
		estimateCondition(A) {
			if (this.degF.length < 2) return 2;
			let n = math.subset(math.size(A), math.index(0))
			// Check if matrix is empty
			if (n < 1) return 1e20;
			// Check if matrix is singular
			if (math.abs(math.det(A)) < 1e-10 || isNaN(math.det(A))) return NaN;
			// Higham-Tisseur block algorithm for 1-Norm estimation
			let x = math.divide(math.ones(n, 1), n);
			let k = 0;
			let e = math.identity(n);
			while (k++ < 20) {
				let y = math.lusolve(A, x);
				let z = math.lusolve(math.transpose(A), math.sign(y));
				let h = 0;
				let j = 0;
				z.forEach(function(value, index, matrix) {
					if (math.abs(value) > h) {
						h = math.abs(value);
						j = index[0];
					}
				});
				if (h <= math.multiply(math.transpose(z), x)._data[0][0]) {
					return math.multiply(math.sum(math.abs(y)), math.max(this.sumCols(math.abs(A))));
				}
				x = math.subset(e, math.index(math.range(0, n), j))._data;
			}
			return 1;
		},

		// Sum across rows
		sumRows(A) {
			let sum = math.zeros(A.size()[0], 1);
			A.forEach(function (value, index, matrix) {
				sum.subset(math.index(index[0], 0), sum.subset(math.index(index[0], 0)) + value);
			});
			return sum;
		},

		// Sum across columns
		sumCols(A) {
			let sum = math.zeros(1, A.size()[1]);
			A.forEach(function (value, index, matrix) {
				sum.subset(math.index(0, index[1]), sum.subset(math.index(0, index[1])) + value);
			});
			return sum;
		},

		/*****************************/
		/* Structure editing methods */
		/*****************************/

		saveStructure() {
			let structureData = {
				nodes: [],
				elements: [],
			};
			for (let i = 0; i < this.nodes.length; i++) {
				const {id, active, incElements, ...partial} = this.nodes[i];
				structureData.nodes.push(partial);
			}
			for (let i = 0; i < this.elements.length; i++) {
				const {id, active, ...partial} = this.elements[i];
				structureData.elements.push(partial);
			}
			return JSON.stringify(structureData);
		},

		loadStructure(structureString) {		
			if (!this.isJSON(structureString)) {
				return false;
			}
			let structureData = JSON.parse(structureString);
			if (structureData.nodes === undefined || structureData.elements === undefined) {
				return false;
			}
			this.clearStructure();
			for (let i = 0; i < structureData.nodes.length; i++) {
				this.addNode(structureData.nodes[i]);
			}
			for (let i = 0; i < structureData.elements.length; i++) {
				this.addElement(structureData.elements[i]);
			}
			return true;
		},

		clearStructure() {
			this.nodes = [];
			this.elements = [];
		},

		isJSON(str) {
			if (typeof(str) !== 'string') return false;
			try {
				JSON.parse(str);
				return true;
			} catch (e) {
				return false;
			}
		},

		addNode(node) {
			node = Object.assign({
				id: 'n' + this.nextNodeId++,
				n: this.nodes.length + 1,
				coords: [0, 0],
				loads: [0, 0, 0],
				fixity: [false, false, false],
				fixedDisp: [0, 0, 0],
				incElements: [[], []],
				active: false,
			}, node);
			this.nodes.push(node);
		},

		addNodes(nodes) {
			for (let i = 0; i < nodes.length; i++) {
				this.addNode(nodes[i]);
			}
		},

		addElement(elem) {
			if (elem.ends[0] !== elem.ends[1]) {
				elem = Object.assign({
					id: 'e' + this.nextElementId++,
					n: this.elements.length + 1,
					ends: [0, 1],
					releases: [false, false],
					material: 0,
					section: 0,
					w: [0, 0],
					active: false,
				}, elem);
				this.elements.push(elem);
				this.nodes[elem.ends[0]].incElements[0].push(elem);
				this.nodes[elem.ends[1]].incElements[1].push(elem);
			}
		},

		addMaterial(mat) {
			mat = Object.assign({
				id: 'm' + this.nextMaterialId++,
				n: this.materials.length + 1,
				E: 29000,
				v: 1,
				specificWeight: 1,
			}, mat);
			this.materials.push(mat);
		},	

		addSection(section) {
			section = Object.assign({
				id: 's' + this.nextSectionId++,
				n: this.sections.length + 1,
				A: 1,
				Iz: 1,
				Zz: 1,
				Ay: 1,
			}, section);
			this.sections.push(section);
		},

		removeNode(index) {
			for (let i = 0; i < this.elements.length; i++) {
				let elem = this.elements[i];
				if (elem.ends[0] === index || elem.ends[1] === index) {
					this.removeElement(i);
					i--;
				}
				if (elem.ends[0] > index) elem.ends[0]--;
				if (elem.ends[1] > index) elem.ends[1]--;
			}
			this.nodes.splice(index, 1);
		},

		removeElement(index) {
			let incStart0 = this.nodes[this.elements[index].ends[0]].incElements[0];
			let incStart1 = this.nodes[this.elements[index].ends[0]].incElements[1];
			let incEnd0 = this.nodes[this.elements[index].ends[1]].incElements[0];
			let incEnd1 = this.nodes[this.elements[index].ends[1]].incElements[1];
			for (let i = 0; i < incStart0.length; i++) {
				if (incStart0[i] === this.elements[index]) incStart0.splice(i, 1);
			}
			for (let i = 0; i < incStart1.length; i++) {
				if (incStart1[i] === this.elements[index]) incStart1.splice(i, 1);
			}
			for (let j = 0; j < incEnd0.length; j++) {
				if (incEnd0[j] === this.elements[index]) incEnd0.splice(j, 1);
			}
			for (let j = 0; j < incEnd1.length; j++) {
				if (incEnd1[j] === this.elements[index]) incEnd1.splice(j, 1);
			}
			this.elements.splice(index, 1);
		},	
		
		removeMaterial(index) {
			if (index === 0) {
				return;
			}
			for (let i=0; i < this.elements.length; i++) {
				if (this.elements[i].material === index) {
					this.elements[i].material = 0;
				}
			}
			this.materials.splice(index, 1);
		},

		removeSection(index) {
			if (index === 0) {
				return;
			}
			for (let i=0; i < this.elements.length; i++) {
				if (this.elements[i].section === index) {
					this.elements[i].section = 0;
				}
			}
			this.sections.splice(index, 1);
		},

		/**************/
		/* UI methods */
		/**************/

		resizeWindow() {
			// this.config.canvasW = this.getCanvasWidth();
			// this.config.canvasH = this.getCanvasHeight();
			// this.config.x = this.config.canvasW / 2;
			// this.config.y = this.config.canvasH / 2;
		},

		togglePanel(str) {
			if (this.config.panel === str) {
				this.config.panel = '';
			} else {
				this.config.panel = str;
			}
		},

		getCanvasWidth() {
			// return 200
			return parseFloat(window.getComputedStyle(this.$refs.canvas)["width"]);
		},

		getCanvasHeight() {
			// return 200
			return parseFloat(window.getComputedStyle(this.$refs.canvas)["height"]);
		},

		handleMouseDown(evt, i) {
			console.log("mouse down")
			switch(this.config.mode) {
				case 'navigate':
					this.panOn(evt);
					break;
				case 'draw-node':
					let rect = this.$refs.canvasContainer.$refs.canvas.getBoundingClientRect();
					// let rect = this.$refs.canvas.getBoundingClientRect();
					let x = Math.round((evt.x - rect.x - this.config.x) / this.config.scale / this.config.snapIncrement) * this.config.snapIncrement;
					let y = -Math.round((evt.y - rect.y - this.config.y) / this.config.scale / this.config.snapIncrement) * this.config.snapIncrement;
					this.addNode({ 
						coords: [x, y],
					});
					break;
				case 'draw-elem':
					if (i !== undefined) {
						if (this.drawElem.ends[0] === null) {
							this.drawElem.ends[0] = i;
							this.nodes[i].active = true;
						} else if (this.nodes[i].id !== this.nodes[this.drawElem.ends[0]].id) {
							this.drawElem.ends[1] = i;
							this.addElement({
								ends: [...this.drawElem.ends],
								releases: [...this.drawElem.releases],
								material: 0,
								section: 0,
							})
							this.nodes[this.drawElem.ends[0]].active = false;
							this.drawElem.ends = [null, null];	
						}
					} else if (this.drawElem.ends[0] !== null) {
							this.nodes[this.drawElem.ends[0]].active = false;
							this.drawElem.ends = [null, null];
					}
					break;
			}
		},

		handleMouseDown2(evt, rgba) {
			switch(this.config.mode) {
				case 'navigate':
					this.panOn(evt);
					break;
				case 'draw-node':
					this.drawNode(evt.x, evt.y);
					break;
				case 'draw-elem':
					if (rgba[0] === 254 && rgba[1] === 254) {
						let i = rgba[2]
						if (this.drawElem.ends[0] === null) {
							this.drawElem.ends[0] = i;
							this.nodes[i].active = true;
						} else if (this.nodes[i].id !== this.nodes[this.drawElem.ends[0]].id) {
							this.drawElem.ends[1] = i;
							this.addElement({
								ends: [...this.drawElem.ends],
								releases: [...this.drawElem.releases],
								material: 0,
								section: 0,
							})
							this.nodes[this.drawElem.ends[0]].active = false;
							this.drawElem.ends = [null, null];	
						}
					} else if (this.drawElem.ends[0] !== null) {
						// clear selected nodes
						this.nodes[this.drawElem.ends[0]].active = false;
						this.drawElem.ends = [null, null];
					}
					break;
			}
		},

		handleMouseMove(evt) {
			this.cursor.x = Math.round(evt.x / this.config.snapIncrement) * this.config.snapIncrement
			this.cursor.y = Math.round(evt.y / this.config.snapIncrement) * this.config.snapIncrement
		},

		drawNode(x, y) {
			// x = Math.round(x / this.config.snapIncrement) * this.config.snapIncrement;
			// y = Math.round(y / this.config.snapIncrement) * this.config.snapIncrement;
			this.addNode({ 
				coords: [this.cursor.x, this.cursor.y],
			});
		},

		// Enables panning via mouse, and stores initial pan location
		panOn(evt) {
			window.getSelection().empty();
			this.captureToggle = true;
			this.captureButton = evt.button;
			this.panX = this.config.x - evt.pageX;
			this.panY = this.config.y - evt.pageY;
		},

		panOnTouch(evt) {
			if (evt.touches.length === 2) {
				evt.preventDefault();
				this.captureToggle = true;
				let x = (evt.touches[0].pageX + evt.touches[1].pageX) / 2;
				let y = (evt.touches[0].pageY + evt.touches[1].pageY) / 2;
				this.panX = this.config.x - x;
				this.panY = this.config.y - y;
				this.prevDiff = Math.sqrt((evt.touches[0].clientX - evt.touches[1].clientX)**2 
						+ (evt.touches[0].clientY - evt.touches[1].clientY)**2);
			}
		},

		panOff(evt) {
			this.captureToggle = false;
			this.captureButton = -1;
		},

		panOffTouch(evt) {
			evt.preventDefault();
			this.captureToggle = false;
		},

		panMove(evt) {
			if (this.captureToggle) {
				this.config.x = evt.x + this.panX;
				this.config.y = evt.y + this.panY;
			}
			if (this.config.mode === 'draw-node' || this.config.mode === 'draw-elem') {
				let snapScaled = this.config.snapIncrement * this.config.scale
				let rect = this.$refs.canvas.getBoundingClientRect();
				this.cursor.x = Math.round((evt.x - rect.x - this.config.x) / snapScaled) * snapScaled + this.config.x;
				this.cursor.y = Math.round((evt.y - rect.y - this.config.y) / snapScaled) * snapScaled + this.config.y;
			}
		},

		panMoveTouch(evt) {
			if (evt.touches.length === 2) {
				evt.preventDefault();
				let x = (evt.touches[0].pageX + evt.touches[1].pageX) / 2;
				let y = (evt.touches[0].pageY + evt.touches[1].pageY) / 2;
				let curDiff = Math.sqrt((evt.touches[0].clientX - evt.touches[1].clientX)**2
						+ (evt.touches[0].clientY - evt.touches[1].clientY)**2);
				let d = 0.02 * (curDiff - this.prevDiff) * this.config.scale;
				if (math.abs(curDiff - this.prevDiff) > 2 && this.config.scale + d > this.config.scaleMin && this.config.scale + d < this.config.scaleMax) {
					let rect = this.$refs.canvas.getBoundingClientRect();
					this.config.x -= (d / this.config.scale) * (x - rect.x - this.config.x);
					this.config.y -= (d / this.config.scale) * (y - rect.y - this.config.y);					
					this.panX = this.config.x - x;
					this.panY = this.config.y - y;
					this.config.scale = math.round(this.config.scale + d, 3);
				}
				this.prevDiff = curDiff;
				
				if (this.captureToggle) {
					this.config.x = x + this.panX;
					this.config.y = y + this.panY;
				}
			}
		},

		zoomCanvas(evt) {
			let d = -0.1 * Math.sign(evt.deltaY) * this.config.scale;
			if (this.config.scale + d > this.config.scaleMin && this.config.scale + d < this.config.scaleMax) {
				let rect = this.$refs.canvas.getBoundingClientRect();
				this.config.x -= (d / this.config.scale) * (evt.pageX - rect.x - this.config.x);
				this.config.y -= (d / this.config.scale) * (evt.pageY - rect.y - this.config.y);
				this.config.scale = math.round(this.config.scale + d, 3);
			}
		},

		zoomFit() {
			let xmin = 0;
			let xmax = 0;
			let ymin = 0;
			let ymax = 0;
			for (let i = 0; i < this.nodes.length; i++) {
				let node = this.nodes[i];
				xmin = Math.min(xmin, node.coords[0])
				xmax = Math.max(xmax, node.coords[0])
				ymin = Math.min(ymin, node.coords[1])
				ymax = Math.max(ymax, node.coords[1])
			}
			// let xScale = this.config.canvasW / (xmax - xmin);
			// let yScale = this.config.canvasH / (ymax - ymin);
			// this.config.scale = math.round(0.95 * Math.min(xScale, yScale), 3);

			// this.config.x = -(xmin + xmax) / 2 * this.config.scale + this.config.canvasW / 2;
			// this.config.y = (ymin + ymax) / 2 * this.config.scale + this.config.canvasH / 2;
			this.input = {
				command: "zoom-fit",
				x: (xmin + xmax) / 2,
				y: (ymin + ymax) / 2,
				z: 10 * (Math.max(xmax - xmin, ymax-ymin)),
				width: xmax-xmin,
				height: ymax-ymin
			}
		},
		
	},
}
</script>

<style lang="scss">
@import "@/assets/styles/_variables.scss";
@import "@/assets/styles/_reboot.scss";
@import "@/assets/styles/_button.scss";
@import "@/assets/styles/_input.scss";

body {
	display: flex;
	flex-direction: column;
	font-family: "Fira Sans Condensed", sans-serif;
	height: 100vh;
	width: 100vw;
}

.bar {
	background-color: #202020;

	// background-color: #212529;
	button {
		color: white;
		font-weight: 700;
		padding: 0 0.75em;
	}
}

#app {
	display: grid;
	grid-auto-flow: column;
	grid-template: 
		"canvas table sidebar" 1fr 
		/ 1fr min-content min-content;
	height: 100%;
	overflow: hidden;
}

.home { 
	margin: 0 1rem 0 0.375rem;
	a {
		color: #ffffff;
		font-weight: bold;
	}
}

/**********/
/* Canvas */
/**********/

#canvas-header {
	align-items: center; 
	display: flex; 
	font-weight: 700;
	justify-content: flex-start;
	padding: 0.5rem;
	z-index: 10;
	pointer-events: auto;
  button {
		color: white; 
		font-weight: 700;
		padding: 0 0.25rem;
		margin-left: 0.125rem;
		&:last-of-type {
			margin-right: 0.25rem;
		}
	}
	select {
    height: 1.5rem;
    border-radius: 0;
		width: 6rem;
		padding: .25rem;
		font-size: .75rem;
	}
}

#canvas-container {
	grid-area: 1 / 1 / -1 / -2;
	overflow: hidden; 
	position: relative;
	margin-top: 2.625rem;
	margin-right: -1px;
	#canvas {
		height: 100%;
		width: 100%;
	}
	#canvas-overlay {
		height: 100%;
		width: 100%;
		position: absolute;
		// border: solid purple 5px;
		pointer-events: none;
		top: 0;
		bottom: 0;
	}
}

#canvas-settings-container {
	color: #ffffff;
	grid-area: canvas;
	pointer-events: none;
	z-index: 2;
	#canvas-settings {
		align-items: center;
		background-color: #3e3e3e3e;
		border: solid 1px #3e3e3e;
		display: grid;
		font-size: .75rem;
		gap: .25rem .25rem;
		grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
		max-width: 30rem;
		padding: .5rem 1rem;
		pointer-events: auto;
		width: 100vw;
		input[type=number] {
			height: 1.5rem;
			text-align: left;
		}
	}
}

svg {
	#rect-canvas {
		fill: #3a3a3a;
		stroke: none;
	}	
	.axis {
		stroke-dasharray: 2, 3;
		stroke-width: 0.125rem;
	}
	.axis-x {
		stroke: #AF4757;
	}
	.axis-y {
		stroke: #6a802a;
	}
	text {
		font-size: 0.75rem;
		user-select: all;
		-webkit-user-select: all;
		-moz-user-select: all;
		-ms-user-select: all;
	}
}

/**************/
/* Properties */
/**************/

.properties {
	display: flex;
	flex-direction: column;
	position: absolute;
	margin-left: 1rem; 
	margin-top: 3rem; 
	font-size: 0.75rem;
	color: #cdcdcd;
	.panel {
		align-items: center;
		display: grid;
		grid-template-columns: max-content minmax(3rem, 4rem);
		span {
			grid-column: span 2;
		}
		label,
		input[type=number],
		select,
		div {
			color: #cdcdcd;
			background-color: #323232;
			border: 1px solid rgba(255, 255, 255, 0.1);
			border-bottom: none;
			height: 100%;
			margin: 0;
			padding: 0.125rem;
			width: 100%;
		}
		input[type=number] {
			text-align: center;
		}
		div {
			text-align: right;
		}
		input, 
		select,
		div {
			border-left: none;
		}
		label {
			padding-right: 0.5em;
		}
		label:last-of-type,
		input:last-child,
		div:last-child {
			border-bottom: solid rgba(255, 255, 255, 0.1) 1px;
		}
	}
}

.structure-info {
	background: #b1040e;
	color: #fff;
	margin-top: 0.5rem;
	padding: 0.125rem;
	width: max-content;
}

/**********/
/* Tables */
/**********/

.list-container {
	grid-area: table;
	pointer-events: none;
	.list-body {
		align-items: end;
		align-self: flex-end;
		display: flex;
		flex-direction: column;
		margin: 0.5rem;
		height: min-content;
		pointer-events: auto;
	}
}

.sidebar {
	align-items: center;
	display: flex;
	flex-direction: column;
	grid-area: sidebar;
	padding: 0.25rem;
	button {
		font-weight: 700;
		margin-top: .25rem;
		padding: 0 .25rem;
	}
}

.list-header {
	background-color: #202020;
	color: white;
	display: flex;
	font-weight: 700;
	justify-content: space-between;
	padding: 0.5rem;
	pointer-events: auto;
	position: relative;
	button {
		font-weight: 700;
		padding: 0 0.3rem;
	}
	.cell-input {
		border-radius: 0;
		height: 1.5rem;
		padding: .25rem;
		text-align: right;
	}
	.row-submission {
		display: flex;
		input,
		select {
			width: 3rem;
			margin-right: 0.125rem;
			padding: .25rem;
			font-size: .75rem;
		}
	}
}

.list-rows {
	scrollbar-width: thin;
	list-style: none;
	margin: 0;
	max-height: 26rem;
	overflow-y: scroll;
	padding: 0;
	pointer-events: auto;
	position: relative;
	.input-sm {
		min-width: 1.25rem;
	}
	.input-number {
		min-width: 3rem;
	}
	.input-select {
		min-width: 3rem;
	}
	.list-item {
		padding: 0;
		background-color: #323232;
		margin: 0;
		border: 1px solid #505050;
		border-bottom: none;
		width: min-content;
		.list-item-row {
			align-items: center;
			display: grid;
			justify-items: center;
			justify-content: start;
			grid-template-columns: repeat(20, 1fr);
			padding: 0.06rem 0rem;
			.cell {
				input, 
				select {
					border-radius: 0px;
					padding: .25rem;
				}
				input[type='number'] {
					-moz-appearance: textfield !important;
					border: 1px #3e3e3e;
					border-style: none solid none solid;
					&:hover {
						-moz-appearance: textfield !important;
					}
					&::-webkit-inner-spin-button,
					&::-webkit-outer-spin-button {
						-webkit-appearance: none; 
						margin: 0; 
					}
				}
				&:first-child {
					input {
						text-align: center;
					}
				}
			}

		}
		.cell-button {
			align-items: stretch;
			display: flex;
			height: 100%;
			justify-content: flex-end;
			min-width: 2rem;	
		}

		&:last-child {
			border-bottom: 1px solid #505050;
		}

		&:hover {
			background-color: #3e3e3e;
		}
	}
}

.list-menu {
	border: solid 1px red;
	width: 3rem;
	height: 4rem;
	position: absolute;
	top: 0;
	right: 3rem;
}

.row-header {
	align-items: center;
	background: none;
	color: #cdcdcd;
	font-size: 0.75rem;
	display: grid; 
	width: min-content;
	justify-content: start;
	grid-template-columns: repeat(18, 1fr);
	overflow: hidden;
	grid-gap: 0;
	margin: 0;
	padding: 0;
	div {
		text-align: center;
		z-index: 1;
	}
}

.row-options {
	border: none;
}

/***********/
/* Buttons */
/***********/

.submit, 
.delete, 
.options {
	background-color: none;
	line-height: 1;
	padding: .25rem .25rem;
	margin: 0.125rem;
	font-size: 1rem;
	border: none;
	border-radius: 0;
	&:hover, 
	&:focus {
		border-radius: 0;
	}
}

.options {
	border-radius: .25rem 0 0 .25rem;
	border-right: none;
}

/***********/
/* Utility */
/***********/

.select-all {
	user-select: all;
	-webkit-user-select: all;
	-moz-user-select: all;
	-ms-user-select: all;
}

.select-none {
	user-select: none;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
}

@media screen and (max-width: 940px) {
	#app {
		grid-template: 
		"canvas" 1fr
		"table" min-content
		"sidebar" min-content
		/ 1fr;
		overflow: hidden;
	}
	.sidebar {
		flex-direction: row;
	}
	#canvas-container {
		grid-area: 1 / 1 / -2 / -1;
	}
	.list-container {
		display: flex;
		flex-direction: column-reverse;
	}
	.sidebar {
		button {
			margin-left: .25rem;
		}
	}
}

@media screen and (max-width: 460px) {
	.row-header{
		max-width: 20rem;
	}
	.list-rows {
		max-width: 20rem;
		width: 100%;
		.list-item {
			padding: 0;
			margin: 0;
			border-bottom: none;
			border-radius: 0;
			box-shadow: none;
			.list-item-row {
				.cell {
					input[type=number] {
						
					}
				}
			}
			&:last-child {
				border-bottom: solid 1px rgba(255, 255, 255, 0.1);
			}
		}
	}
}

</style>
