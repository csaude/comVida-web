<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { Loading, QSpinnerRings } from 'quasar'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { useUserStore } from 'src/stores/user/userStore'
import { useSwal } from 'src/composables/shared/dialog/dialog'
import { useApiErrorHandler } from 'src/composables/shared/error/useApiErrorHandler'
import UserForm from 'src/components/user/UserForm.vue'
import UserPasswordResetDialog from 'src/components/user/UserPasswordResetDialog.vue'

const userStore = useUserStore()
const { alertWarningAction, alertError } = useSwal()
const { handleApiError } = useApiErrorHandler()

const nameFilter = ref('')
const showUserDialog = ref(false)
const selectedUser = ref<any | null>(null)

const showPasswordResetDialog = ref(false)
const userToResetPassword = ref<any | null>(null)

const users = computed({
  get: () => userStore.currentPageUsers,
  set: (val) => {
    userStore.usersPages[userStore.pagination.currentPage] = val
    userStore.currentPageUsers = val
  }
})

const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const columns = [
  { name: 'name', label: 'Nome', field: 'fullName', align: 'left', editType: 'text' },
  { name: 'username', label: 'Utilizador', field: 'username', align: 'left', editType: 'text' },
  { name: 'integratedSystem', label: 'Sistema Integrado', field: 'integratedSystemName', align: 'left' },
  { name: 'idOnIntegratedSystem', label: 'ID no Sistema', field: 'idOnIntegratedSystem', align: 'left' },
  { name: 'actions', label: 'Acções', field: 'actions', align: 'center' }
]

// Somente colunas exportáveis (sem “Ações”)
const exportableColumns = columns.filter(c => c.name !== 'actions')

/* =====================
 * EXPORT HELPERS
 * ===================== */

// Acessa campo aninhado “a.b.c”
const getField = (row: any, path: string) =>
  path.split('.').reduce((acc: any, k: string) => (acc ? acc[k] : undefined), row)

// Busca TODAS as páginas respeitando o filtro atual (usa cache do store quando disponível)
const collectAllUsers = async (): Promise<any[]> => {
  Loading.show({ spinner: QSpinnerRings, message: 'A preparar exportação…' })
  try {
    // garante que temos total atualizado
    const size = pagination.value.rowsPerPage
    const currentFilter = nameFilter.value

    // se ainda não carregou nada, faz 1ª chamada
    if (!userStore.pagination.totalSize && !userStore.currentPageUsers.length) {
      await userStore.fetchUsers({ page: 0, size, name: currentFilter, ignoreCache: true })
    }

    const total = userStore.pagination.totalSize || 0
    const totalPages = Math.max(1, Math.ceil(total / size))

    const originalPage = pagination.value.page

    const all: any[] = []
    for (let p = 0; p < totalPages; p++) {
      if (userStore.usersPages[p]) {
        all.push(...userStore.usersPages[p])
      } else {
        await userStore.fetchUsers({ page: p, size, name: currentFilter, ignoreCache: false })
        all.push(...(userStore.currentPageUsers ?? []))
      }
    }

    // restaura a página original do utilizador
    await userStore.fetchUsers({ page: originalPage - 1, size, name: currentFilter, ignoreCache: false })
    pagination.value.page = originalPage

    return all
  } finally {
    Loading.hide()
  }
}

const exportXls = async () => {
  const rows = await collectAllUsers()
  if (!rows.length) return alertError('Não há registos para exportar.')

  const header = exportableColumns.map(c => c.label)
  const body = rows.map(r => exportableColumns.map(c => getField(r, c.field) ?? ''))

  const ws = XLSX.utils.aoa_to_sheet([header, ...body])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Utilizadores')
  XLSX.writeFile(wb, `utilizadores_${new Date().toISOString().slice(0,10)}.xlsx`)
}

const exportPdf = async () => {
  const rows = await collectAllUsers()
  if (!rows.length) return alertError('Não há registos para exportar.')

  const header = exportableColumns.map(c => c.label)
  const body = rows.map(r => exportableColumns.map(c => getField(r, c.field) ?? ''))

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  autoTable(doc, {
    head: [header],
    body,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 122, 182] },
    margin: { top: 40, right: 20, bottom: 30, left: 20 }
  })
  doc.save(`utilizadores_${new Date().toISOString().slice(0,10)}.pdf`)
}

/* =====================
 * DATA LOADING + TABLE HANDLERS
 * ===================== */

onMounted(() => {
  if (userStore.currentPageUsers.length === 0) {
    userStore.fetchUsers()
  }
})

const onSearch = async (name: string) => {
  nameFilter.value = name
  pagination.value.page = 1
  await userStore.fetchUsers({
    page: 0,
    size: pagination.value.rowsPerPage,
    name,
    ignoreCache: true
  })
  pagination.value.rowsNumber = userStore.pagination.totalSize
}

watch(
  () => [pagination.value.page, pagination.value.rowsPerPage],
  async ([page, size]) => {
    await userStore.fetchUsers({
      page: page - 1,
      size,
      name: nameFilter.value,
      ignoreCache: false
    })
    pagination.value.rowsNumber = userStore.pagination.totalSize
  },
  { immediate: true }
)

watch(
  () => userStore.pagination.totalSize,
  (total) => { pagination.value.rowsNumber = total }
)

const saveUserHandler = async (user: any) => {
  try {
    await userStore.saveUser(user)
  } catch (err: any) {
    handleApiError(err, 'Erro ao salvar utilizador')
    throw err
  }
}

const deleteUserHandler = async (uuid: string) => {
  try {
    await userStore.deleteUser(uuid)
  } catch (err: any) {
    handleApiError(err, 'Erro ao apagar utilizador')
    throw err
  }
}

const toggleStatusHandler = async (user: any) => {
  try {
    const newStatus = user.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    const confirmed = await alertWarningAction(
      `Deseja realmente ${newStatus === 'ACTIVE' ? 'ativar' : 'desativar'} este utilizador?`
    )
    if (!confirmed) return

    const updated = await userStore.updateUserLifeCycleStatus(user.uuid, newStatus)
    user.lifeCycleStatus = updated.lifeCycleStatus
  } catch (err: any) {
    handleApiError(err, 'Erro ao atualizar estado do utilizador')
  }
}

const openEditDialog = (row: any) => {
  console.log('Abrindo diálogo de edição para:', row)
  selectedUser.value = row
  showUserDialog.value = true
}
const openAddDialog = () => {
  selectedUser.value = null
  showUserDialog.value = true
}
const handleClose = async () => {
  showUserDialog.value = false
  selectedUser.value = null
  await userStore.fetchUsers({
    page: pagination.value.page - 1,
    size: pagination.value.rowsPerPage,
    name: nameFilter.value,
    ignoreCache: false
  })
}
const handleUserSave = async (user: any) => {
  await saveUserHandler(user)
  showUserDialog.value = false
  await userStore.fetchUsers({
    page: pagination.value.page - 1,
    size: pagination.value.rowsPerPage,
    name: nameFilter.value,
    ignoreCache: false
  })
}

const openPasswordResetDialog = (row: any) => {
  userToResetPassword.value = row
  showPasswordResetDialog.value = true
}

const closePasswordResetDialog = () => {
  showPasswordResetDialog.value = false
  userToResetPassword.value = null
}

// (opcional) refrescar tabela depois do reset
const handlePasswordResetSuccess = async () => {
  await userStore.fetchUsers({
    page: pagination.value.page - 1,
    size: pagination.value.rowsPerPage,
    name: nameFilter.value,
    ignoreCache: true
  })
}
</script>

<template>
  <EditableTable
    v-model="users"
    title="Utilizadores"
    :columns="columns"
    :loading="userStore.loading"
    v-model:pagination="pagination"
    :rows-per-page-options="[10, 20, 50, 100]"
    :extra-actions="[
    {
      icon: 'lock_reset',
      tooltip: 'Redefinir Senha',
      emit: 'reset-password',
      color: 'deep-orange',
      visible: (row) => row.lifeCycleStatus === 'ACTIVE'
    }
  ]"
    :confirm-error="alertError"
    :confirm-delete="alertWarningAction"
    :use-external-edit="true"
    :use-external-add="true"
    @save="(row, { resolve, reject }) => saveUserHandler(row).then(resolve).catch(reject)"
    @delete="(row, { resolve, reject }) => deleteUserHandler(row.uuid).then(resolve).catch(reject)"
    @search="onSearch"
    @toggle-status="toggleStatusHandler"
    @edit="openEditDialog"
    @add="openAddDialog"
    @reset-password="openPasswordResetDialog"
  >
    <template #action-buttons>
      <q-btn outline color="primary" dense icon="ios_share" class="q-ml-sm" @click="$emit('import-users')">
        <q-tooltip class="bg-primary">Importar Utilizadores</q-tooltip>
      </q-btn>

      <q-btn outline color="primary" dense label="XLS" class="q-ml-sm" @click="exportXls">
        <q-tooltip class="bg-primary">Exportar para Excel</q-tooltip>
      </q-btn>

      <q-btn outline color="primary" dense label="PDF" class="q-ml-sm" @click="exportPdf">
        <q-tooltip class="bg-primary">Exportar para PDF</q-tooltip>
      </q-btn>
    </template>
  </EditableTable>

  <!-- Dialog de edição/criação -->
  <q-dialog v-model="showUserDialog" persistent style="width: 80%;">
    <q-card class="q-pa-none" style="min-width: 80%; max-width: 90vw;">
      <UserForm
        :model-value="selectedUser"
        :selected-user="selectedUser"
        @save="handleUserSave"
        @cancel="() => showUserDialog = false"
        @close="handleClose"
      />
    </q-card>
  </q-dialog>

  <q-dialog v-model="showPasswordResetDialog" persistent>
  <q-card style="min-width: 600px; max-width: 90vw;">
    <UserPasswordResetDialog
      :user="userToResetPassword"
      @close="closePasswordResetDialog"
      @updated="handlePasswordResetSuccess" 
    />
  </q-card>
</q-dialog>

</template>
