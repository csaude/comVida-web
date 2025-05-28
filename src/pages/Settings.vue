<template>
  <div class="settings-page q-pa-md bg-white">
    <q-tabs
      v-model="activeTab"
      class="text-primary q-px-md"
      active-color="primary"
      indicator-color="primary"
      align="left"
      dense
    >
      <q-tab name="programs" label="Programas" />
      <q-tab name="services" label="Serviços" />
      <q-tab name="groups" label="Grupos" />
      <q-tab name="cohorts" label="Coortes" />
      <q-tab name="systems" label="Sistemas" />
    </q-tabs>

    <q-separator class="q-mx-md" />

    <q-tab-panels v-model="activeTab" animated class="q-mt-md">
      <q-tab-panel name="programs">
        <ProgramSettings />
      </q-tab-panel>

      <q-tab-panel name="services">
        <ServiceSettings />
      </q-tab-panel>

      <q-tab-panel name="groups">
        <GroupSettings />
      </q-tab-panel>

      <q-tab-panel name="cohorts">
        <CohortSettings />
      </q-tab-panel>

      <q-tab-panel name="systems">
        <SystemSettings />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('programs')

import ProgramSettings from '../components/settings/ProgramSettings.vue'
import ServiceSettings from '../components/settings/ServiceSettings.vue'
import GroupSettings from '../components/settings/GroupSettings.vue'
import CohortSettings from '../components/settings/CohortSettings.vue'
import SystemSettings from '../components/settings/SystemSettings.vue'
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
}
</style>
