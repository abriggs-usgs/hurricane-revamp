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
            flyToHurricanePath: function() {
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
                let distanceAdjustmentMultiplyer = 1;
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
                        distanceAdjustmentMultiplyer = baseDurationOfFlyToAction/mapDistance;
                        console.log('this is the multiplier ', distanceAdjustmentMultiplyer)
                    }
                    coorDiv.innerHTML = 'the current coordinates are ' + hurricaneTrack[i][0] + ', ' + hurricaneTrack[i][1] + ', and the distance between is ' + mapDistance + ' kilometers.'

                    map.flyTo({
                        center: [hurricaneTrack[i][0], hurricaneTrack[i][1]],
                        zoom: 7,
                        bearing: 0,
                        speed: 0.12, // make the flying slow
                        curve: 1, // change the speed at which it zooms out
                    });
                    i++;
                    console.log('duration ' + baseDurationOfFlyToAction/distanceAdjustmentMultiplyer)
                }, baseDurationOfFlyToAction)
            },
            jumpToHurricanePath: function() {
                let currentHurricaneTrack = this.coordinatesForSelectedHurricanePath;
                let map = this.$store.map;

                let fly = function() {
                    map.flyTo({
                        center: currentHurricaneTrack[0],
                        zoom: 5,
                        bearing: 20,
                        speed: 0.12, // make the flying slow
                        curve: 1, // change the speed at which it zooms out
                    });
                };

                let jump = function() {
                    currentHurricaneTrack.forEach(function(obj,index) {
                        setTimeout(function(){
                            map.jumpTo({center: currentHurricaneTrack[index], zoom: 5})
                            console.log('count ', index);
                        }, index * 1000);
                    });
                };
                // fly to the starting point
                fly();
                // use a promise to delay the start of the jumpTo action
                let promise1 = new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        resolve('time up');
                    }, 7000);
                });

                promise1.then(function(value) {
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
