<template>
  <li class="list-item">

    <div class="list-item-row">

      <div class="cell">
        <input 
          class="cell-input input-sm form-control form-control-sm form-control-plaintext" 
          style="min-width: 4rem"
          type="text" 
          :title="section.n"
          v-model="section.n"
        >
      </div>

      <input-number
        class="cell row-options" 
        title="Area, A"
        v-model="section.A"
      ></input-number>

      <input-number
        class="cell row-options" 
        title="Moment of inertia about z, Iz"
        v-model="section.Iz"
      ></input-number>

      <!-- <input-number
        class="cell row-options" 
        title="Moment of inertia about y, Iy"
        v-model="section.Iy"
      ></input-number> -->

      <!-- <input-number 
        class="cell row-options" 
        title="Torsion constant, J"
        v-model="section.J"
      ></input-number> -->

      <!-- <input-number
        class="cell row-options" 
        title="Warping constant, Cw"
        v-model="section.Cw"
      ></input-number> -->
      <input-number
        v-show="analysisFlag === 0"
        class="cell row-options" 
        title="Shear area, Ay"
        v-model="section.Ay"
      ></input-number>
      <!-- <input-number
        class="cell row-options" 
        title="Shear area, Az"
        v-model="section.Az"
      ></input-number> -->
      <input-number
        v-show="analysisFlag === 0"
        class="cell row-options" 
        title="Plastic section modulus, Zz"
        v-model="section.Zz"
      ></input-number>
      <!-- <input-number
        class="cell row-options" 
        title="Plastic section modulus, Zy"
        v-model="section.Zy"
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
  name: 'SectionRow',
  components: {
    InputNumber, 
    InputNumberCheckbox,
  },
  props: {
    section: Object,
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
