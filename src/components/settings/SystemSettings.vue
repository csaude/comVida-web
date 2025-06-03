<script setup>
import { ref } from 'vue'
import EditableTable from './EditableTable.vue'

const systems = ref([
  { id: 1, name: 'SIS-RME', description: 'Sistema nacional de informação', type: 'Nacional', url: 'sisrme.misau.gov' },
  { id: 2, name: 'OpenMRS', description: 'Sistema clínico', type: 'Internacional', url: 'http://10.10.2.17:8088/openmrschabeco' },
  { id: 3, name: 'SIS-CCR', description: 'Sistema de coorte CCR', type: 'Local', url: 'Local' }
])

const columns = [
  { name: 'name', label: 'Nome', align: 'left', field: 'name' },
  { name: 'description', label: 'Descrição', align: 'left', field: 'description' },
  { name: 'type', label: 'Tipo', align: 'left', field: 'type' },
  { name: 'url', label: 'URL', align: 'left', field: 'url' },
  { name: 'actions', label: 'Opções', align: 'center' }
]
</script>

<template>
  <EditableTable v-model="systems" title="Sistemas" :columns="columns" />
</template>
