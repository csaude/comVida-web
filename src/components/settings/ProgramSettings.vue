<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useProgramStore } from 'src/stores/program/ProgramStore'
import EditableTable from './EditableTable.vue'
import { useApiErrorHandler } from 'src/composables/shared/error/useApiErrorHandler'
import { useSwal } from 'src/composables/shared/dialog/dialog'


const { handleApiError } = useApiErrorHandler()
const { alertWarningAction } = useSwal()

// Store
const programStore = useProgramStore()

const nameFilter = ref('')

// Dados dos programas para o v-model da tabela
const programs = computed({
  get: () => programStore.currentPagePrograms,
  set: (val) => {
    programStore.programsPages[programStore.pagination.currentPage] = val
    programStore.currentPagePrograms = val
  }
})

// Colunas exibidas na tabela
const columns = [
  { name: 'name', label: 'Nome', align: 'left', field: 'name' },
  { name: 'description', label: 'Descrição', align: 'left', field: 'description' },
  { name: 'actions', label: 'Opções', align: 'center' }
]

// Buscar programas ao montar o componente
onMounted(() => {
  if (programStore.currentPagePrograms.length === 0) {
    programStore.fetchPrograms()
  }
})

// 🔍 Ao pesquisar, forçar API (ignora cache)
const onSearch = async (name: string) => {
  nameFilter.value = name
  pagination.value.page = 1 // sempre volta para a primeira página ao pesquisar

  await programStore.fetchPrograms({
    page: 0,
    size: pagination.value.rowsPerPage,
    name,
    ignoreCache: true
  })

  pagination.value.rowsNumber = programStore.pagination.totalSize
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
    await programStore.fetchPrograms({
      page: page - 1,
      size,
      name: nameFilter.value,
      ignoreCache: false
    })

    pagination.value.rowsNumber = programStore.pagination.totalSize
  },
  { immediate: true }
)

// Atualiza total ao buscar
watch(
  () => programStore.pagination.totalSize,
  (total) => {
    pagination.value.rowsNumber = total
  }
)

// Handler com try/catch para salvar
const saveProgramHandler = async (programData: any) => {
  try {
    await programStore.saveProgram(programData)
  } catch (err: any) {
    handleApiError(err, 'Erro ao salvar programa')
    throw err
  }
}

// Handler com try/catch para apagar
const deleteProgramHandler = async (uuid: string) => {
  try {
    await programStore.deleteProgram(uuid)
  } catch (err: any) {
    handleApiError(err, 'Erro ao apagar programa')
    throw err
  }
}

// Handler para ativar/desativar
const toggleStatusHandler = async (row: any) => {
  try {
    const novoStatus = row.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    const confirm = await alertWarningAction(
      `Deseja realmente ${novoStatus === 'ACTIVE' ? 'ativar' : 'desativar'} este programa?`
    )

    if (!confirm) {
      return
    }
    const updatedProgram = await programStore.updateProgramLifeCycleStatus(row.uuid, novoStatus)

    row.lifeCycleStatus = updatedProgram.lifeCycleStatus
  } catch (err: any) {
    handleApiError(err, 'Erro ao atualizar estado do programa')
  }
}


</script>

<template>
  <EditableTable
    v-model="programs"
    title="Programas"
    :columns="columns"
    :loading="programStore.loading"
    v-model:pagination="pagination"
    :rows-per-page-options="[10, 20, 50, 100]"
    @save="(row, { resolve, reject }) => saveProgramHandler(row).then(resolve).catch(reject)"
    @delete="(row, { resolve, reject }) => deleteProgramHandler(row.uuid).then(resolve).catch(reject)"
    @search="onSearch"
    @toggle-status="toggleStatusHandler"
  />
</template>
