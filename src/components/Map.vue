<template>
  <div class="map">
    <l-map ref="map">
      <l-tile-layer :url="url" :noWrap="true" />
    </l-map>
  </div>
</template>

<style scoped>
.map {
  height: 100%;
  width: 100%;
}
</style>

<script>
import { LMap, LTileLayer } from "vue2-leaflet";
import "leaflet/dist/leaflet.css";

export default {
  name: "Map",
  props: {
    msg: String
  },
  components: {
    LMap,
    LTileLayer
  },
  data() {
    return {
      url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    };
  },
  async mounted() {
    this.map = this.$refs.map.mapObject;
  }
};
</script>
