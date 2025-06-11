<script setup>
import { ref } from 'vue'
import { useEditableTable } from 'src/composables/shared/table/useEditableTable'

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

const {
  rows,
  editingRows,
  isEditing,
  isEditingAnyRow,
  addRow,
  editRow,
  cancelEdit,
  saveRow,
  deleteRow,
  search,
  toggleStatus,
  visibleColumns
} = useEditableTable(props, emit)
</script>

<template>
  <q-card class="q-pa-none" flat bordered>
    <!-- Cabeçalho com título e ações -->
    <q-card-section class="text-h6 q-pa-none">
      <q-banner dense inline-actions class="text-primary bg-grey-3">
        <span class="text-subtitle2 text-primary">
          {{ props.title }}
        </span>
        <template #action>
          <!-- Campo de pesquisa -->
          <q-input
            outlined
            label="Pesquisar por Nome, descrição, Código"
            dense
            v-model="searchParams"
            @keyup.enter="search(searchParams)"
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

          <!-- Botão pesquisar -->
          <q-btn
            outline
            style="color: goldenrod;"
            dense
            icon="search"
            @click="search(searchParams)"
            :disable="isEditingAnyRow"
            class="q-ml-sm"
          >
            <q-tooltip class="bg-primary">Pesquisar</q-tooltip>
          </q-btn>

          <!-- Botão adicionar -->
          <q-btn
            outline
            style="color: goldenrod;"
            dense
            icon="add"
            class="q-ml-sm"
            @click="addRow"
            :disable="isEditingAnyRow"
          >
            <q-tooltip class="bg-primary">Criar novos {{ props.title }}</q-tooltip>
          </q-btn>
        </template>
      </q-banner>
    </q-card-section>

    <!-- Tabela -->
    <q-card-section class="q-pa-md">
      <q-table
        :rows="rows"
        :columns="props.columns"
        row-key="id"
        flat
        dense
        separator="horizontal"
        :pagination="props.pagination"
        @update:pagination="val => emit('update:pagination', val)"
        :rows-per-page-options="props.rowsPerPageOptions"
      >
        <!-- Colunas dinâmicas -->
        <template
          v-for="col in visibleColumns"
          :key="col.name"
          #[`body-cell-${col.name}`]="{ row }"
        >
          <q-td>
            <!-- LifeCycleStatus -->
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

            <!-- programId como select -->
            <template v-else-if="col.field === 'programId'">
              <template v-if="isEditing(row)">
                <q-select
                  v-model="row.programId"
                  :options="props.programOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  outlined
                  dense
                  placeholder="Selecionar programa"
                />
              </template>
              <template v-else>
                {{ row.program?.name || '—' }}
              </template>
            </template>

            <!-- serviceId como select -->
            <template v-else-if="col.field === 'serviceId'">
              <template v-if="isEditing(row)">
                <q-select
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
              </template>
              <template v-else>
                {{ props.serviceOptions?.find(s => s.value === row.serviceId)?.label || '—' }}
              </template>
            </template>

            <!-- Campo genérico (q-input) -->
            <template v-else>
              <template v-if="isEditing(row)">
                <q-input
                  v-model="row[col.field]"
                  dense
                  outlined
                  :placeholder="col.label"
                />
              </template>
              <template v-else>
                {{ row[col.field] }}
              </template>
            </template>
          </q-td>
        </template>

        <!-- Coluna de ações -->
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
              />
              <q-btn dense flat icon="edit" color="primary" @click="editRow(row)" />
              <q-btn dense flat icon="delete" color="red" @click="deleteRow(row)" />
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>
