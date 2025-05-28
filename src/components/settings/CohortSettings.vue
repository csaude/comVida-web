<script setup>
import { ref } from 'vue'
import EditableTable from './EditableTable.vue'

// Lista de coortes com associação a serviço
const cohorts = ref([
  {
    id: 1,
    name: 'Infantil CCR',
    description: 'Crianças expostas',
    code: 'CCR1',
    serviceId: 1
  },
  {
    id: 2,
    name: 'Adulto TARV',
    description: 'Adultos em tratamento',
    code: 'TARV2',
    serviceId: 2
  }
])

// Colunas incluindo o novo campo serviceId
const columns = [
  { name: 'name', label: 'Nome', align: 'left', field: 'name' },
  { name: 'description', label: 'Descrição', align: 'left', field: 'description' },
  { name: 'code', label: 'Código', align: 'left', field: 'code' },
  { name: 'serviceId', label: 'Serviço', align: 'left', field: 'serviceId' },
  { name: 'actions', label: 'Opções', align: 'center' }
]

// Opções para o select de serviços
const serviceOptions = ref([
  { label: 'Consulta Geral', value: 1 },
  { label: 'Enfermagem', value: 2 }
])
</script>

<template>
  <EditableTable
    v-model="cohorts"
    title="Coortes"
    :columns="columns"
    :service-options="serviceOptions"
  />
</template>
