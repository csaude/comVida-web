<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useProgramActivityStore } from 'src/stores/programActivity/ProgramActivityStore'
import { useApiErrorHandler } from 'src/composables/shared/error/useApiErrorHandler'
import { useSwal } from 'src/composables/shared/dialog/dialog'
import { useProgramStore } from 'src/stores/program/ProgramStore'
import { Program } from 'src/entities/program/Program'

const { handleApiError } = useApiErrorHandler()
const { alertWarningAction, alertError } = useSwal()

const programStore = useProgramStore()
const activityStore = useProgramActivityStore()

const nameFilter = ref('')

const activities = computed({
  get: () => activityStore.currentPageActivities.map(activity => ({
    ...activity,
    programId: activity.program?.id ?? null,
    programName: activity.program?.name ?? ''
  })),
  set: (val) => {
    val.forEach(v => {
      const program = programStore.currentPagePrograms.find(p => p.id === v.programId)
      ;(v as any).program = program ?? null
    })
    activityStore.activitiesPages[activityStore.pagination.currentPage] = val
    activityStore.currentPageActivities = val
  }
})

const programOptions = computed(() => {
  return programStore.currentPagePrograms
    .filter(program => program.lifeCycleStatus === 'ACTIVE')
    .map(program => ({
      label: program.name,
      value: program.id
    }))
})

const columns = [
  {
    name: 'name',
    label: 'Nome',
    align: 'left',
    field: 'name',
    editType: 'text',
    placeholder: 'Digite o nome da atividade'
  },
  {
    name: 'programId',
    label: 'Programa',
    align: 'left',
    field: 'programName',
    editType: 'select',
    editOptionsKey: 'programOptions',
    editValueField: 'programId',
    optionLabelKey: 'label',
    optionValueKey: 'value',
    placeholder: 'Selecione o programa'
  },
  {
    name: 'actions',
    label: 'Opções',
    align: 'center'
  }
]

onMounted(async () => {
  if (activityStore.currentPageActivities.length === 0) {
    activityStore.fetchActivities()
  }

  if (programStore.currentPagePrograms.length === 0) {
    await programStore.fetchPrograms({ page: 0, size: 100 })
  }
})

const onSearch = async (name: string) => {
  nameFilter.value = name
  pagination.value.page = 1

  await activityStore.fetchActivities({
    page: 0,
    size: pagination.value.rowsPerPage,
    name,
    ignoreCache: true
  })

  pagination.value.rowsNumber = activityStore.pagination.totalSize
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
    await activityStore.fetchActivities({
      page: page - 1,
      size,
      name: nameFilter.value,
      ignoreCache: false
    })
    pagination.value.rowsNumber = activityStore.pagination.totalSize
  },
  { immediate: true }
)

watch(
  () => activityStore.pagination.totalSize,
  (total) => {
    pagination.value.rowsNumber = total
  }
)

const saveActivityHandler = async (activityData: any) => {
  try {
    const selectedProgram = programStore.currentPagePrograms.find(p => p.id === activityData.programId)

    if (!selectedProgram) {
      throw new Error(`Programa com ID ${activityData.programId} não encontrado.`)
    }

    const payloadToSave = {
      ...activityData,
      program: new Program({
        id: selectedProgram.id,
        uuid: selectedProgram.uuid
      })
    }

    delete payloadToSave.undefined
    delete payloadToSave._backup

    const saved = await activityStore.saveActivity(payloadToSave)
    saved.program = selectedProgram
    return saved
  } catch (err: any) {
    handleApiError(err, 'Erro ao salvar atividade')
    throw err
  }
}

const deleteActivityHandler = async (uuid: string) => {
  try {
    await activityStore.deleteActivity(uuid)
  } catch (err: any) {
    handleApiError(err, 'Erro ao apagar atividade')
    throw err
  }
}

const toggleStatusHandler = async (row: any) => {
  try {
    const novoStatus = row.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    const confirm = await alertWarningAction(
      `Deseja realmente ${novoStatus === 'ACTIVE' ? 'ativar' : 'desativar'} esta atividade?`
    )

    if (!confirm) return

    const updatedActivity = await activityStore.updateActivityLifeCycleStatus(row.uuid, novoStatus)
    row.lifeCycleStatus = updatedActivity.lifeCycleStatus
  } catch (err: any) {
    handleApiError(err, 'Erro ao atualizar estado da atividade')
  }
}
</script>

<template>
  <EditableTable
    v-model="activities"
    title="Atividades do Programa"
    :columns="columns"
    :loading="activityStore.loading"
    v-model:pagination="pagination"
    :program-options="programOptions"
    :confirm-error="alertError"
    :confirm-delete="alertWarningAction"
    :rows-per-page-options="[10, 20, 50, 100]"
    @save="(row, { resolve, reject }) => saveActivityHandler(row).then(resolve).catch(reject)"
    @delete="(row, { resolve, reject }) => deleteActivityHandler(row.uuid).then(resolve).catch(reject)"
    @search="onSearch"
    @toggle-status="toggleStatusHandler"
  />
</template>
