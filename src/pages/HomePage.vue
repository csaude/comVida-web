<template>
  <q-page class="home-page">
    <component :is="selectedComponent" />
  </q-page>
</template>

<script setup>
  import { computed } from 'vue';
  import CohortMemberDashboard from 'src/components/cohort/CohortMemberListDashboard.vue';
  import AboutPage from 'src/components/home/AboutPage.vue';
  //import SettingsPage from 'src/components/home/SettingsPage.vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();
    // **Map query parameter to the actual component**
  const componentMap = {
        CohortMemberDashboard,
        AboutPage,
        //SettingsPage
    };
  // Compute the active component from the route query
  const selectedComponent = computed(() => componentMap[route.query.component] || CohortMemberDashboard);
</script>

<style scoped>
</style>
