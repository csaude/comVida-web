<template>
  <q-card flat bordered class="q-pa-none">
    <q-banner dense inline-actions class="text-primary bg-grey-3  q-pa-none q-px-md q-py-xs">
        <span class="text-weight-medium">Lista de Utilizadores</span>
        <template #action>
            <q-input
                outlined
                label="Pesquisar por Nome, Username"
                dense
                ref="recordCodeRef"
                class="col"
                style="width: 300px;"
                v-model="searchParams"
                @update:model-value="(value) => (filter = value)"
            >
                <template #action:append>
                    <q-icon
                        name="close"
                        @click="searchParams = ''"
                        class="cursor-pointer"
                    />
                </template>
            </q-input>
            <q-btn outline style="color: goldenrod;" dense icon="search" @click="searchUser" class="q-ml-sm">
                <q-tooltip class="bg-primary">Pesquisar</q-tooltip>
            </q-btn>
            <q-btn outline style="color: goldenrod;" dense icon="ios_share" class="q-ml-sm" @click="$emit('import-users')">
                <q-tooltip class="bg-primary">Importar Utilizadores</q-tooltip>
            </q-btn>
            <q-btn outline style="color: goldenrod;" dense icon="person_add" @click="$emit('add-new-user')" class="q-ml-sm" >
                <q-tooltip class="bg-primary">Criar novo utilizador</q-tooltip>
            </q-btn>
            <q-btn outline style="color: goldenrod;" dense label="XLS" class="q-ml-sm">
                <q-tooltip class="bg-primary">Exportar para Excel</q-tooltip>
            </q-btn>
            <q-btn outline style="color: goldenrod;" dense label="PDF" class="q-ml-sm">
                <q-tooltip class="bg-primary">Exportar para PDF</q-tooltip>
            </q-btn>
        </template>
    </q-banner>

    <q-table
      :rows="users"
      :columns="columns"
      row-key="id"
      flat
      dense
      table-header-class="bg-grey-1 text-black"
    >
      <!-- Status formatado -->
      <template #body-cell-status="props">
        <q-td>
          <q-badge :color="props.row.status === 'Ativo' ? 'green' : 'grey'" align="middle">
            {{ props.row.status }}
          </q-badge>
        </q-td>
      </template>

      <!-- Ações -->
      <template #body-cell-actions="props">
        <q-td class="q-gutter-xs">
          <q-btn dense flat icon="edit" color="primary" @click="$emit('edit-user', props.row)" />
          <q-btn
            dense flat
            :icon="props.row.status === 'Ativo' ? 'toggle_off' : 'toggle_on'"
            :color="props.row.status === 'Ativo' ? 'orange' : 'green'"
            @click="$emit('toggle-user-status', props.row)"
          />
          <q-btn dense flat icon="delete" color="negative" @click="$emit('remove-user', props.row.id)" />
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup>
const props = defineProps({
  users: {
    type: Array,
    required: true
  }
})

const columns = [
  { name: 'name', label: 'Nome', field: 'name', align: 'left' },
  { name: 'surname', label: 'Apelido', field: 'surname', align: 'left' },
  { name: 'username', label: 'Username', field: 'username', align: 'left' },
  { name: 'integratedSystem', label: 'Sistema Integrado', field: 'integratedSystem', align: 'left' },
  { name: 'idOnIntegratedSystem', label: 'ID no Sistema', field: 'idOnIntegratedSystem', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'left' }
]
</script>
