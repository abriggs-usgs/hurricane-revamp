<template>
  <div>
    <HurricaneSelection @selectedNewHurricane="addCurrentHurricaneDataAsMapboxSource()"/>
    <CameraView />
  </div>
</template>

<script>
    import CameraView from "./CameraView";
    import HurricaneSelection from "./HurricaneSelection";

    export default {
        name: "HurricaneTrack",
        components: {
            CameraView,
            HurricaneSelection
        },
        data() {
            return {
                currentHurricaneId: null
            };
        },
        computed: {
            selectedHurricaneData() {
                return this.$store.getters.getDataForSelectedHurricane;
            },
            coordinatesForSelectedHurricanePath() {
                return this.$store.getters.getCoordinatesForSelectedHurricane;
            }
        },
        methods: {
            addCurrentHurricaneDataAsMapboxSource() {
                let map = this.$store.map;
                if (this.currentHurricaneId !== this.selectedHurricaneData.id) {
                    let hurricaneTrackStyle = {
                        'id': 'hurricane track',
                        'type': 'line',
                        'source': this.currentHurricaneId,
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
                        }
                    };

                    map.addSource(this.currentHurricaneId, {
                        "type": "geojson",
                        "data": this.selectedHurricaneData
                    });
                    map.addLayer();
                }
            },
            addLayerToMap() {
                this.$store.map.addLayer(this.getHurricaneTrackStyle);
            }
        }
    }
</script>

<style scoped lang="scss">

</style>