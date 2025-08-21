<template>
  <q-card flat bordered class="q-pa-none">
    <q-card-section class="q-pa-none">
      <q-banner dense inline-actions class="text-white bg-primary">
        <span class="text-weight-medium">
          {{ user.id ? 'Editar Utilizador' : 'Cadastro de Utilizador' }}
        </span>
        <template #action>
          <q-btn dense flat round color="white" icon="close" @click="$emit('cancel')" />
        </template>
      </q-banner>
    </q-card-section>

    <q-separator />

    <q-form class="q-gutter-md q-px-md q-mt-md" @submit.prevent="submitForm">
      <q-card-section>
        <!-- Nome / Apelido -->
        <div class="row q-gutter-md q-mb-md">
          <q-input v-model="user.name" label="Nome" class="col" outlined dense />
          <q-input v-model="user.surname" label="Apelido" class="col" outlined dense />
        </div>

        <!-- Username / Password -->
        <div class="row q-gutter-md q-mb-md">
          <q-input v-model="user.username" label="Username" class="col-5" outlined dense />
          <q-input v-model="user.password" type="password" label="Password" class="col-3" outlined dense />
          <q-input v-model="passwordConfirm" type="password" label="Confirme a Password" class="col" outlined dense />
        </div>

        <!-- Toggle Sistema Integrado -->
        <div class="row items-center q-gutter-md q-mb-md">
          <q-checkbox v-model="usesIntegratedSystem" label="Usa um Sistema Integrado?" />
        </div>

        <!-- Sistema Integrado / ID -->
        <div class="row q-gutter-md">
          <q-select
            v-model="user.integratedSystem"
            :options="integratedSystems"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            label="Sistema Integrado"
            class="col-4"
            outlined
            dense
            :disable="!usesIntegratedSystem"
            :rules="usesIntegratedSystem ? [val => !!val || 'Obrigatório'] : []"
          />
          <q-input
            v-model="user.idOnIntegratedSystem"
            label="ID No Sistema Integrado"
            class="col-4"
            outlined
            dense
            :disable="!usesIntegratedSystem"
            :rules="usesIntegratedSystem ? [val => !!val || 'Obrigatório'] : []"
          />
        </div>

        <!-- Perfis/Permissões (UI rows) -->
        <div class="q-mt-lg">
          <UserRolesTable v-model="user.roles" />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn label="Cancelar" color="red" outlined @click="$emit('cancel')" />
        <q-btn label="Gravar" type="submit" color="primary" :loading="saving" :disable="saving" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useUserStore } from 'src/stores/user/userStore'
import { useGroupStore } from 'src/stores/group/groupStore'   // ⬅️ NEW
import { useSwal } from 'src/composables/shared/dialog/dialog'
import { useApiErrorHandler } from 'src/composables/shared/error/useApiErrorHandler'
import UserRolesTable from './UserRolesTable.vue'

type RoleRow = {
  programId: number | null
  programActivityId: number | null
  roleUuid: string | null
  lifeCycleStatus?: string
  groupUuids?: string[]
  groupNames?: string[]   // ⬅️ NEW
  id?: string             // ⬅️ útil para UI
}

type UserServiceRoleDTO = {
  programId: number
  programActivityId: number
  roleUuid: string
  groupUuids: string[]
  lifeCycleStatus: string
}

const props = defineProps({
  modelValue: { type: Object as () => any, default: null }
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'cancel'): void
}>()

const userStore = useUserStore()
const groupStore = useGroupStore()                // ⬅️ NEW
const { alertSucess, alertError } = useSwal()
const { handleApiError } = useApiErrorHandler()

const user = ref<{
  id: number | null
  name: string
  surname: string
  username: string
  password: string
  integratedSystem: number | null
  idOnIntegratedSystem: string
  roles: RoleRow[]
}>({
  id: null,
  name: '',
  surname: '',
  username: '',
  password: '',
  integratedSystem: null,
  idOnIntegratedSystem: '',
  roles: []
})

const passwordConfirm = ref('')
const usesIntegratedSystem = ref(false)
const saving = ref(false)

/** Systems list (ids só para UI; name vai no atributo) */
const integratedSystems = [
  { id: 1, name: 'OPENMRS' },
  { id: 2, name: 'DHIS2' },
  { id: 3, name: 'IDART' }
]
const getSystemNameById = (id?: number | null) =>
  integratedSystems.find(s => s.id === id)?.name ?? null
const getSystemIdByName = (name?: string | null) =>
  integratedSystems.find(s => s.name === name)?.id ?? null

/** Utils */
const uniq = <T,>(arr: T[]) => Array.from(new Set(arr))

function extractGroupUuids(u: any): string[] {
  const out: string[] = []
  if (Array.isArray(u.groupUuids)) out.push(...u.groupUuids.map((v: any) => String(v ?? '').trim()).filter(Boolean))
  if (Array.isArray(u.userServiceRoleGroups)) {
    out.push(
      ...u.userServiceRoleGroups
        .map((g: any) => g?.uuid ?? g?.groupUuid ?? g?.group?.uuid ?? null)
        .filter((v: any): v is string => typeof v === 'string' && v.trim().length > 0)
        .map((s: string) => s.trim())
    )
  }
  if (Array.isArray(u.groups)) {
    out.push(
      ...u.groups
        .map((g: any) => g?.uuid ?? g?.groupUuid ?? g?.group?.uuid ?? null)
        .filter((v: any): v is string => typeof v === 'string' && v.trim().length > 0)
        .map((s: string) => s.trim())
    )
  }
  return uniq(out)
}

function extractGroupNames(u: any): string[] {
  const out: string[] = []
  if (Array.isArray(u.groupNames)) out.push(...u.groupNames.map((v: any) => String(v ?? '').trim()).filter(Boolean))
  if (Array.isArray(u.userServiceRoleGroups)) {
    out.push(
      ...u.userServiceRoleGroups
        .map((g: any) => g?.group?.name ?? g?.name ?? null)
        .filter((v: any): v is string => typeof v === 'string' && v.trim().length > 0)
        .map((s: string) => s.trim())
    )
  }
  if (Array.isArray(u.groups)) {
    out.push(
      ...u.groups
        .map((g: any) => g?.name ?? g?.group?.name ?? null)
        .filter((v: any): v is string => typeof v === 'string' && v.trim().length > 0)
        .map((s: string) => s.trim())
    )
  }
  return uniq(out)
}

/** Index dos grupos em cache (uuid -> name) */
function groupsIndexFromStore(): Record<string, string> {
  const index: Record<string, string> = {}
  const add = (gs: any[]) => {
    for (const g of gs) {
      const uuid = g?.uuid
      const name = g?.name
      if (uuid && name && !index[uuid]) index[uuid] = name
    }
  }
  // páginas já carregadas
  Object.values(groupStore.groupsPages).forEach(add)
  add(groupStore.currentPageGroups)
  return index
}

/** Garante groupNames usando o GroupStore (busca se necessário) */
async function ensureGroupNamesForRoles(roles: RoleRow[]) {
  if (!Array.isArray(roles) || roles.length === 0) return

  // uuids ainda sem nome
  const missing = new Set<string>()
  for (const r of roles) {
    const uuids = r.groupUuids ?? []
    const names = new Set(r.groupNames ?? [])
    const idx = groupsIndexFromStore()
    for (const u of uuids) {
      const n = idx[u]
      if (n) names.add(n)
      else missing.add(u)
    }
    r.groupNames = uniq(Array.from(names))
  }

  if (missing.size === 0) return

  // tentar carregar mais grupos (uma busca ampla)
  try {
    await groupStore.fetchGroups({ page: 0, size: 1000, ignoreCache: true })
    const idx = groupsIndexFromStore()
    for (const r of roles) {
      const names = new Set(r.groupNames ?? [])
      for (const u of r.groupUuids ?? []) {
        const n = idx[u]
        if (n) names.add(n)
      }
      r.groupNames = uniq(Array.from(names))
    }
  } catch {
    /* silencioso: se falhar, apenas deixamos os names vazios */
  }
}

/** Normaliza & deduplica roles para o envio */
const userServiceRoles = computed<UserServiceRoleDTO[]>(() => {
  const out: UserServiceRoleDTO[] = []
  const seen = new Set<string>()
  for (const r of user.value.roles ?? []) {
    const pid = r?.programId ?? null
    const paid = r?.programActivityId ?? null
    const rid = r?.roleUuid ?? null
    if (!pid || !paid || !rid) continue
    const key = `${pid}|${paid}|${rid}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({
      programId: pid,
      programActivityId: paid,
      roleUuid: rid,
      groupUuids: uniq(r.groupUuids ?? []),
      lifeCycleStatus: r.lifeCycleStatus || 'ACTIVE'
    })
  }
  return out
})

watch(usesIntegratedSystem, enabled => {
  if (!enabled) {
    user.value.integratedSystem = null
    user.value.idOnIntegratedSystem = ''
  }
})

/** Prefill edição / reset criação */
watch(
  () => props.modelValue,
  async (val: any) => {
    if (val) {
      // de attributes[type=integratedSystem]
      const att = Array.isArray(val.attributes)
        ? val.attributes.find((a: any) => a?.type === 'integratedSystem')
        : null

      const roles: RoleRow[] = Array.isArray(val.roles)
        ? [...val.roles]
        : Array.isArray(val.userServiceRoles)
          ? val.userServiceRoles.map((u: any) => {
              const programId = u.programId ?? u.program?.id ?? null
              const programActivityId = u.programActivityId ?? u.programActivity?.id ?? null
              const roleUuid = u.roleUuid ?? u.role?.uuid ?? null

              const groupUuids = extractGroupUuids(u)
              const groupNames = extractGroupNames(u)

              return {
                programId,
                programActivityId,
                roleUuid,
                lifeCycleStatus: u.lifeCycleStatus ?? 'ACTIVE',
                groupUuids,
                groupNames,
                id: programId && programActivityId && roleUuid
                  ? `${programId}|${programActivityId}|${roleUuid}`
                  : undefined
              }
            })
          : []

      user.value = {
        id: val.id ?? null,
        name: val.name ?? val.firstName ?? '',
        surname: val.surname ?? val.lastName ?? '',
        username: val.username ?? '',
        password: '',
        integratedSystem: getSystemIdByName(att?.integratedSystemName ?? null),
        idOnIntegratedSystem: att?.idOnIntegratedSystem ?? '',
        roles
      }

      usesIntegratedSystem.value = !!att
      passwordConfirm.value = ''

      // ⬅️ NEW: se faltar nomes dos grupos, tentar resolver via store
      await ensureGroupNamesForRoles(user.value.roles)
    } else {
      user.value = {
        id: null,
        name: '',
        surname: '',
        username: '',
        password: '',
        integratedSystem: null,
        idOnIntegratedSystem: '',
        roles: []
      }
      usesIntegratedSystem.value = false
      passwordConfirm.value = ''
    }
  },
  { immediate: true }
)

/** Enviar */
const submitForm = async () => {
  if (!user.value.username?.trim()) {
    alertError('Informe o Username.')
    return
  }
  if (user.value.password && user.value.password !== passwordConfirm.value) {
    alertError('As senhas não coincidem.')
    return
  }
  if (userServiceRoles.value.length === 0) {
    alertError('Adicione pelo menos um perfil (Programa/Serviço/Função).')
    return
  }

  if (usesIntegratedSystem.value) {
    if (!user.value.integratedSystem || !user.value.idOnIntegratedSystem?.trim()) {
      alertError('Selecione o Sistema Integrado e informe o ID correspondente.')
      return
    }
  }

  const names = [
    {
      prefered: true,
      firstName: (user.value.name || '').trim(),
      lastName: (user.value.surname || '').trim()
    }
  ]

  const attributes: any[] = []
  if (usesIntegratedSystem.value) {
    const integratedSystemName = getSystemNameById(user.value.integratedSystem)
    attributes.push({
      type: 'integratedSystem',
      integratedSystemName,
      idOnIntegratedSystem: user.value.idOnIntegratedSystem
    })
  }

  const payload: any = {
    id: user.value.id ?? null,
    username: user.value.username?.trim(),
    ...(user.value.password ? { password: user.value.password } : {}),
    status: 'ACTIVE',
    shouldResetPassword: false,
    salt: null,

    names,
    address: [],
    personAttributes: [],

    attributes,

    userServiceRoles: userServiceRoles.value
  }

  try {
    saving.value = true
    await userStore.saveUser(payload)
    await alertSucess('Utilizador salvo com sucesso.')
    emit('close')
  } catch (err: any) {
    handleApiError(err, 'Erro ao salvar utilizador')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* optional styling tweaks */
</style>
