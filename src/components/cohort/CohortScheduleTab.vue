<template>
  <div class="q-pa-none">
    <q-card flat bordered class="bg-white">
      <q-card-section class="q-pa-none">
        <q-banner dense inline-actions class="text-primary bg-grey-3  q-pa-none q-px-md q-py-xs">
          <span class="text-weight-medium">Carregar Lista de Utentes para Seguimento Comunitário</span>
        </q-banner>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <p class="text-caption">
          Selecione o grupo de pessoas do seu interesse, para carregar o ficheiro da coorte ou executar tarefas relacionadas.
        </p>

        <div class="row q-col-gutter-md items-center">
          <q-select
            v-model="selectedProgram"
            :options="programs"
            class="col-3"
            label="Selecione o programa"
            dense
            outlined
            />
            <q-select
            v-model="selectedService"
            :options="services"
            label="Selecione o serviço"
            class="col-3"
            dense
            outlined
            />
            <q-select
            v-model="selectedGroup"
            :options="groups"
            label="Selecione o grupo"
            class="col-3"
            dense
            outlined
            />

        </div>
      </q-card-section>
      <q-card-section>
        <q-table
          :rows="cohorts"
          :columns="columns"
          row-key="name"
          flat
          bordered
          dense
          table-header-class="bg-grey-3 text-black"
        >

          <template #body-cell-config="props">
            <q-td align="center">
              <q-btn flat round icon="settings" color="primary" @click="openConfig(props.row)" />
            </q-td>
          </template>

          <template #body-cell-assign="props">
            <q-td align="center">
              <q-btn flat round icon="place" color="amber-9" @click="assignCohort(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <CohortConfigModal
    v-model="configDialog"
    :cohort="selectedCohort"
    :uploads="cohortUploads"
    @save="saveConfig"
  />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CohortConfigModal from 'components/cohort/CohortConfigModal.vue'

const selectedProgram = ref(null)
const selectedService = ref(null)
const selectedGroup = ref(null)

const programs = ['HIV', 'TB', 'Malária']
const services = ['Visita Domiciliária', 'ATS', 'Consulta', 'Triagem', 'Atendimento Psicossocial']
const groups = ['Gestantes', 'Crianças', 'Homens', 'Adolescentes e Jovens']

const columns = [
  { name: 'name', label: 'Coortes', field: 'name', align: 'left' },
  { name: 'lastUpload', label: 'Último carreg.', field: 'lastUpload', align: 'center' },
  { name: 'schedule', label: 'Agendamento', field: 'schedule', align: 'left' },
  { name: 'config', label: 'Config.', field: 'config', align: 'center' },
  { name: 'assign', label: 'Alocar', field: 'assign', align: 'center' }
]

const cohorts = ref([
  { name: 'PF reintegração e casos especiais Pediatria-MM', schedule: 'Todas segundas', lastUpload: '21/04/2024' },
  { name: 'PF reintegração e casos especiais MGL-MM', schedule: 'Manual', lastUpload: '30/04/2025' },
  { name: 'PF preventiva MGL-MM', schedule: 'Dia 1 mensal', lastUpload: '' },
  { name: 'PF preventiva SAAJ – JM', schedule: '', lastUpload: '' },
  { name: 'PF CPN', schedule: 'Todas Terças', lastUpload: '22/04/2024' },
  { name: 'PF Malária', schedule: 'Dia 1 mensal', lastUpload: '' },
  { name: 'PF TB', schedule: 'Todas segundas', lastUpload: '' }
])


const configDialog = ref(false)
const selectedCohort = ref(null)
const cohortUploads = ref([])

function openConfig(row) {
  selectedCohort.value = row
  configDialog.value = true
  cohortUploads.value = [
    {
      filename: 'upload1.xlsx',
      uploadedAt: '2024-05-01 10:00',
      allocationStart: '2024-05-01',
      allocationEnd: '2024-05-31'
    },
    {
      filename: 'upload2.xlsx',
      uploadedAt: '2024-05-10 11:22',
      allocationStart: '',
      allocationEnd: ''
    }
  ]
}

function saveConfig(updatedRows) {
  console.log('Save allocation config for:', selectedCohort.value.name)
  console.table(updatedRows)
}

function assignCohort(row) {
  console.log('Assign cohort to focal point:', row.name)
}

</script>
