<template>
  <div class="form-check form-check-inline">
    <input class="form-check-input" type="checkbox" :id="id" v-model="object[setting]">
    <label class="form-check-label" :for="id">{{ label }}</label>
  </div>
</template>

<script>
export default {
  name: 'InputCheckbox',
  props: ['object', 'setting', 'label'],
  computed: {
    id () {
      return 'checkbox-' + this.setting.toLowerCase();
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
