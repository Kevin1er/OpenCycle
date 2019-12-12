<template>
  <div class="map">
    <b-input-group class="searchbar">
      <b-input-group-prepend>
        <b-button variant="primary" @click="isOverlayOn = !isOverlayOn"
          >M</b-button
        >
      </b-input-group-prepend>
      <b-form-input v-model="text" placeholder="Search on OpenCycles ..." />
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
      map: null,
      resMarkers: [],
      resMarker: null,
      url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      text: "",
      icon: L.icon({
        iconUrl: "images/icon50.png",
        iconSize: [50, 50],
        iconAnchor: [25, 50]
      }),
      iconR: L.icon({
        iconUrl: "images/rest.png",
        iconSize: [30, 50],
        iconAnchor: [25, 50]
      }),
      selectedIcon: L.icon({
        iconUrl: "images/iconselected50.png",
        iconSize: [50, 50],
        iconAnchor: [25, 50]
      }),
      markers: new MarkerClusterGroup(),
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
          this.addRestaurants([
            this.selectedStation.lng,
            this.selectedStation.lat
          ]);
          event.target.setIcon(this.selectedIcon);
        });
        this.markers.addLayer(marker);
      });
      this.map.addLayer(this.markers);
    },
    addRestaurants: function(point) {
      if (Array.isArray(this.resMarkers) && this.resMarkers.length > 0) {
        this.resMarkers.forEach(marker => {
          this.map.removeLayer(marker);
        });
        this.resMarkers = [];
      } else {
        this.wikibase = new Wikibase("https://query.wikidata.org/sparql");
        var query =
          `SELECT ?place ?placeLabel ?image ?coordinate_location ?dist ?instance_of ?instance_ofLabel WHERE {
  SERVICE wikibase:around {
    ?place wdt:P625 ?coordinate_location.
    bd:serviceParam wikibase:center "Point(` +
          point[0] +
          " " +
          point[1] +
          `)"^^geo:wktLiteral .
    bd:serviceParam wikibase:radius "1".
    bd:serviceParam wikibase:distance ?dist.
  }
  ?place wdt:P31 wd:Q11707.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  OPTIONAL { ?place wdt:P18 ?image. }
  OPTIONAL { ?place wdt:P31 ?instance_of. }
}`;
        var result = this.wikibase.query(query);
        result.then(data => {
          var resData = data.results.bindings;
          resData.forEach(restaurant => {
            var value = restaurant.coordinate_location.value;
            var coordinates = value
              .match("(\\d)+\\.(\\d+) (\\d)+\\.(\\d+)")[0]
              .split(" ");
            this.resMarker = null;
            this.resMarker = L.marker(
              [parseFloat(coordinates[1]), parseFloat(coordinates[0])],
              {
                icon: this.iconR
              }
            );
            this.resMarkers.push(this.resMarker);
            this.markers.addLayer(this.resMarker);
          });
          this.map.addLayer(this.markers);
        });
      }
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
