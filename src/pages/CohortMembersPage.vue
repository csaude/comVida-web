<template>
  <div class="q-pa-md">
    <!-- Banner -->
    <q-banner class="bg-grey-2 text-primary q-mb-md">
      Alocar Membros da Lista: {{ listName }}
    </q-banner>

    <!-- Barra de Ações Globais -->
    <div class="q-mb-sm flex items-center justify-between">
      <div class="text-caption">Total de membros: {{ members.length }}</div>
      <q-btn
        color="primary"
        icon="group_add"
        label="Alocar Selecionados"
        :disable="selected.length === 0"
        @click="openVolunteerDialog(true)"
        dense
      />
    </div>

    <!-- Tabela -->
    <q-table
      :rows="members"
      :columns="columns"
      :loading="loading"
      row-key="uuid"
      selection="multiple"
      v-model:selected="selected"
      flat
      bordered
    >
      <!-- Slot customizado para a coluna 'allocatedTo' -->
      <template #body-cell-allocatedTo="props">
        <q-td :props="props">
          <span :class="!props.row.assignedByUser ? 'text-negative' : ''">
            {{
              props.row.assignedByUser?.fullName ||
              (props.row.assignedByUser?.firstName &&
              props.row.assignedByUser?.lastName
                ? `${props.row.assignedByUser.firstName} ${props.row.assignedByUser.lastName}`
                : 'Não alocado')
            }}
          </span>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="flex items-center justify-center gap-x-sm">
            <q-toggle
              dense
              v-model="props.row.active"
              color="green"
              @update:model-value="toggleMemberStatus(props.row)"
            />
            <q-btn
              class="q-ml-md"
              dense
              flat
              round
              icon="person_add"
              color="primary"
              @click="openVolunteerDialog(false, props.row)"
            >
              <q-tooltip>Alocar Voluntário</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo para Alocar Voluntário -->
    <q-dialog v-model="volunteerDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Selecionar Voluntário</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="selectedVolunteer"
            :options="colunteerUsers"
            option-label="name"
            option-value="id"
            label="Voluntário"
            outlined
            dense
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            label="Confirmar"
            @click="confirmAllocation"
            :disable="!selectedVolunteer"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useCohortMemberStore } from 'stores/cohort/useCohortMemberStore'
import { DateUtils } from 'src/utils/DateUtils'
import { useUserStore } from 'src/stores/user/userStore'

const props = defineProps({
  cohortId: { type: [String, Number], required: true },
  fileId: { type: [String, Number], required: false },
  listName: { type: String, required: true },
})

const userStore = useUserStore()
const store = useCohortMemberStore()
const loading = ref(false)
const selected = ref([])

// Colunas
const columns = [
  {
    name: 'patient',
    label: 'Paciente',
    field: (row) => row.patient?.fullName || '-',
    sortable: true,
    align: 'left',
  },
  {
    name: 'allocatedTo',
    label: 'Alocado para',
    field: (row) =>
      row.assignedByUser?.fullName ||
      (row.assignedByUser?.firstName && row.assignedByUser?.lastName
        ? `${row.assignedByUser.firstName} ${row.assignedByUser.lastName}`
        : 'Não alocado'),
    sortable: true,
    align: 'left',
  },
  {
    name: 'inclusionDate',
    label: 'Data de Inclusão',
    field: 'inclusionDate',
    sortable: true,
    align: 'left',
  },
  {
    name: 'exclusionDate',
    label: 'Data de Exclusão',
    field: 'exclusionDate',
    sortable: true,
    align: 'left',
  },
  {
    name: 'sourceSystem',
    label: 'Sistema de Origem',
    field: 'originId',
    sortable: true,
    align: 'left',
  },
  {
    name: 'actions',
    label: 'Acções',
    field: 'actions',
    align: 'center',
  },
]

// Lista de voluntários fake
const colunteerUsers = computed(() =>
  userStore.volunteerUsers.map((u) => ({
    id: u.id,
    name: u.fullName || `${u.firstName} ${u.lastName}`,
  })),
)

// Controle do diálogo
const volunteerDialog = ref(false)
const selectedVolunteer = ref(null)
const allocationForAll = ref(false)
let targetMember = null

function openVolunteerDialog(forAll, member = null) {
  allocationForAll.value = forAll
  targetMember = member
  selectedVolunteer.value = null
  volunteerDialog.value = true
}

const members = computed(() =>
  store.currentPageCohortMembers.map((item) => ({
    ...item,
    inclusionDate: item.inclusionDate
      ? DateUtils.formatDateToDDMMYYYY(item.inclusionDate)
      : '-',
    exclusionDate: item.exclusionDate
      ? DateUtils.formatDateToDDMMYYYY(item.exclusionDate)
      : '-',
    active: true,
  })),
)

async function confirmAllocation() {
  if (!selectedVolunteer.value) return

  try {
    if (allocationForAll.value) {
      await store.allocateMembers(
        selected.value.map((m) => m.id),
        selectedVolunteer.value.id, // ✅ passa id, não array
      )
    } else if (targetMember) {
      await store.allocateMembers(
        [targetMember.id],
        selectedVolunteer.value.id, // ✅ corrigido
      )
    }

    volunteerDialog.value = false
  } catch (error) {
    console.error('Erro na alocação:', error)
  }
}

function toggleMemberStatus(member) {
  // Aqui você chamaria sua API para atualizar
}

onMounted(async () => {
  await userStore.fetchFocalPointUsers()
  console.log('Focal Points:', userStore.volunteerUsers)
  loading.value = true
  await store.fetchCohortMembers({
    cohortId: Number(props.cohortId),
    fileId: props.fileId ? Number(props.fileId) : undefined,
  })

  loading.value = false
})
</script>
