<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useProgramStore } from 'src/stores/program/ProgramStore'
import EditableTable from './EditableTable.vue'

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
// 📄 Ao mudar de página ou tamanho, usa cache se possível
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
</script>

<template>
  <EditableTable
    v-model="programs"
    title="Programas"
    :columns="columns"
    :loading="programStore.loading"
    v-model:pagination="pagination"
    :rows-per-page-options="[10, 20, 50, 100]"
    @save="programStore.saveProgram"
    @delete="(row) => programStore.deleteProgram(row.uuid)"
    @search="onSearch"
  />

</template>
