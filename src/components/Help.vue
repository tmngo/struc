<template>
  <div class="hello">
    <div>Help</div>
  </div>
</template>

<script>
export default {
  name: 'Help',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hello {
	display: grid;
	grid-template-columns: 16rem 16rem 19rem 19rem;
	grid-template-rows: 34rem;
	left: 50%;
	margin: -17rem 0 0 -35rem;
	position: absolute;
  top: 50%;
  background-color: white;
}
</style>
