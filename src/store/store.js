import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        dataForSelectedHurricane: null,
        coordinatesForSelectedHurricane: null
    },
    mutations: {
        mutateDataForSelectedHurricane(state, payload) {
            state.dataForSelectedHurricane = payload;
        },
        mutateCoordinatesForSelectedHurricane(state, payload) {
            state.coordinatesForSelectedHurricane = payload;
        }
    },
    actions: {
        changeDataForSelectedHurricane(state, payload) {
            state.commit('mutateDataForSelectedHurricane', payload)
        },
        changeCoordinatesForSelectedHurricane(state, payload) {
            state.commit('mutateCoordinatesForSelectedHurricane', payload)
        }
    },
    getters: {
        getDataForSelectedHurricane(state) {
            return state.dataForSelectedHurricane;
        },
        getCoordinatesForSelectedHurricane(state) {
            return state.coordinatesForSelectedHurricane;
        }
    }
});
