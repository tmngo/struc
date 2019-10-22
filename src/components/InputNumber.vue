<template>
	<div 
		class="input-group input-group-sm input-number"
		@mouseover="showSpinner=true"
		@mouseleave="showSpinner=false"
	>
		<div v-if="hasSlotData" class="input-group-prepend">
			<slot></slot>
		</div>
		<div v-if="showSpinner" class="input-group-prepend btn-spinner">
			<button 
				class="btn btn-outline-secondary" 
				type="button" 
				@mousedown="increment(step)" 
				@mouseup="clearTiming" 
				@mouseleave="clearTiming" 
				@touchstart="increment(step)" 
				@touchend="clearTiming" 
				tabindex="-1"
			>&#x25b5;</button>
			<button 
				class="btn btn-outline-secondary" 
				type="button" 
				@mousedown="increment(-step)" 
				@mouseup="clearTiming" 
				@mouseleave="clearTiming" 
				@touchstart="increment(-step)" 
				@touchend="clearTiming" 
				tabindex="-1"
			>&#x25bf;</button>		
		</div>
		<input 
			type="number" 
			step="any"
			class="cell-input form-control form-control-sm" 
			:title="title"
			:value="valueLocal"
			:min="min"
			@input="debounceInput($event)"
			@focus="$event.target.select()"
		/>
		
  </div>
</template>

<script>
import debounce from 'lodash.debounce'

export default {
  name: 'InputNumber',
  props: {
		title: String,
		value: Number,
		step: {
			type: Number,
			default: 1,
		},
		min: {
			type: Number,
		},
	},
	model: {
		prop: 'value',
		event: 'valuechange',
	},
	data() {
		return {
			showSpinner: false,
			timeout: null,
			interval: null,
			debounceInput: debounce((evt) => {
				this.valueLocal = (evt.target.value === '') ? 0 : parseFloat(evt.target.value) 
			}, 250),
		};
	},
	computed: {
		valueLocal: {
			get: function() {
				return this.value;
			},
			set: function(newVal) {
				this.$emit('valuechange', newVal)
			}
		},
  	hasSlotData() {
    	return this.$slots.default;
    }
	},
	created() {
	},
	methods: {
		increment(step) {
			this.valueLocal += step;
			this.timeout = setTimeout(() => {
				this.interval = setInterval(() => { 
					this.valueLocal += step * 10;
				}, 30);
			}, 250);
			
		}, 
		clearTiming() {
			clearTimeout(this.timeout);
			clearInterval(this.interval);
		},
	},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.btn-spinner {
	background-color: none;
	z-index: 30;
	display: grid !important; 
	grid-template: 50% 50% / 1.125rem !important;
	height: 100%;
	position: absolute;
	button {
		height: 100% !important;
		line-height: 1em !important;
		margin: 0 !important;
		padding: 0 !important; 
		color: #cdcdcd;
		&:hover {
			background-color: #343a40;
		}
		&:first-child {
			margin-bottom: -1px !important;
			border-radius: 0; 
		}
		&:last-child {
			border-top: none;
		}
	}
}
</style>
