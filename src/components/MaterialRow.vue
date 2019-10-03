<template>
  <li class="list-item">

    <div class="list-item-row">

      <div class="cell">
        <input 
          class="cell-input input-sm form-control form-control-sm form-control-plaintext" 
          style="min-width: 4rem"
          type="text" 
          :title="material.n"
          v-model="material.n"
        >
      </div>

      <input-number
        class="cell row-options" 
        title="Elastic modulus, E"
        v-model="material.E"
      ></input-number>

      <input-number
        class="cell row-options" 
        title="Poisson ratio, v"
        v-model="material.v"
      ></input-number>

      <input-number
        class="cell row-options" 
        title="Yield stress, fy"
        v-model="material.Fy"
      ></input-number>

      <input-number 
        class="cell row-options" 
        v-model="material.specificWeight"
      ></input-number>

      <!-- <input-number
        class="cell row-options" 
        v-model="material.yieldSurface[0]"
      ></input-number>
      <input-number
        class="cell row-options" 
        v-model="material.yieldSurface[1]"
      ></input-number>
      <input-number
        class="cell row-options" 
        v-model="material.yieldSurface[2]"
      ></input-number> -->

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
  name: 'MaterialRow',
  components: {
    InputNumber, 
    InputNumberCheckbox,
  },
  props: ['material'],
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
