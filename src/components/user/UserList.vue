<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useUserStore } from 'src/stores/user/userStore'
import { useSwal } from 'src/composables/shared/dialog/dialog'
import { useApiErrorHandler } from 'src/composables/shared/error/useApiErrorHandler'
import UserForm from 'src/components/user/UserForm.vue'


const userStore = useUserStore()
const { alertWarningAction, alertError } = useSwal()
const { handleApiError } = useApiErrorHandler()

const nameFilter = ref('')
const showUserDialog = ref(false)
const selectedUser = ref<any | null>(null)


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
  { name: 'integratedSystem', label: 'Sistema Integrado', field: 'integratedSystem', align: 'left' },
  { name: 'idOnIntegratedSystem', label: 'ID no Sistema', field: 'idOnIntegratedSystem', align: 'left' },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center' }
]

const extraActions = [
  {
    icon: 'vpn_key',
    tooltip: 'Resetar Senha',
    emit: 'reset-password'
  }
]

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
  (total) => {
    pagination.value.rowsNumber = total
  }
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
    selectedUser.value = row
    showUserDialog.value = true
  }

  const openAddDialog = () => {
    console.log('Opening add user dialog')
    selectedUser.value = null // reset form
    showUserDialog.value = true
  }

  const handleClose = async () => {
    showUserDialog.value = false
    selectedUser.value = null
    // Just refresh with current filter and pagination
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

</script>

<template>
  <EditableTable
    v-model="users"
    title="Utilizadores"
    :columns="columns"
    :loading="userStore.loading"
    v-model:pagination="pagination"
    :rows-per-page-options="[10, 20, 50, 100]"
    :extra-actions="extraActions"
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
  >
    <template #action-buttons>
      <q-btn outline color="primary" dense icon="ios_share" class="q-ml-sm" @click="$emit('import-users')">
        <q-tooltip class="bg-primary">Importar Utilizadores</q-tooltip>
      </q-btn>
      <q-btn outline color="primary" dense label="XLS" class="q-ml-sm">
        <q-tooltip class="bg-primary">Exportar para Excel</q-tooltip>
      </q-btn>
      <q-btn outline color="primary" dense label="PDF" class="q-ml-sm">
        <q-tooltip class="bg-primary">Exportar para PDF</q-tooltip>
      </q-btn>
    </template>
  </EditableTable>

  <!-- 🚀 Dialog is now OUTSIDE -->
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
</template>

