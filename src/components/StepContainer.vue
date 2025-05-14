<template>
  <div class="q-mx-xs">
    <q-carousel
      v-model="slide"
      transition-prev="slide-down"
      transition-next="slide-up"
      swipeable
      animated
      control-color="primary"
      padding
      height="auto"
      class="bg-white-4 text-black"
    >

      <q-carousel-slide name="1" class="column items-top justify-center q-pa-none">
        <div class="">
          <DemograficosComponent />
        </div>
      </q-carousel-slide>

      <q-carousel-slide name="2" class="column items-top justify-center q-pa-none">        
        <div class="text-center">
          <ResultLaboratorio />
        </div>
      </q-carousel-slide>

      <q-carousel-slide name="3" class="column items-top justify-center q-pa-none">        
        <div class="text-center">
          <LevantamentoArv />
        </div>
      </q-carousel-slide>

      <q-carousel-slide name="4" class="column items-top justify-center q-pa-none">        
        <div class="text-center">
          <InicioTARV />
        </div>
      </q-carousel-slide>

      <q-carousel-slide name="5" class="column items-top justify-center q-pa-none">        
        <div class="text-center">
          <ConsultaClinica />
        </div>
      </q-carousel-slide>

      <q-carousel-slide name="6" class="column items-top justify-center q-pa-none">        
        <div class="text-center">
          <ProfilaxiasComponent />
        </div>
      </q-carousel-slide>

      <q-carousel-slide name="7" class="column items-top justify-center q-pa-none">        
        <div class="text-center">
          <RastreioCACUM />
        </div>
      </q-carousel-slide>

      <q-carousel-slide name="8" class="column items-top justify-center q-pa-none">        
        <div class="text-center">
          <ConfidenteComponent />
        </div>
      </q-carousel-slide>

    </q-carousel>
    <div class="row justify-center q-mt-sm">
      <q-btn-toggle
        glossy
        v-model="slide"
        :options="[
          { label: 1, value: '1' },
          { label: 2, value: '2' },
          { label: 3, value: '3' },
          { label: 4, value: '4' },
          { label: 5, value: '5' },
          { label: 6, value: '6' },
          { label: 7, value: '7' },
          { label: 8, value: '8' },
        ]"
      ></q-btn-toggle>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DemograficosComponent from './steps/DemograficosComponent.vue';
import ResultLaboratorio from './steps/ResultLaboratorio.vue';
import LevantamentoArv from './steps/LevantamentoArv.vue';
import InicioTARV from './steps/InicioTARV.vue';
import ConsultaClinica from './steps/ConsultaClinica.vue';
import ProfilaxiasComponent from './steps/ProfilaxiasComponent.vue';
import RastreioCACUM from './steps/RastreioCACUM.vue';
import ConfidenteComponent from './steps/ConfidenteComponent.vue';

const slide = ref("1")

</script>

<style scoped>
/* Ajustes de estilo se necessário */
</style>
