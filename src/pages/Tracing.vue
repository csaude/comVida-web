<template>
  <div class="tracing-page">
    <div id="map" class="map"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'

onMounted(() => {
  new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM()
      })
    ],
    view: new View({
      center: [35.529562, -18.665695], // Mozambique center
      zoom: 6,
      projection: 'EPSG:4326'
    })
  })
})
</script>

<style scoped>
.tracing-page {
  padding: 2rem;
  text-align: center;
}

.map {
  height: 500px;
  width: 100%;
  margin-top: 2rem;
  border: 1px solid #ccc;
}
</style>
