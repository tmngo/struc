<template>
  <svg @click="$emit('selection', $event, element)">
    <defs>
      <marker 
				id="arrow" 
				orient="auto"
				markerWidth="6" markerHeight="20"
				refX="3" refY="0"
			>
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
			:class="[element.active ? 'path-element-active' : 'path-element']" 
			:style="{ stroke: elementColor }"
			:d="elementPathDefinition"
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

  </svg>
</template>

<script>
import math from 'mathjs'

export default {
  name: 'ElementPathAxial',
	props: {
		element: Object,
		l: Number,
		endNodes: Array,
		endForces: Array,
		elementForce: Number,
		displacements: Array,
		view: Object,
		transform: Array,
		isActive: Boolean,
		colors: Object,
		maxAxial: Number,
		trussColoring: Boolean,
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

		forceRounded () {
			return (math.equal(this.elementForce, 0)) ? 0 
					: this.elementForce.toPrecision(this.view.significantFigures);
		},	

		elementColor () {
			if (this.element.active) {
				return '#ffff00';
			}
			if (this.trussColoring) {
				return `rgb(${
						this.elementForce < 0.001 ? 255 * (1 + this.elementForce / this.maxAxial)**2 : 255}, ${
						this.elementForce > -0.001 ? 255 * (1 - this.elementForce / this.maxAxial)**2 : 255 * (1 + 1 * this.elementForce / this.maxAxial)}, ${
						this.elementForce > -0.001 ? 255 * (1 - this.elementForce / this.maxAxial)**2 : 255})`
			}
			return '#ffffff'
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
	stroke-width: 2px; 
}
.path-element-active {
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
