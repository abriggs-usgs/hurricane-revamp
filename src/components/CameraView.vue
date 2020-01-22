<template>
  <div>
    <div id="camera-controls-container">
      <button
        id="fly-to-button"
        @click="flyToHurricanePath"
      >
        fly
      </button>
      <button
        id="jump-to-button"
        @click="jumpToHurricanePath"
      >
        jump
      </button>
    </div>
    <div id="coords" />
  </div>
</template>
<script>
    import mapboxgl from "mapbox-gl";

    export default {
        name: "CameraView",
        data() {
            return {

            };
        },
        computed: {
            coordinatesForSelectedHurricanePath() {
                return this.$store.getters.getCoordinatesForSelectedHurricane;
            }
        },
        methods: {
            findBearing(startingLatitude, startingLongitude, destinationLatitude, destinationLongitude) {
                const getRadiansFromDegrees = function toRadians(degrees) {
                    return degrees * Math.PI / 180;
                };

                // Converts from radians to degrees.
                const getDegreesFromRadians = function toDegrees(radians) {
                    return radians * 180 / Math.PI;
                };
                startingLatitude = getRadiansFromDegrees(startingLatitude);
                startingLongitude = getRadiansFromDegrees(startingLongitude);
                destinationLatitude = getRadiansFromDegrees(destinationLatitude);
                destinationLongitude = getRadiansFromDegrees(destinationLongitude);

                let dLong = destinationLatitude - startingLatitude;

                let dPhi = Math.log(Math.tan(destinationLatitude/2.0+Math.PI/4.0)/Math.tan(startingLatitude/2.0+Math.PI/4.0));
                if (Math.abs(dLong) > Math.PI){
                    if (dLong > 0.0)
                        dLong = -(2.0 * Math.PI - dLong);
                    else
                        dLong = (2.0 * Math.PI + dLong);
                }

                return (getDegreesFromRadians(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
            },
            removeElements(ListOfElements) {
                ListOfElements.forEach(function(element) {
                    element.parentNode.removeChild(element)
                });
            },
            flyToHurricanePath: function() {
                let self = this;
                let hurricaneTrack = this.coordinatesForSelectedHurricanePath;
                const degreesToRadians = function(degrees) {
                    return degrees * Math.PI / 180;
                };
                const distanceInKmBetweenEarthCoordinates = function(lat1, lon1, lat2, lon2) {
                    let earthRadiusKm = 6371;
                    let dLat = degreesToRadians(lat2-lat1);
                    let dLon = degreesToRadians(lon2-lon1);
                    lat1 = degreesToRadians(lat1);
                    lat2 = degreesToRadians(lat2);
                    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
                    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                    return earthRadiusKm * c;
                };
                let coorDiv = document.getElementById("coords");
                let map = this.$store.map;

                let i = 0;
                let mapDistance = null;
                let distanceAdjustmentMultiplier = 1;
                let baseDurationOfFlyToAction = 1000;
                let intervalId = setInterval(function(){
                    if(i === hurricaneTrack.length - 1){
                        clearInterval(intervalId);
                    }
                    coorDiv.innerHTML = 'the current coordinates ' + hurricaneTrack[i][0] + ', ' + hurricaneTrack[i][1]
                    if (i < hurricaneTrack.length - 1) {
                        mapDistance = distanceInKmBetweenEarthCoordinates(hurricaneTrack[i][0], hurricaneTrack[i][1], hurricaneTrack[i+1][0], hurricaneTrack[i+1][1]);
                    }
                    if (mapDistance !== 0) {
                        distanceAdjustmentMultiplier = baseDurationOfFlyToAction/mapDistance;
                        console.log('this is the multiplier ', distanceAdjustmentMultiplier)
                    }
                    coorDiv.innerHTML = 'the current coordinates are ' + hurricaneTrack[i][0] + ', ' + hurricaneTrack[i][1] + ', and the distance between is ' + mapDistance + ' kilometers.'


                    self.removeElements(document.querySelectorAll('.mapboxgl-popup'));
                    let description = 'test text'
                    new mapboxgl.Popup()
                            .setLngLat(hurricaneTrack[i])
                            .setHTML(description)
                            .addTo(map);

                    map.flyTo({
                        center: [hurricaneTrack[i][0], hurricaneTrack[i][1]],
                        zoom: 7,
                        bearing: 0,
                        speed: 0.12, // make the flying slow
                        curve: 1, // change the speed at which it zooms out
                    });
                    i++;
                    console.log('duration ' + baseDurationOfFlyToAction/distanceAdjustmentMultiplier)
                }, baseDurationOfFlyToAction)
            },
            jumpToHurricanePath: function() {
                let currentHurricaneTrack = this.coordinatesForSelectedHurricanePath;
                let map = this.$store.map;
                let self = this;

                let flyToStart = function() {
                    map.flyTo({
                        center: currentHurricaneTrack[0],
                        zoom: 5,
                        bearing: 20,
                        speed: 0.12, // make the flying slow
                        curve: 1, // change the speed at which it zooms out
                    });
                };

                const createCurrentAndNextCoordinateList = function(currentCoordinates, nextCoordinates) {
                    let currentAndNextCoordinates = [];
                    currentAndNextCoordinates.push(currentCoordinates, nextCoordinates);
                    return currentAndNextCoordinates
                };

                let jump = function() {
                    let currentCoordinatePair = [];

                    currentHurricaneTrack.forEach(function(nextCoordinatePair, index) {
                        setTimeout(function(){
                            if (index === 0) {
                                let mapCenterCoordinates = map.getCenter();
                                currentCoordinatePair.push(mapCenterCoordinates.lng, mapCenterCoordinates.lat);
                            }
                            let currentAndNextCoordinates = createCurrentAndNextCoordinateList(currentCoordinatePair, nextCoordinatePair);
                            let bearing = self.findBearing(currentAndNextCoordinates[0][1], currentAndNextCoordinates[0][0], currentAndNextCoordinates[1][1], currentAndNextCoordinates[1][0]);

                            currentCoordinatePair = nextCoordinatePair;

                            // map.jumpTo({center: currentHurricaneTrack[index], zoom: 5, bearing: bearing });
                            map.jumpTo({center: currentHurricaneTrack[index], zoom: 5, bearing: 0 });
                            console.log('this is bearing ', bearing)
                        }, index * 1000);
                    });
                };
                // fly to the starting point
                flyToStart();
                // use a promise to delay the start of the jumpTo action
                let promise = new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        resolve('time up');
                    }, 7000);
                });

                promise.then(function(value) {
                    jump();
                });
            }
        }
    }
</script>

<style scoped lang="scss">
  #camera-controls-container {
    display: flex;

    button {
      flex: 1;
    }
  }
</style>
