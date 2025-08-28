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
          <div class="col-4">
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
          <div class="col-4">
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
          <div class="col-4">
            <q-select
              v-model="selectedGroup"
              :options="groupOptions"
              option-label="name"
              option-value="id"
              label="Grupo"
              dense
              outlined
              :disable="!selectedService"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <EditableTable
          :title="'Listas Disponíveis'"
          :columns="columns"
          v-model="rows"
          :pagination="pagination"
          :loading="patientImportConfigurationStore.loading"
          :rows-per-page-options="[10, 20, 50]"
          @update:pagination="handlePaginationChange"
          :hide-search-input="true"
          :hide-search-button="true"
          hide-toggle-status
          :hide-add-button="true"
          hide-edit
          hide-delete
          :extra-actions="extraActions"
          @schedule-cohort="openSchedule"
          @view-memberss="viewMembers"
        />
      </q-card-section>
    </q-card>

    <q-dialog v-model="scheduleDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            Agendar Lista de Utentes para Seguimento Comunitário
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="inclusionDate"
            label="Data de Inclusão"
            dense
            outlined
            readonly
            :rules="[(val) => !!val || 'Obrigatório']"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="inclusionDate"
                    mask="DD-MM-YYYY"
                    color="primary"
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input
            v-model="exclusionDate"
            label="Data de Exclusão"
            dense
            outlined
            readonly
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="exclusionDate"
                    mask="DD-MM-YYYY"
                    color="primary"
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Salvar" @click="saveScheduleClick" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import { useProgramStore } from 'src/stores/program/ProgramStore'
import { useProgramActivityStore } from 'src/stores/programActivity/ProgramActivityStore'
import { usePatientImportConfigurationStore } from 'src/stores/patientImportFile/patientImportConfigurationStore'
import { useRouter } from 'vue-router'
import { DateUtils } from 'src/utils/DateUtils'
import { useGroupStore } from 'src/stores/group/groupStore'

const groupStore = useGroupStore()
const selectedGroup = ref(null)

const scheduleDialog = ref(false)

const inclusionDate = ref('')
const exclusionDate = ref('')
const selectedPatientImportConfiguration = ref(null)

const editFileId = inject('editFileId')
const editSourceSystemId = inject('editSourceSystemId')
const editProgramActivityId = inject('editProgramActivityId')

const groupOptions = computed(() => {
  if (!selectedService.value) return []
  const currentGroups =
    groupStore.groupsPages[groupStore.pagination.currentPage] || []
  return currentGroups.filter(
    (g) => g.programActivity.id === selectedService.value.value,
  )
})

function openSchedule(row) {
  inclusionDate.value = DateUtils.toISODate(row.entryDate)
  exclusionDate.value = DateUtils.toISODate(row.exitDate)
  selectedPatientImportConfiguration.value = row

  scheduleDialog.value = true
}

function saveSchedule({
  inclusionDate: inc,
  exclusionDate: exc,
  patientImportConfigurationId: id,
}) {
  selectedPatientImportConfiguration.value.inclusionDate = inc
  selectedPatientImportConfiguration.value.exclusionDate = exc
  scheduleDialog.value = false
}

const router = useRouter()

const programStore = useProgramStore()
const activityStore = useProgramActivityStore()
const patientImportConfigurationStore = usePatientImportConfigurationStore()

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

const columns = [
  {
    name: 'groupName',
    label: 'Grupo',
    field: 'groupName',
    align: 'left',
  },
  {
    name: 'cohortName',
    label: 'Lista',
    field: 'cohortName',
    align: 'left',
  },
  {
    name: 'programActivityName',
    label: 'Serviço',
    field: 'programActivityName',
    align: 'left',
  },
  {
    name: 'importFileName',
    label: 'Fonte',
    field: 'importFileName',
    align: 'left',
  },
  {
    name: 'createdAt',
    label: 'Data de Carregamento',
    field: 'CustumCreatedAt',
    align: 'left',
  },
  {
    name: 'entryDate',
    label: 'Data de Inclusão',
    field: 'entryDate',
    align: 'left',
  },
  {
    name: 'exitDate',
    label: 'Data de Saída',
    field: 'exitDate',
    align: 'left',
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
    tooltip: 'Agendar',
    emit: 'schedule-cohort',
  },
  {
    icon: 'visibility',
    color: 'teal',
    tooltip: 'Ver Membros',
    emit: 'view-memberss',
  },
]

async function saveScheduleClick() {
  if (!selectedPatientImportConfiguration.value) return

  try {
    const updated =
      await patientImportConfigurationStore.scheduleConfigurationDates({
        cohortId: selectedPatientImportConfiguration.value.cohort?.id,
        patientImportFileId:
          selectedPatientImportConfiguration.value.patientImportFile?.id,
        entryDate: inclusionDate.value,
        exitDate: exclusionDate.value,
      })

    // Atualiza localmente a linha da tabela
    // const index = rows.value.findIndex((r) => r.id === updated.id)
    // if (index !== -1) {
    //   rows.value[index].entryDate = updated.entryDate
    //   rows.value[index].exitDate = updated.exitDate
    // }

    scheduleDialog.value = false
  } catch (error) {
    console.error('Erro ao agendar datas:', error)
  }
}

function formatDate(val) {
  if (!val) return '-'
  const d = new Date(val)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

function viewMembers(row) {
  if (row?.cohortId) {
    router.push({
      name: 'CohortMembers',
      params: { cohortId: row.cohortId },
      query: { fileId: row.patientImportFile?.id, listName: row.cohortName },
    })
  } else {
    console.warn('Configuração inválida selecionada.')
  }
}

function handlePaginationChange(newPagination) {
  pagination.value.page = newPagination.page
  pagination.value.rowsPerPage = newPagination.rowsPerPage
  fetchConfigurations()
}

const rows = computed(() =>
  patientImportConfigurationStore.currentPagePatientImportConfigurations.map(
    (item) => ({
      ...item,
      cohortName: item.cohort?.name || '-',
      programActivityName: item.cohort?.programActivityName || '-',
      groupName: item?.cohort?.group?.name || '-',
      importFileName: item.patientImportFile?.name || '-',
      importFileId: item.patientImportFile?.id || null,
      cohortId: item.cohort?.id || null,
      CustumCreatedAt: DateUtils.formatDateToDDMMYYYY(item.createdAt),
      entryDate: item.entryDate
        ? DateUtils.formatDateToDDMMYYYY(item.entryDate)
        : '-',
      exitDate: item.exitDate
        ? DateUtils.formatDateToDDMMYYYY(item.exitDate)
        : '-',
    }),
  ),
)

async function fetchConfigurations() {
  await patientImportConfigurationStore.fetchConfigurations({
    page: pagination.value.page - 1,
    size: pagination.value.rowsPerPage,
    programActivityId: selectedService.value?.value,
    groupId: selectedGroup.value?.id || null,
  })

  pagination.value.rowsNumber =
    patientImportConfigurationStore.pagination.totalSize
}

watch(selectedProgram, () => {
  selectedService.value = null
})

watch(selectedService, async () => {
  selectedGroup.value = null
  if (selectedService.value) {
    await groupStore.fetchGroups({
      page: 0,
      size: 100,
      programActivityId: selectedService.value.value,
    })
    fetchConfigurations()
  }
})

watch(selectedService, () => {
  pagination.value.page = 1
  fetchConfigurations()
})

onMounted(async () => {
  editFileId.value = ''
  editSourceSystemId.value = ''
  editProgramActivityId.value = ''

  console.log(
    'Mounted CohortScheduleTab: ',
    patientImportConfigurationStore.currentPagePatientImportConfigurations,
  )

  if (!programStore.currentPagePrograms.length) {
    await programStore.fetchPrograms()
  }

  if (!activityStore.currentPageActivities.length) {
    await activityStore.fetchActivities({ page: 0, size: 100 })
  }

  fetchConfigurations()
})
</script>
