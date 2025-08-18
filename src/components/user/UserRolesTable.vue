<template>
  <EditableTable
    v-model="rows"
    title="Perfis e Permissões de Acesso"
    :columns="columns"
    :loading="loading"
    v-model:pagination="pagination"
    :rows-per-page-options="[5, 10, 20, 50]"
    :confirm-error="alertError"
    :confirm-delete="alertWarningAction"
    :use-external-edit="false"
    :use-external-add="false"
    :program-options="programOptions"
    :program-activity-options="programActivityOptions"
    :role-options="roleOptions"
    :select-options="{ programOptions, programActivityOptions, roleOptions }"
    :extra-actions="roleExtraActions"
    @save="(row, { resolve, reject }) => onSave(row).then(resolve).catch(reject)"
    @delete="(row, { resolve, reject }) => onDelete(row).then(resolve).catch(reject)"
    @manage-groups="openGroupsDialog"
    @search="onSearch"
    @toggle-status="() => {}"
  />

  <!-- Manage groups dialog -->
  <q-dialog v-model="showGroupsDialog" persistent>
    <q-card style="min-width: 640px; max-width: 80vw">
      <q-card-section dense class="row items-center q-py-sm  bg-primary text-white">
        <div class="text-weight-medium">Grupos para o perfil</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="closeGroupsDialog" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-gutter-md">
        <div class="text-subtitle2">
          <q-chip square>
            <q-avatar color="red" text-color="white">P</q-avatar>
            Programa: <strong>{{ dialogRow?.programName || '—' }}</strong>
          </q-chip>
        
          <q-chip square>
            <q-avatar color="amber-10" text-color="white">S</q-avatar>
            Serviço: <strong>{{ dialogRow?.programActivityName || '—' }}</strong>
          </q-chip>

          <q-chip square>
            <q-avatar color="green-10" text-color="white">F</q-avatar>
            Função:
          <strong>{{ dialogRow?.roleName || '—' }}</strong>
          </q-chip>
        </div>

        <q-select
          v-model="selectedGroupUuids"
          :options="groupOptionsForDialog"
          label="Grupos"
          multiple
          use-chips
          emit-value
          map-options
          outlined
          dense
          :loading="loadingGroups"
          :disable="!dialogRow"
          hint="Selecione um ou mais grupos para associar a este perfil"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn color="red" dense label="Cancelar" @click="closeGroupsDialog" />
        <q-btn color="primary" dense label="Guardar" @click="applyGroupsToRow" />
      </q-card-actions>
    </q-card>
    
  </q-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useProgramStore } from 'src/stores/program/ProgramStore'
import { useProgramActivityStore } from 'src/stores/programActivity/ProgramActivityStore'
import { useRoleStore } from 'src/stores/role/role'
import { useSwal } from 'src/composables/shared/dialog/dialog'
import { useApiErrorHandler } from 'src/composables/shared/error/useApiErrorHandler'
import { useGroupStore } from 'src/stores/group/groupStore' // ← adjust if your path/name differs

type Row = {
  /** Stable key used by the table. We set it = composite key when complete, else temp id. */
  id?: string
  programId: number | null
  programActivityId: number | null
  roleUuid: string | null

  // groups for this role in this service
  groupUuids?: string[]
  groupNames?: string[]        // display-only (derived)

  // display-only (derived)
  programName?: string
  programActivityName?: string
  roleName?: string

  // legacy compat
  serviceId?: number | null
  role?: string | null
}

const norm = (v: any) =>
  v === null || v === undefined || v === '' ? '' : String(+v)

const keyOf = (x: Partial<Row>) =>
  `${norm(x.programId)}|${norm(x.programActivityId)}|${x.roleUuid ?? ''}`

const props = defineProps<{
  modelValue: Row[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: Row[]): void
}>()

const { alertWarningAction, alertError } = useSwal()
const { handleApiError } = useApiErrorHandler()

const programStore = useProgramStore()
const activityStore = useProgramActivityStore()
const roleStore = useRoleStore()
const groupStore = useGroupStore()

const loading = computed(() => props.loading ?? false)

/* ---------- Select options ---------- */
const programOptions = computed(() =>
  programStore.currentPagePrograms
    .filter(p => p.lifeCycleStatus === 'ACTIVE')
    .map(p => ({ label: p.name, value: p.id }))
)

const programActivityOptions = computed(() =>
  activityStore.currentPageActivities
    .filter(a => a.lifeCycleStatus === 'ACTIVE')
    .map(a => ({
      label: a.name,
      value: a.id,
      programId: a.program?.id ?? null
    }))
)

const roleOptions = computed(() =>
  roleStore.currentPageRoles
    .filter(r => r.lifeCycleStatus === 'ACTIVE')
    .map(r => ({ label: r.name, value: r.uuid }))
)

/* Extra action: Manage groups per row */
const roleExtraActions = [
  {
    icon: 'groups',
    tooltip: 'Gerir Grupos',
    color: 'primary',
    emit: 'manage-groups'
  }
]

/* ---------- Columns ---------- */
const columns = [
  {
    name: 'programId',
    label: 'Programa',
    field: 'programName',
    align: 'left',
    editType: 'select',
    editOptionsKey: 'programOptions',
    editValueField: 'programId',
    placeholder: 'Selecione o programa',
    required: true
  },
  {
    name: 'programActivityId',
    label: 'Serviço',
    field: 'programActivityName',
    align: 'left',
    editType: 'select',
    editOptionsKey: 'programActivityOptions',
    editValueField: 'programActivityId',
    placeholder: 'Selecione o serviço',
    dependsOn: 'programId',
    matchField: 'programId',
    required: true,
    // example: lock service when role already chosen
    disabled: ({ row }) => !!row.roleUuid
  },
  {
    name: 'roleUuid',
    label: 'Função',
    field: 'roleName',
    align: 'left',
    editType: 'select',
    editOptionsKey: 'roleOptions',
    editValueField: 'roleUuid',
    placeholder: 'Selecione a função',
    required: true
  },
  {
    name: 'groups',
    label: 'Grupos',
    field: (row) => (row.groupNames?.length ? row.groupNames.join(', ') : ''),
    align: 'left',
    editable: false,       // OR: hideInEdit: true
  },
  { name: 'actions', label: 'Opções', align: 'center' }
]

/* ---------- v-model bridge ---------- */
let tmpSeq = 0
const tmpId = () => `tmp-${Date.now().toString(36)}-${tmpSeq++}`

function normalizeRows (arr?: Row[]): Row[] {
  const list = Array.isArray(arr) ? arr.map(r => ({ ...r })) : []

  for (const r of list) {
    // legacy compat
    if (r.programActivityId == null && r.serviceId != null) r.programActivityId = r.serviceId
    if (r.roleUuid == null && r.role != null) r.roleUuid = r.role as any

    // stable row-key: composite when complete, otherwise keep/create temp
    const complete = r.programId != null && r.programActivityId != null && !!r.roleUuid
    r.id = complete ? keyOf(r) : r.id ?? tmpId()

    // defaults
    if (!Array.isArray(r.groupUuids)) r.groupUuids = []
    if (!Array.isArray(r.groupNames)) r.groupNames = []

    // derived labels
    r.programName =
      programStore.currentPagePrograms.find(p => p.id === r.programId)?.name || ''
    r.programActivityName =
      activityStore.currentPageActivities.find(a => a.id === r.programActivityId)?.name || ''
    r.roleName =
      roleStore.currentPageRoles.find(x => x.uuid === r.roleUuid)?.name || ''
  }
  return list
}

const rows = computed<Row[]>({
  get: () => normalizeRows(props.modelValue),
  set: (v) => {
    // de-duplicate by composite key (keep first occurrence)
    const seen = new Set<string>()
    const unique = v.filter(r => {
      const k = keyOf(r)
      if (!k) return true // allow incomplete rows while editing
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    // strip only display fields, keep id, ids, and groups
    const clean = unique.map(({ programName, programActivityName, roleName, ...rest }) => rest as Row)
    emit('update:modelValue', clean)
  }
})

/* ---------- Pagination (client-side) ---------- */
const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: props.modelValue?.length ?? 0
})

function refreshDerivedNames (row: Row) {
  row.programName =
    programStore.currentPagePrograms.find(p => p.id === row.programId)?.name || ''
  row.programActivityName =
    activityStore.currentPageActivities.find(a => a.id === row.programActivityId)?.name || ''
  row.roleName =
    roleStore.currentPageRoles.find(x => x.uuid === row.roleUuid)?.name || ''
}

/* ---------- Lifecycle ---------- */
onMounted(async () => {
  try {
    if (programStore.currentPagePrograms.length === 0) {
      await programStore.fetchPrograms({ page: 0, size: 100 })
    }
    if (activityStore.currentPageActivities.length === 0) {
      await activityStore.fetchActivities({ page: 0, size: 100 })
    }
    if (roleStore.currentPageRoles.length === 0) {
      await roleStore.fetchRoles({ page: 0, size: 100 })
    }
  } catch (e: any) {
    handleApiError(e, 'Erro ao carregar dados de programas/serviços/funções')
  }
})

/* ---------- Save/Delete (composite key) ---------- */
const onSave = async (row: Row) => {
  if (!row.programId)         throw new Error('Selecione o Programa.')
  if (!row.programActivityId) throw new Error('Selecione o Serviço.')
  if (!row.roleUuid)          throw new Error('Selecione a Função.')

  const k = keyOf(row)                 // composite key for row being saved
  const selfKey = row.id ?? k          // stable identity for *this* row

  // check against parent v-model (committed) OR local table view (on-screen)
  const isDupIn = (list: Row[] | undefined) =>
    (list ?? []).some(r => {
      const otherK   = keyOf(r)
      if (!otherK) return false
      const otherId  = (r as any).id ?? otherK
      const sameRow  = otherId === selfKey       // exclude the same logical row (edits)
      return !sameRow && otherK === k
    })

  const dup = isDupIn(props.modelValue) || isDupIn(rows.value)
  if (dup) {
    // show message and reject so EditableTable keeps the row in edit mode
    alertError('Já existe um registo com o mesmo Programa/Serviço/Função.')
    throw new Error('Já existe um registo com o mesmo Programa/Serviço/Função.')
  }

  // lock stable id once complete and refresh labels
  row.id = k
  refreshDerivedNames(row)

  // return updated row to the table resolver
  return { ...row }
}


const onDelete = async (row: Row) => {
  const k = keyOf(row)
  rows.value = rows.value.filter(r => keyOf(r) !== k)
}

function onSearch (_term: string) {
  // no remote filtering; kept for EditableTable compatibility
}

/* ---------- Manage Groups per row ---------- */
const showGroupsDialog = ref(false)
const dialogRow = ref<Row | null>(null)
const selectedGroupUuids = ref<string[]>([])
const loadingGroups = ref(false)

/** Options for the dialog (groups filtered by the row's programActivity) */
const groupOptionsForDialog = computed(() => {
  const paId = dialogRow.value?.programActivityId
  if (!paId) return []
  return groupStore.currentPageGroups
    .filter(g => g.programActivity?.id === paId && g.lifeCycleStatus === 'ACTIVE')
    .map(g => ({ label: g.name, value: g.uuid }))
})

async function openGroupsDialog (row: Row) {
  try {
    dialogRow.value = row
    selectedGroupUuids.value = Array.isArray(row.groupUuids) ? [...row.groupUuids] : []

    // fetch groups for this ProgramActivity (adjust to your API/store)
    loadingGroups.value = true
    await groupStore.fetchGroups({ page: 0, size: 200, programActivityId: row.programActivityId })
    loadingGroups.value = false

    showGroupsDialog.value = true
  } catch (e) {
    loadingGroups.value = false
    handleApiError(e, 'Erro ao carregar grupos')
  }
}

function closeGroupsDialog () {
  showGroupsDialog.value = false
  dialogRow.value = null
  selectedGroupUuids.value = []
}

function applyGroupsToRow () {
  if (!dialogRow.value) return

  const key = dialogRow.value.id ?? keyOf(dialogRow.value)

  const groupNames = selectedGroupUuids.value
    .map(uuid => groupStore.currentPageGroups.find(g => g.uuid === uuid)?.name)
    .filter(Boolean) as string[]

  // create an updated copy of the row
  const updated = {
    ...dialogRow.value,
    groupUuids: [...selectedGroupUuids.value],
    groupNames
  }

  // IMPORTANT: assign a new array so the computed setter runs
  rows.value = rows.value.map(r =>
    ((r.id ?? keyOf(r)) === key) ? updated : r
  )

  showGroupsDialog.value = false
}

</script>
