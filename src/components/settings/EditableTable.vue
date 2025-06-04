<template>
  <q-card class="q-pa-none" flat bordered>
    <q-card-section class="text-h6 q-pa-none">
      <q-banner dense inline-actions class="text-primary bg-grey-3">
        <span class="text-subtitle2 text-primary">
          {{ props.title }}
        </span>
        <template #action>
            <q-input
              outlined
              label="Pesquisar por Nome, descrição, Código"
              dense
              ref="recordCodeRef"
              class="col"
              style="width: 300px;"
              v-model="searchParams"
              @keyup.enter="search"
            >
              <template #append>
                <q-icon
                  v-if="searchParams"
                  name="close"
                  @click="searchParams = ''"
                  class="cursor-pointer"
                />
              </template>
            </q-input>

            <q-btn outline style="color: goldenrod;" dense icon="search" @click="search" class="q-ml-sm">
                <q-tooltip class="bg-primary">Pesquisar</q-tooltip>
            </q-btn>
          <q-btn outline style="color: goldenrod;" dense icon="add" class="q-ml-sm" @click="addRow">
                <q-tooltip class="bg-primary">Criar novos {{ title }}</q-tooltip>
            </q-btn>
        </template>
      </q-banner>
    </q-card-section>

    <q-card-section class="q-pa-md">
      <q-table
        :rows="rows"
        :columns="props.columns"
        row-key="id"
        flat
        dense
        separator="horizontal"
        :pagination="props.pagination"
        @update:pagination="(val) => emit('update:pagination', val)"
        :rows-per-page-options="props.rowsPerPageOptions"
      >

        <template
          v-for="col in visibleColumns"
          :key="col.name"
          #[`body-cell-${col.name}`]="{ row }"
        >
          <q-td>
            <template v-if="isEditing(row)">
              <q-select
                v-if="col.field === 'programId'"
                v-model="row.programId"
                :options="props.programOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                dense
                filled
                placeholder="Selecionar programa"
              />
              <q-select
                v-else-if="col.field === 'serviceId'"
                v-model="row.serviceId"
                :options="props.serviceOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                dense
                filled
                placeholder="Selecionar serviço"
              />
              <q-input
                v-else
                v-model="row[col.field]"
                dense
                outlined
                :placeholder="col.label"
              />
            </template>

            <template v-else>
              <span v-if="col.field === 'programId'">
                {{ props.programOptions?.find(p => p.value === row.programId)?.label || '—' }}
              </span>
              <span v-else-if="col.field === 'serviceId'">
                {{ props.serviceOptions?.find(s => s.value === row.serviceId)?.label || '—' }}
              </span>
              <span v-else>
                {{ row[col.field] }}
              </span>
            </template>
          </q-td>
        </template>

        <template #body-cell-actions="{ row }">
          <q-td class="text-center">
            <div v-if="isEditing(row)">
              <q-btn dense flat icon="check" color="green" @click="saveRow(row)" />
              <q-btn dense flat icon="close" color="orange" @click="cancelEdit(row)" />
            </div>
            <div v-else>
              <q-btn dense flat icon="edit" color="primary" @click="editRow(row)" />
              <q-btn dense flat icon="delete" color="red" @click="deleteRow(row)" />
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  title: String,
  modelValue: Array,
  columns: Array,
  programOptions: Array,
  serviceOptions: Array,
  loading: Boolean,
  pagination: Object,
  rowsPerPageOptions: Array
})

const searchParams = ref('')

const emit = defineEmits([
  'update:modelValue',
  'update:pagination',
  'save',
  'delete',
  'search'
])


const rows = ref([...props.modelValue])
watch(() => props.modelValue, val => { rows.value = [...val] })

const editingRows = ref(new Set())
const visibleColumns = computed(() =>
  props.columns.filter(col => col.name !== 'actions')
)

const isEditing = (row) => editingRows.value.has(row)

const addRow = () => {
  const newRow = { id: Date.now() }
  props.columns.forEach(col => {
    if (col.field !== 'actions') newRow[col.field] = ''
  })
  newRow._isNew = true
  rows.value.push(newRow)
  editingRows.value.add(newRow)
  emit('update:modelValue', [...rows.value])
}

const editRow = (row) => {
  row._backup = { ...row }
  editingRows.value.add(row)
}

const search = () => {
  emit('search', searchParams.value.trim())
}

const cancelEdit = (row) => {
  Object.assign(row, row._backup)
  delete row._backup
  editingRows.value.delete(row)
}

const saveRow = (row) => {
  delete row._backup
  editingRows.value.delete(row)
  emit('update:modelValue', [...rows.value])
  emit('save', row)
}

const deleteRow = (row) => {
  rows.value = rows.value.filter(r => r !== row)
  editingRows.value.delete(row)
  emit('update:modelValue', [...rows.value])
  emit('delete', row)
}
</script>
