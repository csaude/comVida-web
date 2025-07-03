<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useGroupStore } from 'src/stores/group/groupStore'
import { useProgramActivityStore } from 'src/stores/programActivity/ProgramActivityStore'
import { useProgramStore } from 'src/stores/program/ProgramStore'
import { useApiErrorHandler } from 'src/composables/shared/error/useApiErrorHandler'
import { useSwal } from 'src/composables/shared/dialog/dialog'

const { handleApiError } = useApiErrorHandler()
const { alertWarningAction, alertError } = useSwal()

const groupStore = useGroupStore()
const activityStore = useProgramActivityStore()
const programStore = useProgramStore()

const nameFilter = ref('')

const groups = computed({
  get: () => {
    return groupStore.currentPageGroups.map(group => ({
      ...group,
      programActivityId: group.programActivity?.id ?? null,
      programId: group.programActivity?.program?.id ?? null,
      programActivityName: group.programActivity?.name ?? '',
      programName: group.programActivity?.program?.name ?? ''
    }))
  },
  set: (val) => {
    val.forEach(v => {
      const activity = activityStore.currentPageActivities.find(a => a.id === v.programActivityId)
      ;(v as any).programActivity = activity ?? null
    })
    groupStore.groupsPages[groupStore.pagination.currentPage] = val
    groupStore.currentPageGroups = val
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

const programActivityOptions = computed(() => {
  return activityStore.currentPageActivities
    .filter(activity => activity.lifeCycleStatus === 'ACTIVE')
    .map(activity => ({
      label: activity.name,
      value: activity.id,
      programId: activity.program?.id ?? null
    }))
})

const columns = [
  {
    name: 'name',
    label: 'Nome',
    align: 'left',
    field: 'name',
    editType: 'text',
    placeholder: 'Digite o nome do grupo'
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
    name: 'programId',
    label: 'Programa',
    align: 'left',
    field: 'programName',
    editType: 'select',
    editOptionsKey: 'programOptions',
    editValueField: 'programId',
    placeholder: 'Selecione o programa'
  },
  {
    name: 'programActivityId',
    label: 'Serviço',
    field: 'programActivityName',
    editType: 'select',
    align: 'left',
    editOptionsKey: 'programActivityOptions',
    editValueField: 'programActivityId',
    placeholder: 'Selecione o serviço',
    dependsOn: 'programId',
    matchField: 'programId'
  }
,
  {
    name: 'actions',
    label: 'Opções',
    align: 'center'
  }
]

onMounted(async () => {
  if (groupStore.currentPageGroups.length === 0) {
    groupStore.fetchGroups()
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

  await groupStore.fetchGroups({
    page: 0,
    size: pagination.value.rowsPerPage,
    name,
    ignoreCache: true
  })

  pagination.value.rowsNumber = groupStore.pagination.totalSize
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
    await groupStore.fetchGroups({
      page: page - 1,
      size,
      name: nameFilter.value,
      ignoreCache: false
    })
    pagination.value.rowsNumber = groupStore.pagination.totalSize
  },
  { immediate: true }
)

watch(
  () => groupStore.pagination.totalSize,
  (total) => {
    pagination.value.rowsNumber = total
  }
)

const saveGroupHandler = async (groupData: any) => {
  try {
    const selectedProgramActivity = activityStore.currentPageActivities.find(a => a.id === groupData.programActivityId)
    if (!selectedProgramActivity) throw new Error(`Atividade com ID ${groupData.programActivityId} não encontrada.`)

    const payloadToSave = {
      ...groupData,
      programActivity: {
        id: selectedProgramActivity.id,
        uuid: selectedProgramActivity.uuid,
        name: selectedProgramActivity.name,
        program: selectedProgramActivity.program
      }
    }

    delete payloadToSave.undefined
    delete payloadToSave._backup
    const saved = await groupStore.saveGroup(payloadToSave)
    saved.programActivity = selectedProgramActivity
    return saved
  } catch (err: any) {
    handleApiError(err, 'Erro ao salvar grupo')
    throw err
  }
}

const deleteGroupHandler = async (uuid: string) => {
  console.log('deleteGroupHandler', uuid)
  try {
    await groupStore.deleteGroup(uuid)
  } catch (err: any) {
    handleApiError(err, 'Erro ao apagar grupo')
    throw err
  }
}

const toggleStatusHandler = async (row: any) => {
  try {
    const novoStatus = row.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    const confirm = await alertWarningAction(
      `Deseja realmente ${novoStatus === 'ACTIVE' ? 'ativar' : 'desativar'} este grupo?`
    )

    if (!confirm) return

    const updatedGroup = await groupStore.updateGroupLifeCycleStatus(row.uuid, novoStatus)
    row.lifeCycleStatus = updatedGroup.lifeCycleStatus
  } catch (err: any) {
    handleApiError(err, 'Erro ao atualizar estado do grupo')
  }
}
</script>

<template>
  <EditableTable
    v-model="groups"
    title="Grupos"
    :columns="columns"
    :loading="groupStore.loading"
    v-model:pagination="pagination"
    :program-options="programOptions"
    :confirm-error="alertError"
    :confirm-delete="alertWarningAction"
    :program-activity-options="programActivityOptions"
    :rows-per-page-options="[10, 20, 50, 100]"
    @save="(row, { resolve, reject }) => saveGroupHandler(row).then(resolve).catch(reject)"
    @delete="(row, { resolve, reject }) => deleteGroupHandler(row.uuid).then(resolve).catch(reject)"
    @search="onSearch"
    @toggle-status="toggleStatusHandler"
  />
</template>
