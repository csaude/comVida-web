<template>
  <div>
    <q-card flat bordered class="q-mb-md q-pa-none">
      <q-card-section class="q-pa-none">
        <q-banner
          dense
          inline-actions
          class="text-primary bg-grey-3 q-pa-none q-px-md q-py-xs"
        >
          <span class="text-weight-medium">
            Carregar Lista de Utentes para Seguimento Comunitário
          </span>
        </q-banner>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="text-caption text-grey-6 q-mb-md">
          Selecione o grupo de pessoas do seu interesse, para carregar o
          ficheiro da coorte ou executar tarefas relacionadas.
        </div>

        <div class="row q-col-gutter-md items-center">
          <div class="col-6">
            <q-select
              v-model="selectedProgram"
              :options="programOptions"
              option-label="name"
              option-value="id"
              label="Programa"
              dense
              outlined
            />
          </div>
          <div class="col-6">
            <q-select
              v-model="selectedService"
              :options="serviceOptions"
              option-label="label"
              option-value="value"
              label="Serviço"
              dense
              outlined
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <EditableTable
          :title="'Coortes Disponíveis'"
          :columns="columns"
          v-model="rows"
          :pagination="pagination"
          :loading="cohortStore.loading"
          :rows-per-page-options="[10, 20, 50]"
          @extra-action="onExtraAction"
          @update:pagination="handlePaginationChange"
          :hide-search-input="true"
          :hide-search-button="true"
          hide-toggle-status
          :hide-add-button="true"
          hide-edit
          hide-delete
          :extra-actions="extraActions"
        />
      </q-card-section>
    </q-card>

    <CohortScheduleModal
      v-model="scheduleDialog"
      :cohort="selectedCohort"
      :inclusion="inclusionDate"
      :exclusion="exclusionDate"
      :model-value="scheduleDialog"
      @schedule-cohort="saveSchedule"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useProgramStore } from 'src/stores/program/ProgramStore'
import { useProgramActivityStore } from 'src/stores/programActivity/ProgramActivityStore'
import { useCohortStore } from 'src/stores/cohort/useCohortStore'
import { useRouter } from 'vue-router'
import CohortScheduleModal from './CohortScheduleModal.vue'

const scheduleDialog = ref(false)

const inclusionDate = ref('')
const exclusionDate = ref('')

function openSchedule(row) {
  selectedCohort.value = row
  inclusionDate.value = row.inclusionDate || ''
  exclusionDate.value = row.exclusionDate || ''
  scheduleDialog.value = true
}

function saveSchedule({ inclusionDate: inc, exclusionDate: exc }) {
  // Aqui você pode fazer uma chamada à API ou atualizar o store
  console.log('Agendamento salvo para:', selectedCohort.value.name)
  console.log('Início:', inc, 'Fim:', exc)

  // Simule atualização da coorte
  selectedCohort.value.inclusionDate = inc
  selectedCohort.value.exclusionDate = exc
  scheduleDialog.value = false
}

const router = useRouter()

const programStore = useProgramStore()
const activityStore = useProgramActivityStore()
const cohortStore = useCohortStore()

const selectedProgram = ref(null)
const selectedService = ref(null)

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const programOptions = computed(() => programStore.currentPagePrograms)

const serviceOptions = computed(() => {
  if (!selectedProgram.value) return []
  const currentActivities =
    activityStore.activitiesPages[activityStore.pagination.currentPage] || []
  return currentActivities
    .filter((act) => act.program.id === selectedProgram.value.id)
    .map((act) => ({ label: act.name, value: act.id }))
})

const rows = ref([])

// const columns = [
//   { name: 'name', label: 'Coorte', field: 'name', align: 'left' },
//   {
//     name: 'uploadDate',
//     label: 'Data Carregamento',
//     field: 'uploadDate',
//     align: 'center',
//   },
//   {
//     name: 'inclusionDate',
//     label: 'Data Início',
//     field: 'inclusionDate',
//     align: 'center',
//   },
//   {
//     name: 'exclusionDate',
//     label: 'Data Fim',
//     field: 'exclusionDate',
//     align: 'center',
//   },
//   {
//     name: 'actions',
//     label: 'Ações',
//     field: 'id',
//     align: 'center',
//     sortable: false,
//   },
// ]

const columns = [
  { name: 'name', label: 'Coorte', field: 'name', align: 'left' },
  {
    name: 'memberCreatedAt',
    label: 'Data Carregamento',
    field: 'memberCreatedAt',
    align: 'center',
    format: (val) => {
      if (!val) return '-'
      const d = new Date(val)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}-${month}-${year}`
    },
  },
  {
    name: 'inclusionDate',
    label: 'Data Início',
    field: 'inclusionDate',
    align: 'center',
    format: (val) => {
      if (!val) return '-'
      const d = new Date(val)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}-${month}-${year}`
    },
  },
  {
    name: 'exclusionDate',
    label: 'Data Fim',
    field: 'exclusionDate',
    align: 'center',
    format: (val) => {
      if (!val) return '-'
      const d = new Date(val)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}-${month}-${year}`
    },
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'id',
    align: 'center',
    sortable: false,
  },
]

const extraActions = [
  {
    icon: 'event',
    color: 'primary',
    tooltip: 'Agendar Coorte',
    emit: 'schedule-cohort',
  },
  {
    icon: 'visibility',
    color: 'teal',
    tooltip: 'Visualizar membros',
    emit: 'view-members',
  },
]

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
      allocationEnd: '2024-05-31',
    },
    {
      filename: 'upload2.xlsx',
      uploadedAt: '2024-05-10 11:22',
      allocationStart: '',
      allocationEnd: '',
    },
  ]
}

function viewMembers(row) {
  router.push({ name: 'cohort-members', params: { cohortId: row.id } })
}

function saveConfig(updatedRows) {
  console.log('Salvar config para:', selectedCohort.value.name)
  console.table(updatedRows)
}

function handlePaginationChange(newPagination) {
  pagination.value.page = newPagination.page
  pagination.value.rowsPerPage = newPagination.rowsPerPage
  fetchCohorts()
}

async function fetchCohorts() {
  const result = await cohortStore.cohortsWithMembers({
    page: pagination.value.page - 1,
    size: pagination.value.rowsPerPage,
    programActivityId: selectedService.value?.value,
  })

  rows.value = cohortStore.currentPageCohorts
  pagination.value.rowsNumber = cohortStore.pagination.totalSize
}

watch(selectedProgram, () => {
  selectedService.value = null
})

watch(selectedService, () => {
  pagination.value.page = 1
  fetchCohorts()
})

onMounted(async () => {
  if (!programStore.currentPagePrograms.length) {
    await programStore.fetchPrograms()
  }

  if (!activityStore.currentPageActivities.length) {
    await activityStore.fetchActivities({ page: 0, size: 100 })
  }

  fetchCohorts()
})

// Captura os eventos emitidos pelo EditableTable
function onExtraAction({ action, row }) {
  if (action === 'open-config') openConfig(row)
  if (action === 'view-members') viewMembers(row)
  if (action === 'schedule-cohort') openSchedule(row)
}
</script>
