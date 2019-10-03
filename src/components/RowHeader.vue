<template>
  <li>
    <div 
      v-for="(h, i) in headings" 
      :key="i+h"
      class="input-sm"
      :style="{ 'min-width': widths[i] + 'rem' }"
    >{{ h }}</div>
  </li>
</template>

<script>
import InputNumber from './InputNumber'
import InputNumberCheckbox from './InputNumberCheckbox'

export default {
  name: 'RowHeader',
  components: {
    InputNumber, 
    InputNumberCheckbox,
  },
  props: ['headings', 'widths'],
	data() {
		return {

		};
	},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
