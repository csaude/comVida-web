<template>
  <div class="q-pa-md">
    <q-card class="bg-white q-pa-none" flat bordered>
      <q-card-section class="q-pa-none">
        <q-banner dense inline-actions class="text-primary bg-grey-3  q-pa-none q-px-md q-py-xs">
            <span class="text-weight-medium">Processamento de Listas Carregadas</span>
        </q-banner>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-none">
        <q-table
          :rows="uploads"
          :columns="columns"
          row-key="filename"
          flat
          dense
          table-header-class="bg-grey-4 text-black"
        />
        </q-card-section>
    </q-card>
    
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const uploads = ref([
  {
    filename: 'coorte-hiv-maio.xlsx',
    program: 'HIV',
    service: 'ATS',
    group: 'Adolescentes',
    uploadedAt: '2024-05-26 10:42',
    status: 'Em processamento',
    processingStart: Date.now()
  },
  {
    filename: 'tb-lista.xlsx',
    program: 'TB',
    service: 'Visita Domiciliária',
    group: 'Homens',
    uploadedAt: '2024-05-25 16:10',
    status: 'Concluído'
  }
])

const columns = [
  { name: 'filename', label: 'Ficheiro', field: 'filename', align: 'left' },
  { name: 'program', label: 'Programa', field: 'program', align: 'left' },
  { name: 'service', label: 'Serviço', field: 'service', align: 'left' },
  { name: 'group', label: 'Grupo', field: 'group', align: 'left' },
  { name: 'uploadedAt', label: 'Carregado em', field: 'uploadedAt', align: 'left' },
  { name: 'status', label: 'Estado', field: 'status', align: 'left' }
]

let intervalId

function refreshStatuses() {
  const now = Date.now()
  uploads.value.forEach(upload => {
    if (upload.status === 'Em processamento' && now - upload.processingStart > 8000) {
      upload.status = 'Concluído'
      delete upload.processingStart
    }
  })
}

onMounted(() => {
  intervalId = setInterval(refreshStatuses, 5000)
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
})
</script>
