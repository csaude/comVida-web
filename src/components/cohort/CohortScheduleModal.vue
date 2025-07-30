<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Agendar Coorte</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="inclusionDate"
          label="Data de Início"
          type="date"
          dense
          outlined
        />

        <q-input
          v-model="exclusionDate"
          label="Data de Fim"
          type="date"
          dense
          outlined
          class="q-mt-sm"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn color="primary" label="Salvar" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  cohort: Object,
  inclusion: String,
  exclusion: String,
})

const emit = defineEmits(['update:modelValue', 'schedule-cohort'])

const inclusionDate = ref(props.inclusion || '')
const exclusionDate = ref(props.exclusion || '')

// Proxy para controlar o modal
const dialogModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      inclusionDate.value = props.inclusion || ''
      exclusionDate.value = props.exclusion || ''
    }
  },
)

function save() {
  emit('schedule-cohort', {
    inclusionDate: inclusionDate.value,
    exclusionDate: exclusionDate.value,
  })

  emit('update:modelValue', false)
}
</script>
