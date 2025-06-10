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
            :disable="isEditingAnyRow"
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

          <q-btn outline style="color: goldenrod;" dense icon="search" @click="search" :disable="isEditingAnyRow" class="q-ml-sm">
            <q-tooltip class="bg-primary">Pesquisar</q-tooltip>
          </q-btn>
          <q-btn outline style="color: goldenrod;" dense icon="add" class="q-ml-sm" @click="addRow" :disable="isEditingAnyRow">
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
            <!-- Campo lifeCycleStatus com toggle -->
            <template v-if="col.field === 'lifeCycleStatus'">
              <q-toggle
                v-if="isEditing(row)"
                :model-value="row.lifeCycleStatus === 'ACTIVE'"
                @update:model-value="val => row.lifeCycleStatus = val ? 'ACTIVE' : 'INACTIVE'"
                color="primary"
                dense
                keep-color
              />
              <q-icon
                v-else
                :name="row.lifeCycleStatus === 'ACTIVE' ? 'check_circle' : 'cancel'"
                :color="row.lifeCycleStatus === 'ACTIVE' ? 'green' : 'red'"
              />
            </template>

            <!-- Campo programId -->
            <template v-else-if="col.field === 'programId'">
              <q-select
                v-if="isEditing(row)"
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
              <span v-else>
                {{ props.programOptions?.find(p => p.value === row.programId)?.label || '—' }}
              </span>
            </template>

            <!-- Campo serviceId -->
            <template v-else-if="col.field === 'serviceId'">
              <q-select
                v-if="isEditing(row)"
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
              <span v-else>
                {{ props.serviceOptions?.find(s => s.value === row.serviceId)?.label || '—' }}
              </span>
            </template>

            <!-- Outros campos padrão -->
            <template v-else>
              <q-input
                v-if="isEditing(row)"
                v-model="row[col.field]"
                dense
                outlined
                :placeholder="col.label"
              />
              <span v-else>
                {{ row[col.field] }}
              </span>
            </template>
          </q-td>
        </template>

        <!-- Ações -->

        <template #body-cell-actions="{ row }">
          <q-td class="text-center">
            <div v-if="isEditing(row)">
              <q-btn dense flat icon="check" color="green" @click="saveRow(row)" />
              <q-btn dense flat icon="close" color="orange" @click="cancelEdit(row)" />
            </div>
            <div v-else class="q-gutter-sm">
              <q-btn
                dense
                flat
                :icon="row.lifeCycleStatus === 'ACTIVE' ? 'toggle_on' : 'toggle_off'"
                :color="row.lifeCycleStatus === 'ACTIVE' ? 'green' : 'grey'"
                @click="toggleStatus(row)"
                :disable="isEditingAnyRow"
              >
                <q-tooltip>
                  {{ row.lifeCycleStatus === 'ACTIVE' ? 'Desativar' : 'Ativar' }}
                </q-tooltip>
              </q-btn>
              <q-btn
                dense
                flat
                icon="edit"
                color="primary"
                @click="editRow(row)"
              />
              <q-btn
                dense
                flat
                icon="delete"
                color="red"
                @click="deleteRow(row)"
              />
            </div>
          </q-td>
        </template>

      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useSwal } from 'src/composables/shared/dialog/dialog'

const { alertError, alertWarningAction } = useSwal()

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
  'search',
  'toggle-status'
])

const toggleStatus = (row) => {
  emit('toggle-status', row)
}
const rows = ref([...props.modelValue])
watch(() => props.modelValue, val => { rows.value = [...val] })

const editingRows = ref(new Set())
const visibleColumns = computed(() =>
  props.columns.filter(col => col.name !== 'actions')
)

const isEditing = (row) => editingRows.value.has(row)
const isEditingAnyRow = computed(() => editingRows.value.size > 0)

const addRow = () => {
  if (isEditingAnyRow.value) {
    alertError('Termine a edição atual antes de criar uma nova linha.')
    return
  }

  const newRow = { _isNew: true, lifeCycleStatus: 'ACTIVE' } // já nasce como ativo
  props.columns.forEach(col => {
    if (col.field !== 'actions' && col.field !== 'lifeCycleStatus') newRow[col.field] = ''
  })
  rows.value.push(newRow)
  editingRows.value.add(newRow)
  emit('update:modelValue', [...rows.value])
}

const editRow = (row) => {
  if (isEditingAnyRow.value) {
    alertError('Termine a edição atual antes de editar outra linha.')
    return
  }

  row._backup = { ...row }
  editingRows.value.add(row)
}

const search = () => {
  emit('search', searchParams.value.trim())
}

const cancelEdit = (row) => {
  if (row._isNew) {
    rows.value = rows.value.filter(r => r !== row)
    editingRows.value.delete(row)
    emit('update:modelValue', [...rows.value])
  } else {
    if (row._backup) {
      Object.assign(row, row._backup)
      delete row._backup
    }
    editingRows.value.delete(row)
  }
}

const saveRow = async (row) => {
  try {
    await new Promise((resolve, reject) => {
      emit('save', row, { resolve, reject })
    })

    if (row._backup) {
      delete row._backup
    }
    editingRows.value.delete(row)
    emit('update:modelValue', [...rows.value])
  } catch (err) {
    console.error('Erro ao salvar a linha:', err)
  }
}

const deleteRow = async (row) => {
  if (editingRows.value.size > 0 && !isEditing(row)) {
    alertError('Termine a edição atual antes de apagar outra linha.')
    return
  }

  try {
    await new Promise((resolve, reject) => {
      emit('delete', row, { resolve, reject })
    })

    rows.value = rows.value.filter(r => r !== row)
    editingRows.value.delete(row)
    emit('update:modelValue', [...rows.value])
  } catch (err) {
    console.error('Erro ao apagar a linha:', err)
  }
}
</script>
