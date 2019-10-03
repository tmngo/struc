<template>
  <svg @mousedown.left.stop="$emit('selection', $event, i)">
    <defs>
      <marker 
					id="head" 
					orient="auto"
        	markerWidth="6" markerHeight="6"
        	refX="2.5" refY="3">
        <path class="load-arrow" d="M1,1 L3,3 L1,5"/>
      </marker>
    </defs>
		<!-- Node -->
    <circle 
			class="circle-node" 
			:fill="colors.nodeFill"
			:cx="x" 
			:cy="y" 
			:r="node.active ? 4 : 2" 
		/>
    <circle 
			class="circle-node" 
			v-show="view.nodeLabels" 
			:fill="colors.nodeFill"
			:cx="x" 
			:cy="y" 
			:r="node.active ? 7 : 5" 
		/>
    <text 
			class="node-label"
			style="stroke-width: 2px; stroke: #ffffff"
			v-show="view.nodeLabels" 
			:x="x" 
			:y="y + 3.5" 
		>{{ node.n }}</text>
		<text 
			class="node-label"
			v-show="view.nodeLabels" 
			:x="x" 
			:y="y + 3.5" 
		>{{ node.n }}</text>
    <!-- Force -->
    <path class="path-force"
      v-show="view.appliedForces && f !== 0" :d="forcePathDefinition" 
    />
    <text class="load-text"
      v-show="view.appliedForces && f !== 0" 
      :x="forceTextX" :y="forceTextY" 
    >{{ fRounded }}</text>
		<!-- Moment -->
    <path class="path-force"
      v-show="view.appliedForces && mZ !== 0"
      :d="momentPathDefinition"
    />
    <text class="load-text"
      v-show="view.appliedForces && mZ !== 0" 
      :x="x + 13" :y="y - 13" 
    >{{ mZRounded }}</text>
		<!-- Support X -->
    <polygon class="support fx" 
				v-show="node.fixity[0] && view.supports" 
        :points="reactionXTriangle" 
		/>
    <text class="fx"
				v-show="view.reactions && node.fixity[0]" 
				:x="x - 20" :y="y + 3" 
		>{{ rxRounded }}</text>
		<text class="fx"
				v-show="view.displacements" 
				:x="x - 20" :y="y + 3" 
		>{{ dxRounded }}</text>
		<!-- Support Y -->
    <polygon class="support fy" 
				v-show="node.fixity[1] && view.supports" 
        :points="reactionYTriangle" 
		/>
    <text class="fy"
				v-show="view.reactions && node.fixity[1]" 
				:x="x - 5" :y="y + 25" 
		>{{ ryRounded }}</text>
		<text class="fy"
				v-show="view.displacements" 
				:x="x - 5" :y="y + 25" 
		>{{ dyRounded }}</text>
		<!-- Support Z -->
    <polygon class="support mz" 
				v-show="node.fixity[2] && view.supports" 
        :points="reactionZTriangle" 
		/>
    <text class="mz"
				v-show="view.reactions && node.fixity[2]" 
				:x="x - 20" 
				:y="y + 25" 
		>{{ rzRounded }}</text>
		<text class="mz"
				v-show="view.displacements" 
				:x="x - 20" 
				:y="y + 25" 
		>{{ dzRounded }}</text>
  </svg>
</template>

<script>
import math from 'mathjs'

export default {
  name: 'NodeCircle',
	props: {
		node: Object,
		i: Number,
		displacements: Array,
		reactions: Array,
		view: Object,
		colors: Object,
	},
	computed: {
		dx () {
			return (this.node.coords[0] === "") ? 0 : this.node.coords[0] * this.view.scale;
		},
		dy () {
			return (this.node.coords[1] === "") ? 0 : this.node.coords[1] * this.view.scale;
		},
		x () {
			return this.view.x + this.dx;
		},
		y () {
			return this.view.y - this.dy;
		},
		fX () {
			return (this.node.qx === "") ? 0 : this.node.loads[0];
		},
		fY () {
			return (this.node.qy === "") ? 0 : this.node.loads[1];
		},
		mZ () {
			return (this.node.qz === "") ? 0 : this.node.loads[2];
		},
		f () {
			return math.sqrt(Math.pow(this.fX, 2) + Math.pow(this.fY, 2));
		},
		fRounded() {
			return this.f.toPrecision(this.view.significantFigures);
		},
		mZRounded () {
			return Math.abs(this.mZ.toPrecision(this.view.significantFigures));
		},

		rxRounded() {
			return this.roundSig(this.reactions[0]);
		},
		ryRounded() {
			return this.roundSig(this.reactions[1]);
		},
		rzRounded() {
			return this.roundSig(this.reactions[2]);
		},
		dxRounded() {
			return this.roundSig(this.displacements[0]);
		},
		dyRounded() {
			return this.roundSig(this.displacements[1]);
		},
		dzRounded() {
			return this.roundSig(this.displacements[2]);
		},

		reactionXTriangle() {		
			return (this.x - 6) + ',' + (this.y) + ' ' 
					+ (this.x - 11) + ',' + (this.y - 4) + ' ' 
					+ (this.x - 11) + ',' + (this.y + 4);
		},
		reactionYTriangle() {
			return (this.x) + ',' + (this.y + 6) + ' ' 
					+ (this.x + 4) + ',' + (this.y + 11) + ' ' 
					+ (this.x - 4) + ',' + (this.y + 11);
		},
		reactionZTriangle() {
			return (this.x - 4) + ',' + (this.y + 4) + ' ' 
					+ (this.x - 10.3) + ',' + (this.y + 4.7) + ' ' 
					+ (this.x - 4.7) + ',' + (this.y + 10.3);
		},
		forcePathDefinition() {
			if (this.f === 0) return "";
			return 'M' + (this.x - 50 * this.fX / this.f) + ','
					+ (this.y + 50 * this.fY / this.f) + 'L' 
					+ (this.x - 10 * this.fX / this.f) + ',' 
					+ (this.y + 10 * this.fY / this.f);
		},
		momentPathDefinition() {
			if (this.mZ === 0) return "";
			return 'M' + (this.x - 7.5) + ',' + (this.y + 13 * math.sign(this.mZ)) 
					+ 'A 15 15 0 1 ' + ((math.sign(this.mZ) - 1) / -2)
					+ (this.x - 7.5) + ',' + (this.y - 13 * math.sign(this.mZ));
		},
		forceTextX() {
			if (this.f === 0) return 0;
			return this.x - 55 * this.fX / this.f;
		},
		forceTextY() {
			if (this.f === 0) return 0;
			return this.y + 55 * this.fY / this.f;
		}
	},
	methods: {
		roundSig(x) {
			return (math.equal(x, 0)) ? 0 : x.toPrecision(this.view.significantFigures);
		}
	},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "@/assets/styles/_variables.scss";

.fx {
	fill: #B42E09;
	text-anchor: end;
}
.fy {
	fill: #52A23A;
	text-anchor: start;
}

.mz {
	fill: #4167B7;
	text-anchor: end;
}

.circle-node {
	// fill: $dark-warm;
}

.circle-node-active {
	fill: purple;
}

.node-label {
	fill: #000000; 
	font-size: 0.625rem;
	text-anchor: middle;
	user-select: none;
}

.support {
	opacity: 0.8;
}

.path-force {
	marker-end: url(#head);
	// stroke: $loads-of-gray;
	stroke: #c020e0;
	stroke-width: 2px;
	fill: none;
}
.load-arrow {
	// stroke: $loads-of-gray;
	stroke: #c020e0;
	fill: none;
}
.load-text {
	// fill: $loads-of-gray;
	fill: #c020e0;
	text-anchor: middle;
}
</style>
