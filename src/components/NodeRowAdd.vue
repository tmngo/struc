<template>
  <div class="table-dark row-submission">
    <input 
      type="text" 
      class="cell-input form-control form-control-sm" 
      v-model.number="newNodeX" 
      placeholder="x" 
      oninput="this.value = this.value.replace(/[^0-9.-]/g, '').replace(/(\\..*)\\./g, '$1')"	
    />
    <input 
      type="text" 
      class="cell-input form-control form-control-sm" 
      v-model.number="newNodeY" 
      @keyup.enter="submitNode" 
      placeholder="y"
      oninput="this.value = this.value.replace(/[^0-9.-]/g, '').replace(/(\\..*)\\./g, '$1')" 
    />
    <div class="cell-button">
      <button 
        type="button" 
        class="btn btn-outline-success submit" 
        @click="submitNode" 
      ><b><i class="icon-add"></i></b></button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NodeRowAdd',
	props: {
    nodes: Array,
  },
	data () {
		return {
			newNodeX: '',
      newNodeY: '',
		}
	},
	methods: {
		submitNode() {
			this.$emit('submit', { 
        coords: [
          this.newNodeX === '' ? 0 : this.newNodeX, 
          this.newNodeY === '' ? 0 : this.newNodeY, 
        ],
      });
		},
	},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
