<template>
  <q-dialog v-model="dialogVisible" full-width persistent>
    <q-card>
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">{{ cohort?.name }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="uploadHistory"
          :columns="columns"
          row-key="filename"
          flat
          dense
        >
          <template #body-cell-startDate="props">
            <q-td>
              <q-input
                v-if="!props.row.allocationStart"
                v-model="props.row.allocationStart"
                mask="####-##-##"
                filled
                dense
                placeholder="AAAA-MM-DD"
                >

                <template #append>
                  <q-icon name="event">
                    <q-popup-proxy>
                      <q-date v-model="props.row.allocationStart" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <span v-else>{{ props.row.allocationStart }}</span>
            </q-td>
          </template>

          <template #body-cell-endDate="props">
            <q-td>
              <q-input
                v-if="!props.row.allocationEnd"
                v-model="props.row.allocationEnd"
                mask="####-##-##"
                filled
                dense
                placeholder="AAAA-MM-DD"
                >

                <template #append>
                  <q-icon name="event">
                    <q-popup-proxy>
                      <q-date v-model="props.row.allocationEnd" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <span v-else>{{ props.row.allocationEnd }}</span>
            </q-td>
          </template>
        </q-table>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="close" />
        <q-btn label="Guardar" color="primary" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  cohort: Object,
  uploads: Array
})

const emit = defineEmits(['update:modelValue', 'save'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})


const uploadHistory = ref([])
const columns = [
  { name: 'filename', label: 'Ficheiro', field: 'filename' },
  { name: 'uploadedAt', label: 'Carregado em', field: 'uploadedAt' },
  { name: 'startDate', label: 'Início da Alocação', field: 'allocationStart' },
  { name: 'endDate', label: 'Fim da Alocação', field: 'allocationEnd' }
]

watch(
  () => props.uploads,
  (val) => {
    uploadHistory.value = val.map(v => ({ ...v })) // clone
  },
  { immediate: true }
)

function close() {
  emit('update:modelValue', false)
}

function save() {
  emit('save', uploadHistory.value)
  close()
}
</script>
