<template>
  <EditableTable
    v-model="usersLocal"
    title="Lista de Utilizadores"
    :columns="columns"
    :rows-per-page-options="[10, 20, 50, 100]"
    :extra-actions="extraActions"
    @custom-action="handleCustomAction"
  >
    <template #action-buttons>
      <q-btn outline style="color: goldenrod;" dense icon="ios_share" class="q-ml-sm" @click="$emit('import-users')">
        <q-tooltip class="bg-primary">Importar Utilizadores</q-tooltip>
      </q-btn>
      <q-btn outline style="color: goldenrod;" dense label="XLS" class="q-ml-sm">
        <q-tooltip class="bg-primary">Exportar para Excel</q-tooltip>
      </q-btn>
      <q-btn outline style="color: goldenrod;" dense label="PDF" class="q-ml-sm">
        <q-tooltip class="bg-primary">Exportar para PDF</q-tooltip>
      </q-btn>
    </template>
  </EditableTable>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  users: {
    type: Array,
    required: true
  }
})

const emit = defineEmits([
  'edit-user',
  'remove-user',
  'toggle-user-status',
  'reset-password',
  'import-users',
  'add-new-user'
])

const usersLocal = ref([...props.users])

watch(() => props.users, (val) => {
  usersLocal.value = [...val]
})

const columns = [
  { name: 'name', label: 'Nome', field: 'name', align: 'left' },
  { name: 'surname', label: 'Apelido', field: 'surname', align: 'left' },
  { name: 'username', label: 'Username', field: 'username', align: 'left' },
  { name: 'integratedSystem', label: 'Sistema Integrado', field: 'integratedSystem', align: 'left' },
  { name: 'idOnIntegratedSystem', label: 'ID no Sistema', field: 'idOnIntegratedSystem', align: 'left' },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center' }
]

const extraActions = [
  {
    icon: 'vpn_key',
    tooltip: 'Resetar Senha',
    emit: 'reset-password'
  },
]

function handleCustomAction(row, action) {
  emit(action.emit, row)
}

function searchUser() {
  // implementar lógica de busca aqui, se necessário
}
</script>
