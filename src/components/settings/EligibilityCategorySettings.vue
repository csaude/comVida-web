<template>
  <EditableTable
    v-model="categories"
    title="Categorias de Elegibilidade"
    :columns="columns"
    :program-options="programOptions"
    :service-options="serviceOptions"
  />
</template>

<script setup>
import { ref } from 'vue'

const categories = ref([
  {
    id: 1,
    name: 'Categoria A',
    description: 'Gestantes e lactantes',
    type: 'Adulto',
    programId: 1,
    serviceId: 1
  },
  {
    id: 2,
    name: 'Categoria B',
    description: 'Crianças em risco',
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
