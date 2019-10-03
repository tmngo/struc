<template>
  <div class="list-container">

			<div class="list-header">
        <slot name="header"></slot>
			</div>

			<div class="list-body">
        
    		<transition-group name="list" tag="ul" class="list-rows">
          <row-header
          :key="headings[0] + headings[1] + headings[2]"
          class="row-header"
          :headings="headings"
          :widths="widths"
        ></row-header>
          <slot></slot>
				</transition-group>
  		</div>

  </div>
</template>

<script>
import RowHeader from './RowHeader'

export default {
  name: 'ArrayList',
  components: {
		RowHeader,
  },
  props: {
    headings: Array,
    widths: Array,
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
