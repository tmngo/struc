<template>
  <li class="list-item" @mouseenter="element.active = true" @mouseleave="element.active = false">
    
    <div class="list-item-row">

      <div class="cell">
        <input 
          class="cell-input form-control form-control-sm form-control-plaintext" 
          type="text" 
          style="min-width: 2rem"
          v-model="element.n" 
        />
      </div>

      <div class="cell">
        <select 
          class="cell-input form-control form-control-sm input-select" 
          v-model="element.ends[0]"
        >
          <option 
            v-for="(node, i) in nodes" 
            :key="node.id" 
            :value="i"
          >{{ node.n }}</option>
        </select>
      </div>

      <div class="cell">
        <select 
          class="cell-input form-control form-control-sm input-select" 
          v-model="element.ends[1]"
        >
          <option 
            v-for="(node, i) in nodes" 
            :key="node.id" 
            :value="i"
          >{{ node.n }}</option>
        </select>
      </div>

      <div class="cell">
        <select 
          class="cell-input form-control form-control-sm input-select" 
          style="min-width: 4rem"
          v-model="element.material"
        >
          <option 
            v-for="(material, i) in materials" 
            :key="material.id" 
            :value="i"
          >{{ material.n }}</option>
        </select>
      </div>

      <div class="cell">
        <select 
          class="cell-input form-control form-control-sm input-select" 
          style="min-width: 4rem"
          v-model="element.section"
        >
          <option 
            v-for="(section, i) in sections" 
            :key="section.id" 
            :value="i"
          >{{ section.n }}</option>
        </select>
      </div>

      <input-number 
        v-show="analysisFlag === 0"
        class="cell row-options" 
        :title="'distributed load'" 
        v-model="element.w[0]" 
        :step="0.1">
      </input-number>
      <input-number 
        v-show="analysisFlag === 0"
        class="cell row-options" 
        :title="'distributed load'" 
        v-model="element.w[1]" 
        :step="0.1">
      </input-number>

      <input-number-checkbox 
        v-show="analysisFlag === 0"
        v-model="element.releases[0]" 
        style="min-width: 1.25rem"
      ></input-number-checkbox>
      <input-number-checkbox 
        v-show="analysisFlag === 0"
        v-model="element.releases[1]" 
        style="min-width: 1.25rem"
      ></input-number-checkbox>

      <div class="cell-button">
        <!-- <button 
          type="button" 
          class="btn btn-outline-secondary options" 
          @click="showOptions=!showOptions"><i 
          :class="{ 'icon-expand-more': !showOptions, 'icon-expand-less': showOptions }"></i>
        </button> -->
        <button 
          type="button" 
          class="btn btn-outline-danger delete"
          @click="$emit('remove')"><i class="icon-close"></i></button>
      </div>
    </div>

    <div class="row-options" v-show="showOptions">
      <div class="cell-button">
        <button 
          type="button" 
          class="btn btn-outline-secondary options" 
          :class="{ 'icon-expand-more': !showOptions, 'icon-expand-less': showOptions }"></i>
        </button>
      </div>
    </div>

  </li> 
</template>

<script>
import InputNumber from './InputNumber'
import InputNumberCheckbox from './InputNumberCheckbox'

export default {
  name: 'ElementRow',
  components: {
    InputNumber,
    InputNumberCheckbox,
  },
  props: {
    element: Object,
    nodes: Array,
    materials: Array,
    sections: Array,
    analysisFlag: Number,
  },
	data() {
		return {
			showOptions: false,
		};
	},
	computed: {
		optionsArrow () {
			return this.showOptions ? "\u25B2" : "\u25BC";
		},
		dX () {
			return this.element.end.x - this.element.start.x;
		},
		dY () {
			return this.element.end.y - this.element.start.y;
		},
		length () {
			return math.sqrt(Math.pow(this.dX, 2) + Math.pow(this.dY, 2));
		},
	},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
