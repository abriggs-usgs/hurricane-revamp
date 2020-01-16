<template>
  <div id="hurricane-selection-container">
    <div
      v-for="hurricane in allHurricaneData.hurricanes.features"
      :key="hurricane.properties.name"
      class="hurricane-selection-button"
      @click="addCurrentHurricaneDataToState(hurricane.properties)"
    >
      <button>{{ hurricane.properties.name }} - {{ hurricane.properties.year }}</button>
    </div>
  </div>
</template>

<script>
  import allHurricaneData from "../assets/hurricaneTracks/allHurricaneData";

    export default {
        name: "HurricaneSelection",
        data() {
            return {
                allHurricaneData: allHurricaneData
            };
        },
        methods: {
            addCurrentHurricaneDataToState(dataForCurrentHurricane) {
                console.log('this is it ' + JSON.stringify(dataForCurrentHurricane))
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
