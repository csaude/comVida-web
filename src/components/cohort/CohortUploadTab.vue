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
            class="col-3"
            dense
            outlined
            :disable="editProgramActivityId !== ''"
          />

          <q-select
            v-model="selectedService"
            :options="serviceOptions"
            option-label="label"
            option-value="value"
            label="Serviço"
            class="col-3"
            dense
            outlined
            :disable="editProgramActivityId !== '' || !selectedProgram"
          />

          <q-select
            v-model="selectedGroup"
            :options="groupOptions"
            option-label="name"
            option-value="id"
            label="Grupo"
            class="col-3"
            dense
            outlined
            :disable="!selectedService"
          />

          <q-select
            v-model="selectedSystem"
            :options="sourceSystemOptions"
            option-label="code"
            option-value="id"
            label="Sistema Fonte"
            class="col-3"
            dense
            outlined
            :disable="editSourceSystemId !== ''"
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
import { ref, computed, onMounted, watch, inject, nextTick } from 'vue'
import * as XLSX from 'xlsx'
import { useProgramStore } from 'src/stores/program/ProgramStore'
import { useProgramActivityStore } from 'src/stores/programActivity/ProgramActivityStore'
import { usePatientImportFileStore } from 'src/stores/patientImportFile/PatientImportFileStore'
import { PatientImportFile } from 'src/entities/patientImportFile/PatientImportFile.ts'
import { useSourceSystemStore } from 'src/stores/source/SourceSystemStore'
import { useCohortStore } from 'src/stores/cohort/useCohortStore'
import { useEligibilityCriteriaStore } from 'src/stores/eligibility/eligibilityCriteriaStore'
import { useGroupStore } from 'src/stores/group/groupStore'

const groupStore = useGroupStore()
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

// Fazendo inject do fileId e sourceSystemId (Para situacoes em que chegamos neste componente para recarregar listas)
const editSourceSystemId = inject('editSourceSystemId')
const editFileId = inject('editFileId')
const editProgramActivityId = inject('editProgramActivityId')
const selectedGroup = ref(null)

const sheetValidationErrors = ref([]) // sheets inválidas
const patientValidationErrors = ref([]) // erros nas linhas

const sourceSystemOptions = computed(
  () => sourceSystemStore.currentPageSourceSystems,
)
const cohorts = computed(() => cohortStore.getAllCohortsAcrossPages())
const eligibilityCriterias = computed(() =>
  eligibilityCriteriaStore.getAllCriteriasAcrossPages(),
)

const groupOptions = computed(() => {
  if (!selectedService.value) return []
  const allGroups = Object.values(groupStore.groupsPages).flat()
  return allGroups.filter(
    (group) => group.programActivity.id === selectedService.value.value,
  )
})

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
  console.log('uploadList: ', selectedGroup.value)
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
      const [groupName, cohortName] = sheetName.split('_') || []

      if (!groupName || !cohortName) {
        sheetValidationErrors.value.push(
          `"${sheetName}" está no formato inválido. Use "Grupo_Servico".`,
        )
      } else {
        const matchedGroup = groupOptions.value.find(
          (g) => g.name.trim().toLowerCase() === groupName.trim().toLowerCase(),
        )
        const matchedCohort = cohorts.value.find(
          (c) =>
            c.name.trim().toLowerCase() === cohortName.trim().toLowerCase(),
        )

        if (!matchedGroup) {
          sheetValidationErrors.value.push(
            `"${groupName}" não corresponde a nenhum Grupo para o serviço "${selectedService.value?.label}".`,
          )
        }

        if (!matchedCohort) {
          sheetValidationErrors.value.push(
            `"${cohortName}" não corresponde a nenhuma Cohort cadastrada.`,
          )
        }
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
    const importFile = new PatientImportFile({
      id: editFileId.value || null,
      name: file.value.name,
      status: 'PENDING',
      progress: 0,
      message: null,
      programActivity: {
        id: selectedService.value.value || selectedService.value.id,
      },
      sourceSystem: selectedSystem.value,
      group: selectedGroup.value ? { id: selectedGroup.value.id } : null,
    })

    if (editFileId.value) {
      // fluxo de atualização
      console.log('editFileId.value', editFileId.value)
      await importFileStore.updateImportFile(
        editFileId.value,
        importFile,
        file.value,
      )
    } else {
      // fluxo de criação
      await importFileStore.saveImportFile(importFile, file.value)
    }
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

watch(selectedService, () => {
  selectedGroup.value = null
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
    await cohortStore.fetchCohorts({ page: 0, size: 500 })
  }
  if (!eligibilityCriteriaStore.currentPageCriterias.length) {
    await eligibilityCriteriaStore.fetchCriterias({ page: 0, size: 500 })
  }
  if (!Object.keys(groupStore.groupsPages).length) {
    await groupStore.fetchGroups({ page: 0, size: 500 })
  }

  if (editSourceSystemId.value) {
    const matchedSystem = sourceSystemOptions.value.find(
      (sys) => sys.id === editSourceSystemId.value,
    )
    if (matchedSystem) {
      selectedSystem.value = matchedSystem
    }
  }

  if (editProgramActivityId.value) {
    const matchedActivity = activityStore.currentPageActivities.find(
      (act) => act.id === editProgramActivityId.value,
    )

    if (matchedActivity) {
      // Primeiro seleciona o programa
      const matchedProgram = programOptions.value.find(
        (prog) => prog.id === matchedActivity.program.id,
      )
      if (matchedProgram) {
        selectedProgram.value = matchedProgram

        // Aguarda a reatividade para atualizar o serviceOptions
        await nextTick()

        // Depois seleciona o serviço
        selectedService.value = serviceOptions.value.find(
          (serv) => serv.value === matchedActivity.id,
        )
      }
    }
  }
})
</script>

<style scoped></style>
