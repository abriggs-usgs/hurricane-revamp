<template>
  <div id="hurricane-selection-container">
    <div
      v-for="hurricane in dataForAllHurricanes.hurricanes"
      :key="hurricane.name"
      class="hurricane-selection-button"
      @click="addCurrentHurricaneDataToState(hurricane), $emit('selectedNewHurricane')"
    >
      <button>{{ hurricane.name }} - {{ hurricane.year }}</button>
    </div>
  </div>
</template>
<script>
  import allHurricaneData from "../assets/hurricaneTracks/hurricaneData";

    export default {
        name: "HurricaneSelection",
        data() {
            return {
                dataForAllHurricanes: allHurricaneData
            };
        },
        methods: {
            addCurrentHurricaneDataToState(dataForCurrentHurricane) {
                this.getHurricaneTrackAsArray(dataForCurrentHurricane);
                this.$store.dispatch('changeDataForSelectedHurricane', dataForCurrentHurricane);
           },
            getHurricaneTrackAsArray(dataForCurrentHurricane) {
                let hurricaneTrack = [];
                dataForCurrentHurricane.features.forEach(function(feature) {
                    feature.geometry.coordinates.forEach(function (coordinateSet) {
                        hurricaneTrack.push(coordinateSet);
                    });
                });
                this.$store.dispatch('changeCoordinatesForSelectedHurricane', hurricaneTrack);
            }
        }
    }
</script>

<style scoped lang="scss">
  #hurricane-selection-container {
    display: flex;

    .hurricane-selection-button {
      flex: 1;

      button {
        width: 100%;
      }
    }
  }
</style>
