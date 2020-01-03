<template>
  <div>
    <HurricaneSelection @selectedNewHurricane="addCurrentHurricaneDataAsMapboxSource()"/>
    <CameraView />
  </div>
</template>

<script>
    import CameraView from "./CameraView";
    import HurricaneSelection from "./HurricaneSelection";
    import dataForAllHurricanes from "../assets/hurricaneTracks/allHurricaneData";

    export default {
        name: "HurricaneTrack",
        components: {
            CameraView,
            HurricaneSelection
        },
        data() {
            return {
                isDataForAllHurricanesAddedAsSource: false
            };
        },
        computed: {
            selectedHurricaneData() {
                return this.$store.getters.getDataForSelectedHurricane;
            }
        },
        methods: {
            getHurricaneTrackStyle() {
                let hurricaneTrackStyle = {
                    'id': this.selectedHurricaneData.id,
                    'type': 'line',
                    'source': 'dataForAllHurricanes',
                    'layout': {
                        'visibility': 'visible',
                    },
                    'paint': {
                        'line-color': 'blue',
                        'line-width': {
                            'base': 4,
                            'stops': [
                                [0, 4],
                                [20, 8]
                            ]
                        }
                    },
                    'filter': ['==', '$properties.id', this.selectedHurricaneData.id]
                };
                console.log(JSON.stringify(hurricaneTrackStyle))
                return hurricaneTrackStyle;
            },
            addCurrentHurricaneDataAsMapboxSource() {
                let map = this.$store.map;


                if (!this.isDataForAllHurricanesAddedAsSource) {
                    map.addSource("dataForAllHurricanes", {
                        "type": "geojson",
                        "data": dataForAllHurricanes.hurricanes
                    });
                    this.isDataForAllHurricanesAddedAsSource = true;
                }

                if(!map.getLayer(this.selectedHurricaneData.id)) {
                    this.addLayerToMap();
                }
            },
            addLayerToMap() {
                this.$store.map.addLayer(this.getHurricaneTrackStyle());
            }
        }
    }
</script>

<style scoped lang="scss">

</style>