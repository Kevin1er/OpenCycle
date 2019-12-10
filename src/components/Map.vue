<template>
  <div class="map">
    <b-input-group class="searchbar">
      <b-input-group-prepend>
        <b-button variant="primary" @click="isOverlayOn = !isOverlayOn"
          >M</b-button
        >
      </b-input-group-prepend>
      <b-form-input
        v-model="text"
        placeholder="Search on OpenCycles ..."
      ></b-form-input>
    </b-input-group>
    <div v-if="isOverlayOn" class="overlay">
      <b-card
        v-if="selectedStation"
        :title="selectedStation.name"
        :sub-title="selectedStation.address + ', ' + selectedStation.city"
      >
        <b-card-text>
          Avialables bikes :
          {{ selectedStation.available_bikes }}
        </b-card-text>
        <b-card-text>
          Avialables stands :
          {{ selectedStation.available_bike_stands }}
        </b-card-text>
        <b-card-text>
          Number of stands :
          {{ selectedStation.nb_bike_stands }}
        </b-card-text>
        <b-card-text
          >last update :
          {{ this.toDate(selectedStation.last_update) }}</b-card-text
        >
      </b-card>
    </div>
    <div id="map"></div>
  </div>
</template>

<style scoped>
#map {
  height: 100vh;
  width: 100%;
  max-width: 100%;
}
.searchbar {
  position: absolute;
  width: 390px;
  z-index: 1000;
  top: 10px;
  left: 10px;
  padding: 20px;
}
.overlay {
  width: 410px;
  height: 100vh;
  position: absolute;
  z-index: 999;
  background-color: #f5f5f5;
  padding-top: 100px;
  text-align: left;
}
.btn-overlay-close {
  position: absolute;
  top: 20px;
  left: calc(100% - 10px);
}
</style>

<script>
import * as moment from "moment";
import Wikibase from "../services/wikidata";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { MarkerClusterGroup } from "leaflet.markercluster";

export default {
  name: "Map",
  props: {
    msg: String
  },
  data() {
    return {
      url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      text: "",
      icon: L.icon({
        iconUrl: "images/icon50.png",
        iconSize: [50, 50],
        iconAnchor: [25, 50]
      }),
      selectedIcon: L.icon({
        iconUrl: "images/iconselected50.png",
        iconSize: [50, 50],
        iconAnchor: [25, 50]
      }),
      markers: null,
      isOverlayOn: false,
      selectedStation: null
    };
  },
  computed: {
    stations: function() {
      return this.$store.getters["stardog/stations"];
    }
  },
  methods: {
    addMarkers: function(list) {
      this.markers = new MarkerClusterGroup();
      list.forEach(station => {
        let marker = L.marker([station.lat, station.lng], {
          icon: this.icon,
          object: station
        });
        marker.on("click", event => {
          this.selectedStation = event.target.options.object;
          if (this.selectedMarker) {
            this.selectedMarker.setIcon(this.icon);
          }
          this.selectedMarker = event.target;
          this.isOverlayOn = true;
          this.map.setView(event.latlng);
          event.target.setIcon(this.selectedIcon);
        });
        this.markers.addLayer(marker);
      });
      this.map.addLayer(this.markers);
    },
    toDate: function(_timestamp) {
      return moment(_timestamp * 1000).format("DD-MM-YYYY, HH:mm:ss");
    }
  },
  watch: {
    stations: function(value) {
      this.addMarkers(value);
    }
  },
  async mounted() {
    this.wikibase = new Wikibase("https://query.wikidata.org/sparql");
    this.wikibase.query(`
    SELECT ?a ?b ?c WHERE {
      ?a ?b ?c .
    }
    LIMIT 10`);
    this.$store.dispatch("stardog/PULL_STATIONS", this.$stardog);
    this.map = L.map("map", { zoomControl: false }).setView(
      [46.6305787, 2.4554443],
      5
    );
    L.tileLayer(this.url, {
      maxZoom: 18
    }).addTo(this.map);

    this.addMarkers(this.stations);
  }
};
</script>
