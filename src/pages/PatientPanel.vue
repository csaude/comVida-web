<template>
  <q-page class="bg-grey-2">
    <!-- Demographic Info -->
    <PatientDemographicDetails v-if="activeTab === 'demographics'" />

    <!-- Clinic Info -->
    <PatientClinicDetails v-if="activeTab === 'clinic'" />

    <!-- Bottom Nav -->
     <BottomNavigation @navigate="handleTabChange"/>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import PatientDemographicDetails from 'src/components/patient/PatientDemographicDetails.vue';
import PatientClinicDetails from 'src/components/patient/PatientClinicDetails.vue';
import BottomNavigation from 'src/components/navigation/BottomNavigation.vue';

const activeTab = ref('demographics');

function handleTabChange(tab) {
  activeTab.value = tab;
}
</script>

<style scoped>
</style>
