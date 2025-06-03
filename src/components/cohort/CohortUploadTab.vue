<template>
  <div>
    <q-card flat bordered class="q-mb-md q-pa-none">
      <q-card-section class="q-pa-none">
        <q-banner dense inline-actions class="text-primary bg-grey-3  q-pa-none q-px-md q-py-xs">
          <span class="text-weight-medium">Carregar Lista de Utentes para Seguimento Comunitário</span>
        </q-banner>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="text-caption text-grey-6 q-mb-md">
          Selecione o programa, serviço e grupo para carregar a lista de utentes.
        </div>
         <div class="row q-col-gutter-md q-mb-md items-center">
            <q-select
                v-model="selectedProgram"
                :options="programs"
                label="Programa"
                class="col-3"
                dense
                outlined
                />

                <q-select
                v-model="selectedService"
                :options="services"
                label="Serviço"
                class="col-3"
                dense
                outlined
                />

                <q-select
                v-model="selectedSystem"
                :options="systems"
                label="Sistema Fonte"
                class="col-4"
                dense
                outlined
            />
            </div>
        <div class="text-subtitle1">Carregar Lista de Utentes</div>
        <q-file
          v-model="file"
          label="Selecionar ficheiro Excel"
          accept=".xls,.xlsx"
          outlined
        />

       

      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          label="Carregar"
          color="primary"
          :disable="!file"
          class="q-mb-md"
          @click="uploadList"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedProgram = ref(null)
const selectedService = ref(null)
const selectedGroup = ref(null)
const file = ref(null)
const selectedCohort = ref(null)
const cohorts = [
  { label: 'Coorte A', value: 'cohort-a' },
  { label: 'Coorte B', value: 'cohort-b' },
  { label: 'Coorte C', value: 'cohort-c' }
]

const programs = ['HIV', 'TB', 'Malária']
const services = ['Visita Domiciliária', 'ATS', 'Consulta']
const groups = ['Gestantes', 'Crianças', 'Homens', 'Adolescentes e Jovens']

const selectedSystem = ref(null)
const systems = ['OpenMRS', 'DHIS2', 'SISMA', 'Outro']

const allocationStart = ref('')
const allocationEnd = ref('')

function uploadList() {
  console.log('Uploading:', {
    file: file.value,
    program: selectedProgram.value,
    service: selectedService.value,
    group: selectedGroup.value
  })

  // TODO: Implement actual upload logic
}
</script>
