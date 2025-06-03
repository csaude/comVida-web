<script setup>
import { ref } from 'vue'
import EditableTable from './EditableTable.vue'

// Lista de programas disponíveis (id e nome)
const programOptions = ref([
  { label: 'Programa de HIV', value: 1 },
  { label: 'Programa de TB', value: 2 }
])

// Lista de serviços
const services = ref([
  { id: 1, name: 'Enfermagem', description: 'Cuidados', programId: 1 },
  { id: 2, name: 'Consulta', description: 'Consulta Geral', programId: 2 }
])

// Colunas, incluindo a nova coluna "programId"
const columns = [
  { name: 'name', label: 'Nome', align: 'left', field: 'name' },
  { name: 'description', label: 'Descrição', align: 'left', field: 'description' },
  { name: 'programId', label: 'Programa', align: 'left', field: 'programId' },
  { name: 'actions', label: 'Opções', align: 'center' }
]
</script>

<template>
  <EditableTable
    v-model="services"
    title="Serviços"
    :columns="columns"
    :program-options="programOptions"
  />
</template>
