<template>
  <div class="input-group-text cell">
    <input type="checkbox" v-model="valueLocal">
  </div>
</template>

<script>
export default {
  name: 'InputNumberCheckbox',
  props: ['value'],
  model: {
		prop: 'value',
		event: 'valuechange',
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
	},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
div {
  height: calc(1.8125rem + 2px);
  padding: 0 0.125rem;
  border-radius: 0;
  margin: 0;
}
input {
  height: 100%;
  margin: auto;
  display: block;
}
</style>
