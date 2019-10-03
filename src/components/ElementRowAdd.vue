<template>
  <div class="table-dark row-submission">
    <select 
      class="cell cell-input form-control form-control-sm" 
      placeholder="#" 
      v-model="i"
    >
      <option selected disabled hidden value="">N1</option>	
      <option 
        v-for="(node, i) in nodes" 
        :key="node.id" 
        :value="i"
      >{{ node.n }}</option>
    </select>
    <select 
      class="cell cell-input form-control form-control-sm" 
      @keyup.enter="submitElement" 
      v-model="j"
    >
      <option selected disabled hidden value="">N2</option>		
      <option 
        v-for="(node, i) in nodes" 
        :key="node.id" 
        :value="i"
      >{{ node.n }}</option>
    </select>
    <div class="cell-button">
      <button 
        type="button" 
        class="btn btn-outline-success submit" 
        @click="submitElement" 
      ><i class="icon-add"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ElementRowAdd',
	props: ['elements', 'nodes'],
	data() {
		return {
      i: null,
      j: null,
		}		
	},
	methods: {
		submitElement() {
			this.$emit('submit', { ends: [this.i, this.j] })
		},
	},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
