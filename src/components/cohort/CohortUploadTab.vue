<template>
  <div>
    <q-card flat bordered class="q-mb-md q-pa-none">
      <q-card-section class="q-pa-none">
        <q-banner
          dense
          inline-actions
          class="text-primary bg-grey-3 q-pa-none q-px-md q-py-xs"
        >
          <span class="text-weight-medium">
            Carregar Lista de Utentes para Seguimento Comunitário
          </span>
        </q-banner>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="text-caption text-grey-6 q-mb-md">
          Selecione o programa, serviço e Sistema Fonte para carregar a lista de
          utentes.
        </div>

        <div class="row q-col-gutter-md q-mb-md items-center">
          <q-select
            v-model="selectedProgram"
            :options="programOptions"
            option-label="name"
            option-value="id"
            label="Programa"
            class="col-4"
            dense
            outlined
          />

          <q-select
            v-model="selectedService"
            :options="serviceOptions"
            option-label="label"
            option-value="value"
            label="Serviço"
            class="col-4"
            dense
            outlined
          />

          <q-select
            v-model="selectedSystem"
            :options="sourceSystemOptions"
            option-label="code"
            option-value="id"
            label="Sistema Fonte"
            class="col-4"
            dense
            outlined
          />
        </div>

        <div class="text-subtitle1">Carregar Lista de Utentes</div>
        <q-file
          v-model="file"
          label="Selecionar ficheiro Excel"
          accept=".xls,.xlsx"
          outlined
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          label="Carregar"
          color="primary"
          :disable="!file"
          class="q-mb-md q-mr-sm"
          @click="uploadList"
        />
      </q-card-actions>

      <q-tabs
        v-if="
          sheetNames?.length > 0 &&
          sheetValidationErrors.length === 0 &&
          patientValidationErrors.length === 0
        "
        v-model="activeTab"
        class="q-mt-0 bg-grey-3 q-mx-md"
        dense
      >
        <q-tab
          v-for="(name, index) in sheetNames"
          :key="index"
          :name="name"
          :label="`${name} (${previewData[name]?.length || 0})`"
        />
      </q-tabs>

      <q-tab-panels
        v-model="activeTab"
        animated
        v-if="
          sheetNames?.length > 0 &&
          sheetValidationErrors.length === 0 &&
          patientValidationErrors.length === 0
        "
      >
        <q-tab-panel
          v-for="(name, index) in sheetNames"
          :key="index"
          :name="name"
        >
          <EditableTable
            :title="name"
            :model-value="previewData[name]"
            :columns="columnsPerSheet[name]"
            :program-options="programOptions"
            :service-options="serviceOptions"
            :pagination="tablePagination"
            :rows-per-page-options="[5, 10, 20]"
            @update:model-value="(val) => updateSheetData(name, val)"
          />
        </q-tab-panel>
      </q-tab-panels>

      <q-banner
        v-if="sheetValidationErrors.length > 0"
        dense
        class="bg-red-2 text-red-10 q-mx-md q-mb-md"
        icon="error"
      >
        <div class="text-subtitle2">Listas inválidas:</div>
        <ul class="q-pl-md">
          <li v-for="sheet in sheetValidationErrors" :key="sheet">
            {{ sheet }}
          </li>
        </ul>
      </q-banner>

      <q-card v-if="patientValidationErrors.length > 0" class="">
        <q-card-section>
          <div class="text-subtitle2 text-negative">
            Erros nos dados dos pacientes
          </div>
        </q-card-section>
        <q-markup-table dense class="q-mx-md">
          <thead>
            <tr>
              <th align="left">Nome</th>
              <th align="left">NID</th>
              <th align="left">UUID</th>
              <th align="left">Lista</th>
              <th align="left">Mensagem de Erro</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(err, idx) in patientValidationErrors" :key="idx">
              <td>{{ err.row }}</td>
              <td>{{ err.nid }}</td>
              <td>{{ err.uuid }}</td>
              <td>{{ err.name }}</td>
              <td v-html="err.message"></td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>

      <q-card-actions
        v-if="Object.keys(previewData).length && file"
        align="right"
      >
        <q-btn
          v-if="
            !hasErrors &&
            sheetValidationErrors.length === 0 &&
            patientValidationErrors.length === 0 &&
            patientValidationErrors.length === 0
          "
          :loading="saving"
          label="Gravar"
          color="secondary"
          class="q-mb-md q-mr-sm"
          @click="savePatientImportFile"
          :disable="hasErrors"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import * as XLSX from 'xlsx'
import { useProgramStore } from 'src/stores/program/ProgramStore'
import { useProgramActivityStore } from 'src/stores/programActivity/ProgramActivityStore'
import { usePatientImportFileStore } from 'src/stores/patientImportFile/PatientImportFileStore'
import { PatientImportFile } from 'src/entities/patientImportFile/PatientImportFile.ts'
import { useSourceSystemStore } from 'src/stores/source/SourceSystemStore'
import { useCohortStore } from 'src/stores/cohort/useCohortStore'
import { useEligibilityCriteriaStore } from 'src/stores/eligibility/eligibilityCriteriaStore'

const importFileStore = usePatientImportFileStore()
const sourceSystemStore = useSourceSystemStore()
const programStore = useProgramStore()
const activityStore = useProgramActivityStore()
const cohortStore = useCohortStore()
const eligibilityCriteriaStore = useEligibilityCriteriaStore()

const hasErrors = computed(() => {
  if (sheetValidationErrors.value.length > 0) return true

  return Object.values(previewData.value).some((rows) =>
    rows.some((row) => row.Mensagem && row.Mensagem.trim() !== ''),
  )
})

const sheetValidationErrors = ref([]) // sheets inválidas
const patientValidationErrors = ref([]) // erros nas linhas

const sourceSystemOptions = computed(
  () => sourceSystemStore.currentPageSourceSystems,
)
const cohorts = computed(() => cohortStore.getAllCohortsAcrossPages())
const eligibilityCriterias = computed(() =>
  eligibilityCriteriaStore.getAllCriteriasAcrossPages(),
)
const selectedProgram = ref(null)
const selectedService = ref(null)
const selectedSystem = ref(null)
const file = ref(null)
const previewData = ref({})
const columnsPerSheet = ref({})
const sheetNames = ref([])
const activeTab = ref(null)
const tablePagination = ref({ page: 1, rowsPerPage: 5 })
const saving = ref(false)

const programOptions = computed(() => programStore.currentPagePrograms)
const serviceOptions = computed(() => {
  if (!selectedProgram.value) return []
  const currentActivities =
    activityStore.activitiesPages[activityStore.pagination.currentPage] || []
  return currentActivities
    .filter((act) => act.program.id === selectedProgram.value.id)
    .map((act) => ({ label: act.name, value: act.id }))
})

function generateColumns(rows) {
  if (!rows?.length) return []
  const columns = Object.keys(rows[0]).map((key) => ({
    name: key,
    field: key,
    label: key,
    align: 'left',
  }))

  // Garantir que coluna "Mensagem" esteja presente
  if (!columns.find((c) => c.name === 'Mensagem')) {
    columns.push({
      name: 'Mensagem',
      field: 'Mensagem',
      label: 'Mensagem',
      align: 'left',
    })
  }

  return columns
}

function validateEligibilityCategories(sheetData) {
  const selectedActivityId =
    selectedService.value?.id || selectedService.value?.value
  if (!selectedActivityId) return sheetData

  return sheetData.map((row) => {
    const rawCategorias = row['categoria_de_elegibilidade']
    const categorias = rawCategorias
      ? rawCategorias
          .split(',')
          .map((cat) => cat.trim())
          .filter(Boolean)
      : []

    const mensagens = []

    for (const categoria of categorias) {
      const match = eligibilityCriterias.value.find(
        (ec) =>
          ec.criteria?.toLowerCase().trim() === categoria.toLowerCase() &&
          ec.programActivity?.id === selectedActivityId,
      )

      if (!match) {
        mensagens.push(
          `Critério "${categoria}" não pertence à atividade selecionada`,
        )
      }
    }

    return {
      ...row,
      Mensagem: mensagens.join('; '),
    }
  })
}

function uploadList() {
  if (!file.value) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result)
    const workbook = XLSX.read(data, { type: 'array' })

    const sheetsData = {}
    const sheetsColumns = {}

    sheetValidationErrors.value = []
    patientValidationErrors.value = []

    const allNids = new Set()

    workbook.SheetNames.forEach((sheetName) => {
      const matchedCohort = cohorts.value.find(
        (c) => c.name.trim().toLowerCase() === sheetName.trim().toLowerCase(),
      )
      if (!matchedCohort) {
        sheetValidationErrors.value.push(
          `"${sheetName}" (não corresponde a nenhuma Cohort cadastrada para o serviço "${selectedService.value?.label}")`,
        )
        // return
      }

      const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        defval: '',
      })

      const validatedRows = []
      for (const row of rawData) {
        const mensagens = []

        // Validação de categorias de elegibilidade
        const rawCategorias = row['categoria_de_elegibilidade']
        const categorias = rawCategorias
          ? rawCategorias
              .split(',')
              .map((cat) => cat.trim())
              .filter(Boolean)
          : []

        const selectedActivityId =
          selectedService.value?.id || selectedService.value?.value

        for (const categoria of categorias) {
          const match = eligibilityCriterias.value.find(
            (ec) =>
              ec.criteria?.toLowerCase().trim() === categoria.toLowerCase() &&
              ec.programActivity?.id === selectedActivityId,
          )

          if (!match) {
            mensagens.push(
              `Categoria de elegibilidade "${categoria}" não pertence ao serviço selecionado (${selectedService.value?.label});`,
            )
          }
        }

        // Adiciona erro à tabela de erros por paciente
        if (mensagens.length > 0) {
          patientValidationErrors.value.push({
            row: `${row.nome || ''} ${row.apelido || ''}`.trim(),
            nid: row.nid || '-',
            name: sheetName,
            uuid: row.uuid || '-',
            message: mensagens.join('<br>'),
          })
        }

        // Adiciona a mensagem ao dado também (para aparecer na tabela se necessário)
        validatedRows.push({
          ...row,
          Mensagem: mensagens.join('; '),
        })
      }
      console.log('patientValidationErrors', patientValidationErrors.value)

      sheetsData[sheetName] = validatedRows
      sheetsColumns[sheetName] = generateColumns(validatedRows)
    })

    previewData.value = sheetsData
    columnsPerSheet.value = sheetsColumns
    sheetNames.value = Object.keys(sheetsData)
    activeTab.value = sheetNames.value[0] || null
  }

  reader.readAsArrayBuffer(file.value)
}

function updateSheetData(sheetName, data) {
  previewData.value[sheetName] = data
}

async function savePatientImportFile() {
  if (!file.value || !selectedService.value || !selectedSystem.value) {
    return
  }

  saving.value = true
  try {
    console.log('Salvando ficheiro de importação:', selectedSystem.value)
    const importFile = new PatientImportFile({
      name: file.value.name,
      status: 'PENDING',
      progress: 0,
      message: null,
      programActivity: {
        id: selectedService.value.value || selectedService.value.id,
      },
      sourceSystem: selectedSystem.value,
    })

    const saved = await importFileStore.saveImportFile(importFile, file.value)
  } catch (err) {
    console.error('❌ Erro ao importar ficheiro:', err)
  } finally {
    saving.value = false
  }
}

watch(file, () => {
  previewData.value = {}
  columnsPerSheet.value = {}
  sheetNames.value = []
  activeTab.value = null
})

watch(selectedProgram, () => {
  selectedService.value = null
})

onMounted(async () => {
  if (!programStore.currentPagePrograms.length) {
    await programStore.fetchPrograms()
  }
  if (!activityStore.currentPageActivities.length) {
    await activityStore.fetchActivities({ page: 0, size: 100 })
  }
  if (!sourceSystemStore.currentPageSourceSystems.length) {
    await sourceSystemStore.fetchSourceSystems()
  }
  if (!cohortStore.currentPageCohorts.length) {
    console.log('Fetching cohorts on mount')
    await cohortStore.fetchCohorts({ page: 0, size: 500 })
  }
  if (!eligibilityCriteriaStore.currentPageCriterias.length) {
    await eligibilityCriteriaStore.fetchCriterias({ page: 0, size: 500 })
  }
})
</script>

<style scoped></style>
