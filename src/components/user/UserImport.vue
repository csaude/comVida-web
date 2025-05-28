<template>
  <q-card flat bordered class="q-pa-none">
    <q-card-section class="q-pa-none">
        <q-banner dense inline-actions class="text-primary bg-grey-3  q-pa-none q-px-md q-py-xs">
        <span class="text-weight-medium">Importar Utilizadores</span>
        
    </q-banner>
    
    <div class="text-subtitle2 text-grey q-ma-md">Selecione um ficheiro Excel com a lista de utilizadores</div>
    </q-card-section>

    <q-card-section>

      <q-file
        v-model="file"
        label="Selecionar ficheiro"
        accept=".xlsx,.xls"
        outlined
        dense
        clearable
        @update:model-value="handleFileUpload"
      />

      <div v-if="previewRows.length" class="q-mt-md">
        <div class="text-grey text-weight-medium q-mb-md">Pré-Visualização</div>
        <q-table
          :rows="previewRows"
          :columns="columns"
          row-key="id"
          dense
          flat
          bordered
          table-header-class="bg-grey-4 text-black"
        />
      </div>
    </q-card-section>

    <q-card-actions align="right" class="q-gutter-sm">
      <q-btn label="Cancelar" color="negative" flat @click="$emit('cancel')" />
      <q-btn label="Importar" color="primary" :disable="!previewRows.length" @click="emitImported" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['imported', 'cancel'])

const file = ref(null)
const previewRows = ref([])

const columns = [
  { name: 'name', label: 'Nome', field: 'name', align: 'left' },
  { name: 'surname', label: 'Apelido', field: 'surname', align: 'left' },
  { name: 'username', label: 'Username', field: 'username', align: 'left' },
  { name: 'integratedSystem', label: 'Sistema Integrado', field: 'integratedSystem', align: 'left' },
  { name: 'idOnIntegratedSystem', label: 'ID no Sistema', field: 'idOnIntegratedSystem', align: 'left' },
]

const handleFileUpload = async (selectedFile) => {
  if (!selectedFile) return

  // Aqui será onde você vai ler o Excel
  // Por agora, vamos simular dados para a UI
  previewRows.value = [
    {
      id: Date.now(),
      name: 'Joana',
      surname: 'Matos',
      username: 'joana.m',
      integratedSystem: 'OpenMRS',
      idOnIntegratedSystem: 'U001'
    },
    {
      id: Date.now() + 1,
      name: 'Carlos',
      surname: 'Dias',
      username: 'cdias',
      integratedSystem: 'DHIS2',
      idOnIntegratedSystem: 'U002'
    }
  ]
}

const emitImported = () => {
  emit('imported', previewRows.value)
}
</script>
