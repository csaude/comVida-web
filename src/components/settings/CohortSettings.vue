<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useCohortStore } from 'src/stores/cohort/useCohortStore'
import { useProgramActivityStore } from 'src/stores/programActivity/ProgramActivityStore'
import { useProgramStore } from 'src/stores/program/ProgramStore'
import { useApiErrorHandler } from 'src/composables/shared/error/useApiErrorHandler'
import { useSwal } from 'src/composables/shared/dialog/dialog'

const { handleApiError } = useApiErrorHandler()
const { alertWarningAction, alertError } = useSwal()

const cohortStore = useCohortStore()
const activityStore = useProgramActivityStore()
const programStore = useProgramStore()

const nameFilter = ref('')

const cohorts = computed({
  get: () => {
    return cohortStore.currentPageCohorts.map(cohort => ({
      ...cohort,
      programActivityId: cohort.programActivity?.id ?? null,
      programActivityName: cohort.programActivity?.name ?? ''
    }))
  },
  set: (val) => {
    val.forEach(v => {
      const activity = activityStore.currentPageActivities.find(a => a.id === v.programActivityId)
      ;(v as any).programActivity = activity ?? null
    })
    cohortStore.cohortsPages[cohortStore.pagination.currentPage] = val
    cohortStore.currentPageCohorts = val
  }
})

const programActivityOptions = computed(() => {
  return activityStore.currentPageActivities
    .filter(activity => activity.lifeCycleStatus === 'ACTIVE')
    .map(activity => ({
      label: activity.name,
      value: activity.id
    }))
})

const columns = [
  {
    name: 'name',
    label: 'Nome',
    align: 'left',
    field: 'name',
    editType: 'text',
    placeholder: 'Digite o nome do coorte'
  },
  {
    name: 'description',
    label: 'Descrição',
    align: 'left',
    field: 'description',
    editType: 'text',
    placeholder: 'Digite a descrição'
  },
  {
    name: 'programActivityId',
    label: 'Serviço',
    align: 'left',
    field: 'programActivityName',
    editType: 'select',
    editOptionsKey: 'programActivityOptions',
    editValueField: 'programActivityId',
    placeholder: 'Selecione o serviço'
  },
  {
    name: 'actions',
    label: 'Opções',
    align: 'center'
  }
]

onMounted(async () => {
  if (cohortStore.currentPageCohorts.length === 0) {
    cohortStore.fetchCohorts()
  }

  if (programStore.currentPagePrograms.length === 0) {
    await programStore.fetchPrograms({ page: 0, size: 100 })
  }

  if (activityStore.currentPageActivities.length === 0) {
    await activityStore.fetchActivities({ page: 0, size: 100 })
  }
})

const onSearch = async (name: string) => {
  nameFilter.value = name
  pagination.value.page = 1

  await cohortStore.fetchCohorts({
    page: 0,
    size: pagination.value.rowsPerPage,
    name,
    ignoreCache: true
  })

  pagination.value.rowsNumber = cohortStore.pagination.totalSize
}

const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

watch(
  () => [pagination.value.page, pagination.value.rowsPerPage],
  async ([page, size]) => {
    await cohortStore.fetchCohorts({
      page: page - 1,
      size,
      name: nameFilter.value,
      ignoreCache: false
    })
    pagination.value.rowsNumber = cohortStore.pagination.totalSize
  },
  { immediate: true }
)

watch(
  () => cohortStore.pagination.totalSize,
  (total) => {
    pagination.value.rowsNumber = total
  }
)

const saveCohortHandler = async (cohortData: any) => {
  try {
    const selectedProgramActivity = activityStore.currentPageActivities.find(a => a.id === cohortData.programActivityId)
    if (!selectedProgramActivity) throw new Error(`Serviço com ID ${cohortData.programActivityId} não encontrado.`)

    const payloadToSave = {
      ...cohortData,
      programActivity: {
        id: selectedProgramActivity.id,
        uuid: selectedProgramActivity.uuid,
        name: selectedProgramActivity.name,
        program: selectedProgramActivity.program
      }
    }

    delete payloadToSave.undefined
    delete payloadToSave._backup

    const saved = await cohortStore.saveCohort(payloadToSave)
    saved.programActivity = selectedProgramActivity
    return saved
  } catch (err: any) {
    handleApiError(err, 'Erro ao salvar coorte')
    throw err
  }
}

const deleteCohortHandler = async (uuid: string) => {
  try {
    await cohortStore.deleteCohort(uuid)
  } catch (err: any) {
    handleApiError(err, 'Erro ao apagar coorte')
    throw err
  }
}

const toggleStatusHandler = async (row: any) => {
  try {
    const novoStatus = row.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    const confirm = await alertWarningAction(
      `Deseja realmente ${novoStatus === 'ACTIVE' ? 'desativar' : 'ativar'} este coorte?`
    )

    if (!confirm) return

    const updated = await cohortStore.updateCohortLifeCycleStatus(row.uuid, novoStatus)
    row.lifeCycleStatus = updated.lifeCycleStatus
  } catch (err: any) {
    handleApiError(err, 'Erro ao atualizar estado do coorte')
  }
}
</script>

<template>
  <EditableTable
    v-model="cohorts"
    title="Coortes"
    :columns="columns"
    :loading="cohortStore.loading"
    v-model:pagination="pagination"
    :program-activity-options="programActivityOptions"
    :confirm-error="alertError"
    :confirm-delete="alertWarningAction"
    :rows-per-page-options="[10, 20, 50, 100]"
    @save="(row, { resolve, reject }) => saveCohortHandler(row).then(resolve).catch(reject)"
    @delete="(row, { resolve, reject }) => deleteCohortHandler(row.uuid).then(resolve).catch(reject)"
    @search="onSearch"
    @toggle-status="toggleStatusHandler"
  />
</template>
