<template>
  <div class="q-pa-none">
    <q-tabs
      v-model="tab"
      class="text-teal q-mx-md"
      dense
      active-color="primary"
      indicator-color="primary"
      align="left"
      narrow-indicator
    >
      <q-tab name="agendadas" label="Coortes Agendadas" />
      <q-tab name="listas" label="Carregamento de Listas" />
      <q-tab name="processamento" label="Processamento de Listas" />
    </q-tabs>

    <q-separator class="q-mx-md" />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="agendadas">
        <CohortScheduleTab />
      </q-tab-panel>
      <q-tab-panel name="listas">
        <CohortUploadTab @upload-success="tab = 'processamento'" />
      </q-tab-panel>
      <q-tab-panel name="processamento">
        <CohortProcessingStatus />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CohortScheduleTab from 'components/cohort/CohortScheduleTab.vue'
import CohortUploadTab from 'components/cohort/CohortUploadTab.vue'
import CohortProcessingStatus from 'components/cohort/CohortProcessingStatus.vue'

const tab = ref('agendadas')
</script>
