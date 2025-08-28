<template>
  <div class="q-pa-md">
    <EditableTable
      :title="'Histórico de Ficheiros Importados'"
      :columns="columns"
      v-model="rows"
      :pagination="pagination"
      :loading="store.loading"
      :rows-per-page-options="[10, 20, 50]"
      @update:pagination="handlePaginationChange"
      :hide-search-input="true"
      :hide-search-button="true"
      hide-toggle-status="true"
      :hide-add-button="true"
      hide-edit="true"
      hide-delete="true"
      :extra-actions="extraActions"
      @view-sheet="handleViewSheet"
      @edit-file="handleEditFile"
    >
      <template #action-buttons>
        <div class="row items-center q-gutter-md q-mb-md">
          <!-- Filtro por status -->
          <q-option-group
            v-model="filters.statuses"
            :options="statusOptions"
            type="checkbox"
            dense
            inline
            class="q-ml-md text-caption"
          />

          <!-- Campo de pesquisa por nome -->
          <q-input
            v-model="filters.name"
            outlined
            dense
            debounce="300"
            label="Nome do ficheiro"
            style="min-width: 250px"
          >
            <template #append>
              <q-icon
                v-if="filters.name"
                name="close"
                class="cursor-pointer"
                @click="clearNameSearch"
              />
            </template>
          </q-input>

          <!-- Botão Pesquisar -->
          <q-btn color="secondary" icon="search" dense @click="emitSearch" />
        </div>
      </template>
      <!-- <template #body-cell-actions="props">
        <q-btn
          size="sm"
          icon="visibility"
          flat
          round
          color="primary"
          @click="showSheetDetails(props.row)"
        />
      </template> -->
    </EditableTable>
  </div>

  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 600px; max-width: 90vw">
      <q-card-section class="text-h6">
        Detalhes de {{ selectedFileName }}
      </q-card-section>
      <q-card-section>
        <q-table
          :columns="sheetColumns"
          :rows="sheetRows"
          flat
          dense
          :loading="sheetLoading"
          row-key="id"
        >
          <!-- Coluna STATUS personalizada -->
          <template #body-cell-status="props">
            <q-td :props="props">
              <span
                :class="props.row.status === 'FAILED' ? 'text-negative' : ''"
              >
                {{ statusLabel(props.row.status) }}
              </span>
            </q-td>
          </template>

          <!-- Coluna PROGRESSO personalizada -->
          <template #body-cell-progress="props">
            <q-td :props="props">
              <div class="q-gutter-sm" style="min-width: 120px">
                <q-linear-progress
                  :value="props.row.progress / 100"
                  size="16px"
                  rounded
                  stripe
                  class="q-pa-sm"
                  :color="props.row.status === 'FAILED' ? 'red-6' : 'primary'"
                >
                  <div class="absolute-full flex flex-center">
                    <q-badge
                      :color="
                        props.row.status === 'FAILED' ? 'grey-5' : 'primary'
                      "
                      text-color="Yellow-10"
                      :label="progressLabel(props.row.progress)"
                    />
                  </div>
                </q-linear-progress>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Fechar" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { usePatientImportFileStore } from 'src/stores/patientImportFile/PatientImportFileStore'
import { useSwal } from 'src/composables/shared/dialog/dialog'

const store = usePatientImportFileStore()
const { alertWarningAction } = useSwal()

const editSourceSystemId = inject('editSourceSystemId')
const editFileId = inject('editFileId')
const editProgramActivityId = inject('editProgramActivityId')

const setTab = inject('setTab', () => {})

const emit = defineEmits([
  'edit-user',
  'remove-user',
  'toggle-user-status',
  'reset-password',
  'import-users',
  'add-new-user',
])

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const selectedFileName = ref('')
const rows = ref([])

const filters = ref({
  name: '',
  statuses: [],
})

function handleEditFile(row) {
  editFileId.value = row.id
  editSourceSystemId.value = row.sourceSystem?.id
  editProgramActivityId.value = row.programActivity?.id

  setTab('listas')
}

const extraActions = [
  {
    icon: 'visibility',
    color: 'primary',
    tooltip: 'Pcessamento Parcial',
    emit: 'view-sheet',
    visible: () => true,
  },
  {
    icon: 'edit',
    color: 'orange',
    tooltip: 'Recarregar Ficheiro',
    emit: 'edit-file',
    visible: () => true,
  },
]

function handleViewSheet(row) {
  selectedFileName.value = row.name
  showSheetDetails(row)
}

function progressLabel(progress) {
  return progress.toFixed(0) + '%'
}

const statusOptions = [
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Processando', value: 'PROCESSING' },
  { label: 'Concluído', value: 'PROCESSED' },
  { label: 'Falhou', value: 'FAILED' },
  { label: 'Actualizado', value: 'UPDATED' },
  { label: 'Interrompido', value: 'INTERRUPTED' },
]

const columns = [
  { name: 'name', label: 'Nome do ficheiro', field: 'name', align: 'left' },
  {
    name: 'status',
    label: 'Estado',
    field: 'status',
    align: 'left',
    format: (val) => statusLabel(val),
  },
  {
    name: 'progress',
    label: 'Progresso',
    field: 'progress',
    align: 'left',
    format: (val) => `${val}%`,
    style: 'min-width: 150px;',
  },
  { name: 'message', label: 'Mensagem', field: 'message', align: 'left' },
  {
    name: 'createdAt',
    label: 'Criado em',
    field: (row) => new Date(row.createdAt).toLocaleString(),
    align: 'left',
  },
  {
    name: 'actions',
    label: 'Acções',
    field: 'uuid',
    align: 'center',
    sortable: false,
  },
]

function statusLabel(status) {
  return (
    {
      PENDING: 'Pendente',
      PROCESSING: 'Processando',
      PROCESSED: 'Concluído',
      FAILED: 'Falhou',
      UPDATED: 'Atualizado',
      INTERRUPTED: 'Interrompido',
    }[status] || status
  )
}

const dialogVisible = ref(false)
const sheetRows = ref([])
const sheetLoading = ref(false)

const sheetColumns = [
  { name: 'sheetName', label: 'Cohort', field: 'sheetName', align: 'left' },
  {
    name: 'status',
    label: 'Estado',
    field: 'status',
    align: 'left',
    format: (val) => statusLabel(val),
  },
  {
    name: 'progress',
    label: 'Progresso',
    field: 'progress',
    align: 'left',
  },
  { name: 'message', label: 'Mensagem', field: 'message', align: 'left' },
]

async function showSheetDetails(file) {
  dialogVisible.value = true
  sheetLoading.value = true
  sheetRows.value = []

  try {
    await store.fetchSheetStatuses(file.id)
    sheetRows.value = store.sheetStatuses?.map((s) => ({
      sheetName: s.sheetName,
      status: s.status,
      progress: s.progress,
      message: s.message,
    }))
  } catch (e) {
    console.error('Erro ao buscar sheet statuses:', e)
  } finally {
    sheetLoading.value = false
  }
}

function clearNameSearch() {
  filters.value.name = ''
}

function emitSearch() {
  const selectedStatuses = filters.value.statuses
  console.log('Selected statuses:', selectedStatuses)
  pagination.value.page = 1

  handleSearch({
    name: filters.value.name,
    statuses: selectedStatuses,
  })
}

async function handleSearch(filter) {
  await store.fetchImportFiles({
    page: pagination.value.page - 1,
    size: pagination.value.rowsPerPage,
    name: filter.name,
    status: filter.statuses.join(','),
    ignoreCache: true,
  })

  rows.value = store.currentImportFiles
  pagination.value.rowsNumber = store.pagination.totalSize
}

function handlePaginationChange(newPagination) {
  pagination.value.page = newPagination.page
  pagination.value.rowsPerPage = newPagination.rowsPerPage
  emitSearch()
}

async function deleteFile(file) {
  const confirm = await alertWarningAction(
    'Deseja realmente apagar este ficheiro?',
  )
  if (!confirm) return

  await store.deleteImportFile(file.uuid)
  emitSearch()
}

onMounted(() => {
  editFileId.value = ''
  editSourceSystemId.value = ''
  editProgramActivityId.value = ''
  filters.value.statuses = statusOptions.map((opt) => opt.value)
  emitSearch()
})
</script>
