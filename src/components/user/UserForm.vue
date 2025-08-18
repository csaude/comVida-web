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
          <!-- v-model here is an array of UI rows; we transform to userServiceRoles on submit -->
          <UserRolesTable v-model="user.roles" />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn label="Cancelar" color="red" outlined @click="$emit('cancel')" />
        <q-btn label="Salvar" type="submit" color="primary" :loading="saving" :disable="saving" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useUserStore } from 'src/stores/user/userStore'
import { useSwal } from 'src/composables/shared/dialog/dialog'
import { useApiErrorHandler } from 'src/composables/shared/error/useApiErrorHandler'
import UserRolesTable from './UserRolesTable.vue'

/** UI rows coming from UserRolesTable */
type RoleRow = {
  programId: number | null
  programActivityId: number | null
  roleUuid: string | null
  lifeCycleStatus?: string
  groupUuids?: string[]
  groupNames?: string[] // display-only
}

/** Final structure sent to backend */
type UserServiceRoleDTO = {
  programId: number
  programActivityId: number
  roleUuid: string
  groupUuids: string[]
  lifeCycleStatus?: string
}

const props = defineProps({
  /** When editing, parent can pass the user object here */
  modelValue: { type: Object as () => any, default: null }
})

/** We don't emit 'save' anymore. Only 'close' and 'cancel'. */
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'cancel'): void
}>()

const userStore = useUserStore()
const { alertSucess, alertError } = useSwal()
const { handleApiError } = useApiErrorHandler()

/** Local form state */
const user = ref<{
  id: number | null
  name: string
  surname: string
  username: string
  password: string
  integratedSystem: number | null
  idOnIntegratedSystem: string
  roles: RoleRow[] // UI-only rows, transformed on submit
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

/** Build final userServiceRoles[] from UI rows (dedup + only complete rows) */
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
      groupUuids: Array.from(new Set(r.groupUuids ?? [])),
      ...(r.lifeCycleStatus ? { lifeCycleStatus: r.lifeCycleStatus } : {})
    })
  }
  return out
})

/** Clear integrated fields when toggle goes off */
watch(usesIntegratedSystem, enabled => {
  if (!enabled) {
    user.value.integratedSystem = null
    user.value.idOnIntegratedSystem = ''
  }
})

/** Prefill for edit / reset for add */
watch(
  () => props.modelValue,
  (val: any) => {
    if (val) {
      user.value = {
        id: val.id ?? null,
        name: val.name ?? '',
        surname: val.surname ?? '',
        username: val.username ?? '',
        password: '', // never prefill password
        integratedSystem: val.integratedSystem ?? null,
        idOnIntegratedSystem: val.idOnIntegratedSystem ?? '',
        // Prefer UI rows (`roles`); otherwise map from `userServiceRoles`
        roles: Array.isArray(val.roles)
          ? [...val.roles]
          : Array.isArray(val.userServiceRoles)
            ? val.userServiceRoles.map((u: any) => ({
                programId: u.programId ?? u.program?.id ?? null,
                programActivityId: u.programActivityId ?? u.programActivity?.id ?? null,
                roleUuid: u.roleUuid ?? u.role?.uuid ?? null,
                lifeCycleStatus: u.lifeCycleStatus,
                groupUuids: Array.isArray(u.groupUuids) ? [...u.groupUuids] : []
              }))
            : []
      }
      usesIntegratedSystem.value = !!(val.integratedSystem || val.idOnIntegratedSystem)
      passwordConfirm.value = ''
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

/** Replace with a store/computed if you load these from API */
const integratedSystems = [
  { id: 1, name: 'OpenMRS' },
  { id: 2, name: 'DHIS2' },
  { id: 3, name: 'iDART' }
]

/** Submit -> call userStore.saveUser and close */
const submitForm = async () => {
  // simple validations
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

  const payload: any = {
    id: user.value.id,
    name: user.value.name,
    surname: user.value.surname,
    username: user.value.username,
    ...(user.value.password ? { password: user.value.password } : {}),
    integratedSystem: usesIntegratedSystem.value ? user.value.integratedSystem : null,
    idOnIntegratedSystem: usesIntegratedSystem.value ? user.value.idOnIntegratedSystem : '',
    // ✅ final array for backend, including groupUuids
    userServiceRoles: userServiceRoles.value
  }

  try {
    saving.value = true
    console.log('Saving user:', payload)
    //await userStore.saveUser(payload)
    await alertSucess('Utilizador salvo com sucesso.')
    emit('close') // parent closes dialog and refreshes list
  } catch (err: any) {
    handleApiError(err, 'Erro ao salvar utilizador')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* optional styling tweaks here */
</style>
