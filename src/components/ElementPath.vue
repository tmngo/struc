<template>
  <svg @click="$emit('selection', $event, element)">
    <defs>
      <marker 
					id="arrow" 
					orient="auto"
					markerWidth="6" markerHeight="20"
					refX="3" refY="0">
        <path 
						d="M3,0 L3,10" 
						class="load-arrow"
						marker-end="url(#head)"
				/>
      </marker>
    </defs>

		<!-- Element path -->
    <path 
				:id="'path' + element.id" 
				:class="element.active ? 'path-element-active' : 'path-element'" 
				:d="elementPathDefinition"
		/>
		<!-- Distributed load -->
    <path 
				v-show="element.w[1] !== 0 && view.elementLoads" 
				:id="'pathw' + element.id" 
				class="path-element-load" 
				:d="wPathDefinition"
		/>
		<!-- Moment diagram -->
		<path 
				v-show="view.momentDiagrams" 
				class="path-moment-diagram" 
				:d="momentDiagram"
		/>
		
		<!-- Shear diagram -->
		<path 
				v-show="view.shearDiagrams" 
				class="path-moment-diagram" 
				:d="shearDiagram"
		/>
		
		<!-- End releases -->
    <circle 
				class="circle-release" 
				v-show="element.releases[0]" 
				:cx="xStartOffset" 
				:cy="yStartOffset" 
				r="2"
		/>
    <circle 
				class="circle-release" 
				v-show="element.releases[1]" 
				:cx="xEndOffset" 
				:cy="yEndOffset" 
				r="2"
		/>

		<!-- Axial force -->
    <text 
				class="select-all"
				:transform="transformList" 
				v-show="view.elementForces"
				style="fill: white"
		>
      <textPath 
					:href="'#path' + element.id" 
					startOffset="50%" 
					text-anchor="middle"
			>
        <tspan dy="-.25em">{{ forceRounded }}</tspan>
      </textPath>
    </text>

		<!-- Distributed load -->
    <text 
				class="select-all"
				v-show="element.w[1] !== 0 && view.elementLoads">
      <textPath 
					:href="'#pathw' + element.id" 
					startOffset="50%" 
					text-anchor="middle"
			>
        <tspan class="load-text" dy="-0.25em">{{ Math.abs(wRounded) }}</tspan>
      </textPath>
    </text>

		<!-- Moment diagram values -->
		<circle 
				class="circle-diagram" 
				v-show="view.momentDiagrams" 
				:cx="momentDiagramStartX" 
				:cy="momentDiagramStartY" 
				:r="showStartMoment ? 8 : 4"
				@mouseenter="showStartMoment = true"
				@mouseleave="showStartMoment = false"
		></circle>
		<circle 
				class="circle-diagram" 
				v-show="view.momentDiagrams" 
				:cx="momentDiagramEndX" 
				:cy="momentDiagramEndY" 
				:r="showEndMoment ? 8 : 4"
				@mouseenter="showEndMoment = true"
				@mouseleave="showEndMoment = false"
		></circle>
		<text 
				v-show="view.momentDiagrams && (view.diagramValues || showStartMoment)" 
				:x="momentDiagramStartX" 
				:y="momentDiagramStartY" 
				dx="4"
				dy="-8"
				fill="white"
		>{{ momentStartRounded }}
		</text>
		<text 
				v-show="view.momentDiagrams && (view.diagramValues || showEndMoment)" 
				:x="momentDiagramEndX" 
				:y="momentDiagramEndY" 
				dx="4"
				dy="-8"
				fill="white"
		>{{ momentEndRounded }}
		</text>

		<!-- Shear diagram values -->
		<circle 
				class="circle-diagram" 
				v-show="view.shearDiagrams" 
				:cx="shearDiagramStartX" 
				:cy="shearDiagramStartY" 
				:r="showStartShear ? 8 : 4"
				@mouseenter="showStartShear = true"
				@mouseleave="showStartShear = false"
		></circle>
		<circle 
				class="circle-diagram" 
				v-show="view.shearDiagrams" 
				:cx="shearDiagramEndX" 
				:cy="shearDiagramEndY" 
				:r="showEndShear ? 8 : 4"
				@mouseenter="showEndShear = true"
				@mouseleave="showEndShear = false"
		></circle>
		<text 
				v-show="view.shearDiagrams && (view.diagramValues || showStartShear)" 
				:x="shearDiagramStartX" 
				:y="shearDiagramStartY" 
				dx="4"
				dy="-8"
				fill="white"
		>{{ shearStartRounded }}
		</text>
		<text 
				v-show="view.shearDiagrams && (view.diagramValues || showEndShear)" 
				:x="shearDiagramEndX" 
				:y="shearDiagramEndY" 
				dx="4"
				dy="-8"
				fill="white"
		>{{ shearEndRounded }}
		</text>
  </svg>
</template>

<script>
import math from 'mathjs'

export default {
  name: 'ElementPath',
	props: {
		element: Object,
		l: Number,
		endNodes: Array,
		endForces: Array,
		elementForce: Number,
		displacements: Array,
		view: Object,
		momentScale: Number,
		shearScale: Number,
		transform: Array,
		isActive: Boolean,
		colors: Object,
	},
	data() {
		return {
			showStartMoment: false,
			showEndMoment: false,
			showStartShear: false,
			showEndShear: false,
		}
	},
	computed: {

		/* Element properties */

		displacementsLocal () {
			return math.multiply(this.displacements, math.inv(this.transform));
		},
		lDisplaced () {
			return (this.l - math.number(this.displacementsLocal[0]) + math.number(this.displacementsLocal[3]));
		},
		xStart () {
			return this.view.x + this.view.scale * this.endNodes[0].coords[0];
		},
		yStart () {
			return this.view.y - this.view.scale * this.endNodes[0].coords[1];
		},
		xEnd () {
			return this.view.x + this.view.scale * this.endNodes[1].coords[0];
		},
		yEnd () {
			return this.view.y - this.view.scale * this.endNodes[1].coords[1];
		},
		xMid () {
			return (this.xStart + this.xEnd) / 2;
		},
		yMid () {
			return (this.yStart + this.yEnd) / 2;
		},
		xPerp () {
			return (-this.yStart + this.yEnd) / (this.l * this.view.scale);
		},
		yPerp () {
			return (-this.xEnd + this.xStart) / (this.l * this.view.scale);
		},
		elementPathDefinition() {
			return 'M' + (this.xStart) + ',' + (this.yStart) + 'L' + (this.xEnd) + ',' + (this.yEnd);
		},

		/* Diagrams */

		wPathDefinition() {
			let str = 'm' + 12 * this.xPerp * Math.sign(-this.element.w[1]) + ',' + 12 * this.yPerp * Math.sign(-this.element.w[1])
					+ 'l' + (this.xEnd - this.xStart) / 3 * Math.sign(-this.element.w[1]) + ',' + (this.yEnd - this.yStart) / 3 * Math.sign(-this.element.w[1])
					+ 'l' + (this.xEnd - this.xStart) / 3 * Math.sign(-this.element.w[1]) + ',' + (this.yEnd - this.yStart) / 3 * Math.sign(-this.element.w[1])
					+ 'l' + (this.xEnd - this.xStart) / 3 * Math.sign(-this.element.w[1]) + ',' + (this.yEnd - this.yStart) / 3 * Math.sign(-this.element.w[1]);
			return (Math.sign(this.element.w[1]) < 0) ? 'M' + (this.xStart) + ',' + (this.yStart) + str : 'M' + (this.xEnd) + ',' + (this.yEnd) + str;
		},
		shearDiagramStartX() {
			let x = this.xStart - this.endForces[1] * this.shearScale * this.view.diagramScale * this.xPerp;
			return isNaN(x) ? 0 : x;
		},
		shearDiagramStartY() {
			let y = this.yStart - this.endForces[1] * this.shearScale * this.view.diagramScale * this.yPerp;
			return isNaN(y) ? 0 : y;
		},
		shearDiagramEndX() {
			let x = this.xEnd + this.endForces[4] * this.shearScale * this.view.diagramScale * this.xPerp;
			return isNaN(x) ? 0 : x;
		},
		shearDiagramEndY() {
			let y = this.yEnd + this.endForces[4] * this.shearScale * this.view.diagramScale * this.yPerp;
			return isNaN(y) ? 0 : y;
		},
		shearDiagram() {
			return 'M' + this.shearDiagramStartX + ',' + this.shearDiagramStartY
				+ 'L' + this.shearDiagramEndX + ',' + this.shearDiagramEndY;
		},
		momentDiagramStartX() {
			let x = this.xStart - this.endForces[2] * this.momentScale * this.view.diagramScale * this.xPerp;
			return isNaN(x) ? 0 : x;
		},
		momentDiagramStartY() {
			let y = this.yStart - this.endForces[2] * this.momentScale * this.view.diagramScale * this.yPerp;
			return isNaN(y) ? 0 : y;
		},
		momentDiagramEndX() {
			let x = this.xEnd + (0.5 * this.element.w[1] * this.l * this.l + this.endForces[1] * this.l 
					- this.endForces[2]) * this.momentScale * this.view.diagramScale * this.xPerp;
			return isNaN(x) ? 0 : x;
		},
		momentDiagramEndY() {
			let y = this.yEnd + (0.5 * this.element.w[1] * this.l * this.l + this.endForces[1] * this.l 
					- this.endForces[2]) * this.momentScale * this.view.diagramScale * this.yPerp;
			return isNaN(y) ? 0 : y;
		},
		momentDiagram() {
			if (isNaN(this.endForces[1])) {
				return "";
			}
			return 'M' 
				+ this.momentDiagramStartX + ',' + this.momentDiagramStartY
				+ 'Q' 
				+ (this.xMid + (0.5 * this.endForces[1] * this.l - this.endForces[2]) * this.momentScale * this.view.diagramScale * this.xPerp) + ',' 
				+ (this.yMid + (0.5 * this.endForces[1] * this.l - this.endForces[2]) * this.momentScale * this.view.diagramScale * this.yPerp) + ' '
				+ this.momentDiagramEndX + ',' + this.momentDiagramEndY;
		},

		forceRounded () {
			return (math.equal(this.elementForce, 0)) ? 0 
					: this.elementForce.toPrecision(this.view.significantFigures);
		},	
		wRounded () {
			return (math.equal(this.element.w[1], 0)) ? 0 
					: this.element.w[1].toPrecision(this.view.significantFigures);
		},
		shearStartRounded() {
			return (math.equal(this.endForces[1], 0)) ? 0 
					: (-this.endForces[1]).toPrecision(this.view.significantFigures);
		},
		shearEndRounded() {
			return (math.equal(this.endForces[4], 0)) ? 0 
					: this.endForces[4].toPrecision(this.view.significantFigures);
		},
		momentStartRounded() {
			return (math.equal(this.endForces[2], 0)) ? 0 
					: (-this.endForces[2]).toPrecision(this.view.significantFigures);
		},
		momentEndRounded() {
			return (math.equal(this.endForces[5], 0)) ? 0 
					: this.endForces[5].toPrecision(this.view.significantFigures);
		},
	
		/* End releases */

		xStartOffset () {
			return this.xStart + (this.xEnd - this.xStart) * 0.125;
		},
		yStartOffset () {
			return this.yStart + (this.yEnd - this.yStart) * 0.125;
		},
		xEndOffset () {
			return this.xStart + (this.xEnd - this.xStart) * 0.875;
		},
		yEndOffset () {
			return this.yStart + (this.yEnd - this.yStart) * 0.875;
		},

		/* Auto-rotate */

		topRotate () {
			return (this.endNodes[0].coords[0] < this.endNodes[1].coords[0]) ? 0 : 180;
		},
		transformList () {
			return "rotate(" + this.topRotate + ' ' + this.xMid + ' ' + this.yMid + ')';
		},
	},
	methods: {
		/* segmentToString(x, y) {
  		return [x.b.toFixed(2), y.b.toFixed(2), x.c.toFixed(2), y.c.toFixed(2), x.d.toFixed(2), y.d.toFixed(2)].join(",");
		}, */
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "@/assets/styles/_variables.scss";

.path-element {
	// stroke: $dark-warm;
	stroke: white;
	stroke-width: 2px; 
}
.path-element-active {
	stroke: #ffff00;
	stroke-width: 4px; 
}
.path-element-load {
	marker-end: url(#arrow);
	marker-mid: url(#arrow);
	stroke: $loads-of-gray; 
	stroke-width: 1px; 
}
.path-moment-diagram {
	fill: none;
	// stroke: $loads-of-gray;
	stroke: #00ffff;
}
.circle-release {
	fill: #3a3a3a;
	stroke: white;
}
.circle-diagram {
	// fill: $loads-of-gray; 
	fill: #00ffff;

}
.load-arrow {
	stroke: $loads-of-gray; 
	fill: none;
}
.load-text {
	fill: $loads-of-gray; 
}
</style>
