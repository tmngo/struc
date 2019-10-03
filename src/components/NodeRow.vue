<template>
  <li class="list-item" @mouseenter="node.active = true" @mouseleave="node.active = false">

    <div class="list-item-row">

      <div class="cell">
        <input 
          class="cell-input form-control form-control-sm form-control-plaintext" 
          type="text" 
          style="min-width: 2rem"
          v-model="node.n"
        >
      </div>

      <input-number class="cell" v-model="node.coords[0]"></input-number>
      <input-number class="cell" v-model="node.coords[1]"></input-number>

      <input-number-checkbox 
        v-model="node.fixity[0]"
        style="min-width: 1.25rem"
      ></input-number-checkbox>
      <input-number
        class="cell row-options" 
        v-model="node.loads[0]"
      ></input-number>

      <input-number-checkbox 
        v-model="node.fixity[1]"
        style="min-width: 1.25rem"
      ></input-number-checkbox>
      <input-number 
        class="cell row-options" 
        v-model="node.loads[1]"
      ></input-number>

      <input-number-checkbox 
        v-show="analysisFlag === 0"
        v-model="node.fixity[2]"
        style="min-width: 1.25rem"
      ></input-number-checkbox>
      <input-number 
        v-show="analysisFlag === 0"
        class="cell row-options" 
        v-model="node.loads[2]"
      ></input-number>

      <div class="cell-button">
        <!-- <button 
          class="btn btn-outline-dark options" 
          type="button" 
          @click="showOptions = !showOptions"
        >
          <i :class="{ 'icon-expand-more': !showOptions, 'icon-expand-less': showOptions }"></i>
        </button> -->
        <button 
          class="btn btn-outline-danger delete" 
          type="button" 
          @click="$emit('remove')"
        >
          <i class="icon-close"></i>
        </button>
      </div>

    </div>

  </li>
</template>

<script>
import InputNumber from './InputNumber'
import InputNumberCheckbox from './InputNumberCheckbox'

export default {
  name: 'NodeRow',
  components: {
    InputNumber, 
    InputNumberCheckbox,
  },
  props: {
    node: Object,
    nodes: Array,
    analysisFlag: Number,
  },
	data() {
		return {
			showOptions: false,
		};
	},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
