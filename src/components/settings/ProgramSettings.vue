<script setup>
import { ref } from 'vue'
import EditableTable from './EditableTable.vue'

const programs = ref([
  { id: 1, name: 'HIV', description: 'Programa de HIV' },
  { id: 2, name: 'TB', description: 'Programa de TB' }
])

const columns = [
  { name: 'name', label: 'Nome', align: 'left', field: 'name' },
  { name: 'description', label: 'Descrição', align: 'left', field: 'description' },
  { name: 'actions', label: 'Opções', align: 'center' }
]
</script>

<template>
  <EditableTable v-model="programs" title="Programas" :columns="columns" />
</template>
