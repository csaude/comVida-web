<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useProgramActivityStore } from 'src/stores/programActivity/ProgramActivityStore'
import EditableTable from './EditableTable.vue'
import { useApiErrorHandler } from 'src/composables/shared/error/useApiErrorHandler'
import { useSwal } from 'src/composables/shared/dialog/dialog'
import { useProgramStore } from 'src/stores/program/ProgramStore'
import { Program } from 'src/entities/program/Program'

const { handleApiError } = useApiErrorHandler()
const { alertWarningAction } = useSwal()
const programStore = useProgramStore()

// Store
const activityStore = useProgramActivityStore()

const nameFilter = ref('')

// Dados das atividades para o v-model da tabela
const activities = computed({
  get: () => activityStore.currentPageActivities,
  set: (val) => {
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


// Colunas exibidas na tabela
const columns = [
  { name: 'name', label: 'Nome', align: 'left', field: 'name' },
  { name: 'programId', label: 'Programa', align: 'left', field: 'programId' },
  { name: 'actions', label: 'Opções', align: 'center' }
]

// Buscar atividades ao montar o componente
onMounted(async () => {
  if (activityStore.currentPageActivities.length === 0) {
    activityStore.fetchActivities()
  }

  if (programStore.currentPagePrograms.length === 0) {
    await programStore.fetchPrograms({
      page: 0,
      size: 100 // pode ajustar conforme necessidade
    })
  }
})

// 🔍 Ao pesquisar, forçar API (ignora cache)
const onSearch = async (name: string) => {
  nameFilter.value = name
  pagination.value.page = 1 // sempre volta para a primeira página ao pesquisar

  await activityStore.fetchActivities({
    page: 0,
    size: pagination.value.rowsPerPage,
    name,
    ignoreCache: true
  })

  pagination.value.rowsNumber = activityStore.pagination.totalSize
}

// Paginação usada pela <q-table>
const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// Sincroniza quando mudar a página ou quantidade por página
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

// Atualiza total ao buscar
watch(
  () => activityStore.pagination.totalSize,
  (total) => {
    pagination.value.rowsNumber = total
  }
)

// Handler com try/catch para salvar
const saveActivityHandler = async (activityData: any) => {
  try {

    // Monta o campo program como instância de Program
    const selectedProgram = programStore.currentPagePrograms.find(p => p.id === activityData.programId)

    if (!selectedProgram) {
      throw new Error(`Programa com ID ${activityData.programId} não encontrado.`)
    }

    // Monta o payload com program como instância
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


// Handler com try/catch para apagar
const deleteActivityHandler = async (uuid: string) => {
  try {
    await activityStore.deleteActivity(uuid)
  } catch (err: any) {
    handleApiError(err, 'Erro ao apagar atividade')
    throw err
  }
}

// Handler para ativar/desativar
const toggleStatusHandler = async (row: any) => {
  try {
    const novoStatus = row.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    const confirm = await alertWarningAction(
      `Deseja realmente ${novoStatus === 'ACTIVE' ? 'ativar' : 'desativar'} esta atividade?`
    )

    if (!confirm) {
      return
    }

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
    :rows-per-page-options="[10, 20, 50, 100]"
    @save="(row, { resolve, reject }) => saveActivityHandler(row).then(resolve).catch(reject)"
    @delete="(row, { resolve, reject }) => deleteActivityHandler(row.uuid).then(resolve).catch(reject)"
    @search="onSearch"
    @toggle-status="toggleStatusHandler"
  />
</template>
