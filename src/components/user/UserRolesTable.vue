<template>
  <q-card bordered class="rounded-0" flat>

    <q-banner dense inline-actions class="text-primary bg-grey-3  q-pa-none q-px-md">
        Perfis e Permissões de Acesso
        <template #action>
            <q-btn flat round color="primary" icon="add" @click="addRow" />
        </template>
    </q-banner>

    <q-table
      flat
      :rows="rows"
      :columns="columns"
      row-key="id"
      dense
      class="rounded-0"
      table-header-class="bg-grey-4 text-black"
    >
      <template #body-cell-program="props">
        <q-td>
          <q-select
            v-model="props.row.programId"
            :options="programs"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            dense
            outlined
            @update:model-value="props.row.serviceId = null" 
          />
        </q-td>
      </template>

      <template #body-cell-service="props">
        <q-td>
          <q-select
            v-model="props.row.serviceId"
            :options="getServicesForProgram(props.row.programId)"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            dense
            outlined
            :disable="!props.row.programId"
          />
        </q-td>
      </template>

      <template #body-cell-role="props">
        <q-td>
          <q-select
            v-model="props.row.role"
            :options="roles"
            emit-value
            map-options
            dense
            outlined
            placeholder="Selecionar função"
          />
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td class="text-center">
          <q-btn dense flat icon="delete" color="negative" @click="removeRow(props.row)" />
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Array,
  programs: Array,
  roles: Array
})

const emit = defineEmits(['update:modelValue'])

const rows = ref([...props.modelValue])

watch(() => props.modelValue, val => { rows.value = [...val] })
watch(rows, val => emit('update:modelValue', [...val]), { deep: true })

const columns = [
  { name: 'program', label: 'Programa', align: 'left', field: 'programId' },
  { name: 'service', label: 'Serviço', align: 'left', field: 'serviceId' },
  { name: 'role', label: 'Função', align: 'left', field: 'role' },
  { name: 'actions', label: 'Ações', align: 'center' }
]

const addRow = () => {
  rows.value.push({ id: Date.now(), programId: null, serviceId: null, role: null })
}

const removeRow = (row) => {
  rows.value = rows.value.filter(r => r !== row)
}

const getServicesForProgram = (programId) => {
  const program = props.programs.find(p => p.id === programId)
  return program ? program.services : []
}
</script>
