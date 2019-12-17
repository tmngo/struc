<template>
  <div id="canvas-settings-container">
    <slot></slot>
      <transition name="slide-fade">
        <div id="canvas-settings" v-show="config.display">

          <div>
            <label>Analysis mode</label>
            <select 
              class="cell cell-input form-control form-control-sm" 
              style="height: 1.5rem; font-size: .75rem"
              v-model="config.analysisFlag"
            >
              <option :value="0">Frame</option>	
              <option :value="1">Truss</option>
            </select>
          </div>

          <!-- <div>
            <label for="zoom">Zoom (scroll canvas)</label>
            <input 
              id="zoom"
              type="number" 
              class="form-control form-control-sm" 
              min="0" :max="config.scaleMax"
              step="0.001"
              v-model.number="config.scale"
              style="height: 1.5rem; font-size: .75rem"
            >
          </div> -->
          
          <div>
            <label for="sigfigs">Signifiicant figures</label>
            <input 
              id="sigfigs"
                style="height: 1.5rem; font-size: .75rem"
                type="number" 
                class="form-control form-control-sm" 
                min="1" max="9" 
                v-model.number="config.significantFigures"
            >
          </div>

          <div>
            <label>Diagram scale</label>
            <div>
              <input 
                style="height: 1.5rem; font-size: .75rem"
                type="number" 
                class="form-control form-control-sm" 
                step="0.1"
                v-model.number="config.diagramScale"
              >
            </div>
          </div>

          <div>
            <label>Diagram segments</label>
            <div>
              <input 
                style="height: 1.5rem; font-size: .75rem"
                type="number" 
                class="form-control form-control-sm" 
                step="1"
                min="1"
                v-model.number="config.diagramSegments"
              >
            </div>
          </div>

          <div>
            <label>Element diagrams</label>
            <select 
              class="cell cell-input form-control form-control-sm" 
              style="height: 1.5rem; font-size: .75rem"
              v-model="config.diagramType"
            >
              <option :value="0">None</option>
              <option :value="1">Distributed load</option>	
              <option :value="2">Shear force</option>
              <option :value="3">Bending moment</option>
              <option :value="4">Rotation</option>
              <option :value="5">Displacement</option>
            </select>
          </div>

          <div>
            <label>Node results</label>
            <select 
              class="cell cell-input form-control form-control-sm" 
              style="height: 1.5rem; font-size: .75rem"
              v-model="config.nodeResults"
            >
              <option :value="0">None</option>
              <option :value="1">Reactions</option>	
              <option :value="2">Displacements</option>
            </select>
          </div>

          <input-checkbox :object="config" style="grid-column-start: 1"
              :setting="'nodeLabels'" 
              :label="'Node labels'"
          ></input-checkbox>
          <input-checkbox :object="config" 
              :setting="'appliedForces'" 
              :label="'Nodal loads'"
          ></input-checkbox>
          <input-checkbox :object="config" 
              :setting="'supports'" 
              :label="'Supports'"
          ></input-checkbox>
          <input-checkbox :object="config" 
              :setting="'elementForces'" 
              :label="'Axial forces'"
          ></input-checkbox>
          <input-checkbox :object="config" 
            v-show="config.analysisFlag === 0"
            :setting="'diagramValues'" 
            :label="'Values on diagram'"
          ></input-checkbox>
          <input-checkbox :object="config" 
            :setting="'axes'" 
            :label="'Axes'"
          ></input-checkbox>
          <input-checkbox :object="config" 
            v-show="config.analysisFlag === 1"
            :setting="'trussColoring'" 
            :label="'Truss coloring'"
          ></input-checkbox>
          
          <div 
            class="input-group input-group-sm" 
            style="grid-column-start: 1;height: 1.5rem !important; display: flex; align-items: stretch;"
          >
            <div class="input-group-prepend">
              <button 
                style="font-size: .75rem"  
                class="btn btn-outline-light" 
                type="button" 
                @click="$emit('loaded')"
              >Import</button>
            </div>
            <input 
              type="text" 
              style="font-size: .75rem;"  
              class="form-control form-control-sm" 
              v-model="config.loadValue"
            >
          </div>

          <div 
            class="input-group input-group-sm" 
            style="grid-column-start: 2;display: flex; align-items: stretch; height: 1.5rem"
          >
            <div class="input-group-prepend">
              <button 
                style="font-size: .75rem;"  
                class="btn btn-outline-light" 
                type="button" 
                @click="$emit('saved')"
              >Export</button>
            </div>
            <input 
              type="text" 
              style="font-size: .75rem;"  
              class="form-control form-control-sm" 
              v-model="config.saveValue" 
              @focus="$event.target.select()"
            >
          </div>

      </div>
    </transition>

  </div>
</template>

<script>
import InputCheckbox from './InputCheckbox'

export default {
  name: 'CanvasSettings',
  components: {
    InputCheckbox,
  },
  props: ['config'],
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
