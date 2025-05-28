<template>
  <EditableTable
    v-model="groups"
    title="Grupos"
    :columns="columns"
    :program-options="programOptions"
    :service-options="serviceOptions"
  />
</template>

<script setup>
import { ref } from 'vue'
import EditableTable from './EditableTable.vue'

const groups = ref([
  {
    id: 1,
    name: 'Grupo A',
    description: 'Mensal',
    type: 'Adulto',
    programId: 1,
    serviceId: 1
  },
  {
    id: 2,
    name: 'Grupo B',
    description: 'Risco elevado',
    type: 'Infantil',
    programId: 2,
    serviceId: 2
  }
])

const columns = [
  { name: 'name', label: 'Nome', align: 'left', field: 'name' },
  { name: 'description', label: 'Descrição', align: 'left', field: 'description' },
  { name: 'type', label: 'Tipo', align: 'left', field: 'type' },
  { name: 'programId', label: 'Programa', align: 'left', field: 'programId' },
  { name: 'serviceId', label: 'Serviço', align: 'left', field: 'serviceId' },
  { name: 'actions', label: 'Opções', align: 'center' }
]

const programOptions = ref([
  { label: 'Programa de HIV', value: 1 },
  { label: 'Programa de TB', value: 2 }
])

const serviceOptions = ref([
  { label: 'Consulta Geral', value: 1 },
  { label: 'Enfermagem', value: 2 }
])
</script>
