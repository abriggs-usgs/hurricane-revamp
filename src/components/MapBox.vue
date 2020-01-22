<template>
  <div
    id="viz_container"
  >
    <LoadingScreen
      v-if="!isInternetExplorer"
      :is-loading="isLoading"
    />

    <div class="header-container">
      <div class="usa-prose">
        <h1 class="title-text">
          {{ title }}{{ titleSuffix }} {{ developmentTier }}
        </h1>
      </div>
    </div>
    <InternetExplorerPage v-if="isInternetExplorer" />
    <div
      v-if="!isInternetExplorer"
      id="mapContainer"
    >
      <MglMap
        id="mapgl"
        :container="container"
        :map-style="mapStyle"
        :zoom="zoom"
        :min-zoom="minZoom"
        :max-zoom="maxZoom"
        :center="center"
        :pitch="pitch"
        :bearing="bearing"
        :pitch-with-rotate="false"
        :drag-rotate="false"
        :touch-zoom-rotate="false"
        @load="onMapLoaded"
      >
        <MglAttributionControl
          position="bottom-right"
          :compact="false"
          custom-attribution="© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />

        <MglNavigationControl
          position="top-right"
          :show-compass="false"
        />
        <QuestionControl />
        <MglScaleControl
          position="bottom-right"
          unit="imperial"
        />
        <MglFullscreenControl position="bottom-right" />
        <MglGeolocateControl position="bottom-right" />
      </MglMap>
    </div>
    <!--The next div contains information to show the current zoom level of the map. This will only show on the
          development version of the application. To find the code controlling this, search for 'zoom level display' -->
    <div id="zoom-level-div" />
    <HurricaneSelection
        @selectedNewHurricane="toggleHurricaneTrackVisibility()" />
    <CameraView />
    <div id="add-custom-icon">
      <button @click="addImageMarkers">Add Custom Markers</button>
    </div>
  </div>
</template>
<script>
    import LoadingScreen from './LoadingScreen';
    import InternetExplorerPage from "./InternetExplorerPage";
    import QuestionControl from "./QuestionControl";
    import CameraView from "./CameraView";
    import HurricaneSelection from "./HurricaneSelection";

    import mapboxgl from "mapbox-gl";

    import allHurricaneData from "../assets/hurricaneTracks/allHurricaneData";

    import {
        MglMap,
        MglNavigationControl,
        MglGeolocateControl,
        MglFullscreenControl,
        MglScaleControl,
        MglAttributionControl,
    } from "vue-mapbox";
    import mapStyles from "../assets/mapStyles/mapStyles";
    import { faPooStorm } from '@fortawesome/free-solid-svg-icons';

    export default {
        name: "MapBox",
        components: {
            LoadingScreen,
            InternetExplorerPage,
            MglMap,
            MglNavigationControl,
            MglGeolocateControl,
            MglFullscreenControl,
            MglScaleControl,
            MglAttributionControl,
            QuestionControl,
            CameraView,
            HurricaneSelection
        },
        props: {
            isInternetExplorer: {
                type: Boolean,
                required: true,
                default: false
            }
        },
        data() {
            return {
                title: process.env.VUE_APP_TITLE,
                titleSuffix: process.env.VUE_APP_TITLE_SUFFIX,
                developmentTier: process.env.VUE_APP_TIER,
                mapStyle: mapStyles.style,
                container: "map",
                zoom: 2,
                minZoom: 2,
                maxZoom: 22,
                center: [-95.7129, 37.0902],
                pitch: 60, // tips the map from 0 to 60 degrees
                bearing: 0, // starting rotation of the map from 0 to 360
                isLoading: true
            };
        },
        created() {
           this.map = null; // Once the map is loaded, this will allow us to access the map object in other methods
        },
        computed: {
            getCoordinatesForSelectedHurricane() {
                return this.$store.getters.getCoordinatesForSelectedHurricane;
            },
            getDataForSelectedHurricane() {
                return this.$store.getters.getDataForSelectedHurricane;
            }
        },
        methods: {
            addHurricaneTracksToMap(map) {
                let hslHues = this.getColorForTrack();

                allHurricaneData.hurricanes.features.forEach(function(feature, index) {
                    let color = 'hsl('+ hslHues[index] + ', 100%, 51%)';
                    map.addSource(feature.properties.id, {
                        "type": "geojson",
                        "data": feature.properties
                    });

                    let hurricaneTrackStyle = {
                        'id': feature.properties.id,
                        'type': 'line',
                        'source': feature.properties.id,
                        'layout': {
                            'visibility': 'visible',
                        },
                        'paint': {
                            'line-color': color,
                            'line-width': {
                                'base': 1.55,
                                'stops': [
                                    [0, 4],
                                    [20, 8]
                                ]
                            }
                        }
                    };

                    map.addLayer(hurricaneTrackStyle);
                })
            },
            findCorrectColorForStormType(stormType) {
                const stormIconStyles = {
                    'low pressure system':['#BEE500',process.env.VUE_APP_STORM_ICON_INTENSITY_1],
                    'non-tropical Disturbance':['#BED300',process.env.VUE_APP_STORM_ICON_INTENSITY_1],
                    'Tropical Wave':['#BEC200', process.env.VUE_APP_STORM_ICON_INTENSITY_1],
                    'Subtropical depression':['#BE8E00', process.env.VUE_APP_STORM_ICON_INTENSITY_3],
                    'Tropical Depression': ['#BE7D00', process.env.VUE_APP_STORM_ICON_INTENSITY_3],
                    'Tropical Storm':['#BE6B00', process.env.VUE_APP_STORM_ICON_INTENSITY_4],
                    'Extratropical cyclone':['#BE6B00', process.env.VUE_APP_STORM_ICON_INTENSITY_4],
                    'Subtropical storm':['#BE6B00', process.env.VUE_APP_STORM_ICON_INTENSITY_4],
                    'Hurricane1':['#BE4900', process.env.VUE_APP_HURRICANE_ICON_INTENSITY_1],
                    'Hurricane2':['#BE3700', process.env.VUE_APP_HURRICANE_ICON_INTENSITY_2],
                    'Hurricane3':['#BE2600', process.env.VUE_APP_HURRICANE_ICON_INTENSITY_3],
                    'Hurricane4':['#BE1500', process.env.VUE_APP_HURRICANE_ICON_INTENSITY_4],
                    'Hurricane5':['#BF0400', process.env.VUE_APP_HURRICANE_ICON_INTENSITY_5],
                    'default':['#080808', process.env.VUE_APP_STORM_ICON_INTENSITY_1]
                };

                return (stormIconStyles[stormType] || stormIconStyles['default']);
            },
            addImageMarkers() {
                let map = this.map;
                let self = this;
                // remove any markers for the map
                let customImageMarkers = document.querySelectorAll('.custom-image-marker');
                customImageMarkers.forEach(function(customImageMarker) {
                    customImageMarker.parentNode.removeChild(customImageMarker)
                });

                let hurricaneData = this.getDataForSelectedHurricane;
                hurricaneData.features.forEach(function(feature){
                    let stormType = feature.properties.STORMTYPE;
                    let stormTypeCoordinateSets = null;
                    stormTypeCoordinateSets = feature.geometry.coordinates;

                    stormTypeCoordinateSets.forEach(function(stormTypeCoordinateSet){
                        let stormIconStyles = self.findCorrectColorForStormType(stormType);
                        let customMarkerDiv = document.createElement('div');
                        customMarkerDiv.className = 'custom-image-marker';
                        customMarkerDiv.style.backgroundImage ='url(' + stormIconStyles[1] + ')';

                        customMarkerDiv.style.backgroundColor = stormIconStyles[0];

                        customMarkerDiv.style.width = '40px';
                        customMarkerDiv.style.height = '40px';
                        customMarkerDiv.style.borderRadius = '10px';

                        let popup = new mapboxgl.Popup({
                                    closeOnClick: false,
                                    closeButton: false
                                }
                        );
                        popup.setText('test')

                        stormTypeCoordinateSet.forEach(function(coordinates){
                            new mapboxgl.Marker(customMarkerDiv)
                                    .setLngLat(stormTypeCoordinateSet)
                                    .setPopup(popup)
                                    .addTo(map);
                        });
                    });
                });
            },
            getColorForTrack() {
                // Next we need to generate a list of colors based on the number of hurricanes we have.
                // We will use HSL colors in the format hsl((hue, saturation, lightness).
                // We will only adjust the hue. The 'hue' range is from 0-360, but we want to stay out the red
                // range so will only use 45-290. We will use 45 and 290 as our start and end, then we will
                // select additional points as needed based on the number of providers.
                let hslHues = [];
                let hslStartPoint = 45;
                let hslEndPoint = 290;
                let hslRange = hslEndPoint - hslStartPoint;
                let hslRangeDivisor = allHurricaneData.hurricanes.features.length - 1;
                let countToNextHslPoint = Math.floor(hslRange/hslRangeDivisor);
                // Add the start point to our array of hsl color points.
                hslHues.push(hslStartPoint);
                if (allHurricaneData.hurricanes.features.length > 2) {
                    let hslIntermediatePoint = hslStartPoint + countToNextHslPoint;
                    // If there is more than one intermediate hsl point, loop to add; otherwise just add the one.
                    if (hslRangeDivisor > 2) {
                        for(let index = 0; index < hslRangeDivisor-1; index++) {
                            hslHues.push(hslIntermediatePoint);
                            hslIntermediatePoint = hslIntermediatePoint + countToNextHslPoint;
                        }
                    } else {
                        hslHues.push(hslIntermediatePoint);
                    }
                }
                // Add the hsl end point
                hslHues.push(hslEndPoint);

                return hslHues;
            },
            toggleHurricaneTrackVisibility() {
                console.log('gonna do some toggling here')
            },
            addZoomLevelIndicator() {
                document.getElementById("zoom-level-div").innerHTML = 'Current Zoom Level (listed for development purposes): ' + this.map.getZoom() ;
            },
            onMapLoaded(event) {
                this.map = event.map; // This gives us access to the map as an object but only after the map has loaded.
                this.map.resize(); // This cures the mysterious whitespace that appears above the footer caused by the 'official' banner at the top.
                this.map.touchZoomRotate.enable({ around: 'center' }); // Add pinch to zoom for touch devices.
                this.map.touchZoomRotate.disableRotation(); // Disable the rotation functionality, but keep pinch to zoom.
                this.map.fitBounds([[-125.3321, 23.8991], [-65.7421, 49.4325]]); // Once map is loaded, zoom in a bit more so that the map neatly fills the screen.
                this.$store.map = this.map; // Add the map to the Vuex store so that we can use it in other components.
                // Pause the code here to make sure the fitbounds has time to finish before fade away of loading screen.
                setTimeout(() => { this.isLoading = false; }, 200);
                // Add the current zoom level display. The zoom level should only show in 'development' versions of the application.
                process.env.VUE_APP_ADD_ZOOM_LEVEL_DISPLAY === 'true' ? this.map.on("zoomend", this.addZoomLevelIndicator) : null;

                this.addHurricaneTracksToMap(this.map);
            }
        }
    };
</script>

<style scoped lang="scss">
  @import "~mapbox-gl/dist/mapbox-gl.css";
  $color: #fff;
  $blue: #4574a3;
  $border: 1px solid #fff;
  $borderGray: 1px solid rgb(100, 100, 100);

  #overlay {
    position: fixed; /* Sit on top of the page content */
    display: none; /* Hidden by default */
    width: 100%; /* Full width (cover the whole page) */
    height: 100%; /* Full height (cover the whole page) */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5); /* Black background with opacity */
    z-index: 2; /* Specify a stack order in case you're using a different order for other elements */
    cursor: pointer; /* Add a pointer on hover */
  }

  .usa-prose {
    border-bottom: $borderGray;
    display: flex;
    h1 {
      font-size: 1rem;
      margin-left: 10px;
      flex: 1;
    }
    a{
      margin: 0;
      display: block;
    }
  }

  .title-text {
    margin-left: 1.5rem;
    padding: 0.25rem;
  }

  #mapContainer {
    position: relative;
    height: 80vh;
    min-height: 550px;
    display: flex;
    flex-direction: column;
  }

  #add-custom-icon {
    display: flex;
    button {
      flex: 1;
    }
  }

  @media screen and (min-width: 600px) and (min-height: 850px) {
    #viz_container {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    #mapContainer {
      flex: 1;
      height: auto;
    }
  }
</style>


