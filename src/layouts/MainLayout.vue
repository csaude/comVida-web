<template>
  <q-layout view="hHh lpR fFf" style="height: 100%">
    <q-drawer v-model="leftDrawerOpen" side="left" class="menu" show-if-above>
      <!-- Drawer content -->
      <div class="row q-mb-lg">
        <div class="col text-center" style="margin-top: 20%">
          <q-icon name="account_circle" color="white" size="7.4em" />
          <div class="text-grey-1 text-subtitle1 q-mt-md">
            {{ currUser }}
          </div>

          <!-- ROLES chips (replaces 'Ponto Focal SAAJ') -->
          <div v-if="roles.length" class="q-mt-sm q-gutter-xs flex justify-center items-center">
            <q-chip
              v-for="(r, idx) in visibleRoles"
              :key="idx"
              size="sm"
              color="white"
              text-color="primary"
              outline
            >
              {{ r }}
            </q-chip>
            <q-chip
              v-if="hiddenRolesCount > 0"
              size="sm"
              color="white"
              text-color="primary"
              outline
              title="Mais roles"
            >
              +{{ hiddenRolesCount }}
            </q-chip>
          </div>
          <div v-else class="text-grey-3 text-caption q-mt-sm">
            (sem roles)
          </div>
        </div>
      </div>

      <div class="row q-mt-md">
        <q-list padding class="text-white col">
          <q-item
            v-for="menuOption in visibleMenuOptions"
            :key="menuOption.link"
            v-ripple
            clickable
            :active="link === menuOption.link"
            exact
            :to="menuOption.to"
            active-class="my-menu-link"
            @click="link = menuOption.link"
          >
            <q-item-section avatar>
              <q-icon :name="menuOption.icon" />
            </q-item-section>
            <q-item-section>{{ menuOption.label }}</q-item-section>
          </q-item>

          <q-separator spaced color="white" />

          <q-item
            v-ripple
            clickable
            :active="link === 'about'"
            active-class="my-menu-link"
            @click="logout"
          >
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>
            <q-item-section>Acerca</q-item-section>
          </q-item>

          <q-item
            v-ripple
            clickable
            :active="link === 'logout'"
            active-class="my-menu-link"
            @click="logout"
          >
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section>Log out</q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-drawer>

    <q-page-container style="padding-top: 10px; height: 100%">
      <q-banner
        dense
        inline-actions
        class="text-white bg-primary q-mx-md q-px-md text-left text-weight-bolder"
      >
        <span class="text-weight-bolder text-overline">{{ currentMenuLabel }}</span>

        <template #action:action>
          <q-img src="~assets/mentoring.png" />
        </template>
      </q-banner>
      <router-view style="height: 100%" />
    </q-page-container>

    <!-- Warning Dialog -->
    <q-dialog v-model="showWarningDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Aviso de Inatividade</div>
          <p>Você será desconectado devido à inatividade em {{ warningTime / 1000 }} segundos.</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Stay Logged In" color="primary" @click="stayLoggedIn" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed, onBeforeMount, onMounted, onBeforeUnmount } from 'vue'
import { Loading, QSpinnerRings, LocalStorage } from 'quasar'
import { useRouter } from 'vue-router'
import { version } from '../../package.json'
import { useUserStore } from 'src/stores/user/userStore'

const leftDrawerOpen = ref(false)
const link = ref('home')
const router = useRouter()
const appVersion = version

const userStore = useUserStore()

const menuOptions = [
  { label: 'Página inícial', icon: 'home', to: '/home', link: 'home' },
  { label: 'Coortes', icon: 'diversity_3', to: '/cohorts', link: 'cohorts' },
  { label: 'Tracking', icon: 'pin_drop', to: '/tracking', link: 'tracking' },
  { label: 'Utilizadores', icon: 'person', to: '/users', link: 'users' },
  { label: 'Dashboard', icon: 'analytics', to: '/dashboard', link: 'dashboard' },
  { label: 'Relatórios', icon: 'assignment', to: '/reports', link: 'reports' },
  { label: 'Configurações', icon: 'settings', to: '/settings', link: 'settings' },
]

const currentMenuLabel = computed(() => {
  const match = menuOptions.find(option => option.link === link.value)
  return match?.label || 'comVida'
})

let inactivityTimer
let warningTimer
const INACTIVITY_TIME = 15 * 60 * 1000
const WARNING_TIME = 30 * 1000
const warningTime = ref(WARNING_TIME)
const showWarningDialog = ref(false)

/** pick preferred name helper */
function pickPreferredName(list) {
  if (!Array.isArray(list) || list.length === 0) return null
  return (
    list.find(n =>
      n?.prefered || n?.preferred || n?.isPreferred || n?.primary || n?.default || n?.preferido || n?.principal
    ) ?? list[0]
  )
}
function extractFullName(userNames) {
  try {
    if (!userNames) return ''
    if (typeof userNames === 'string') {
      const s = userNames.trim()
      if (!s) return ''
      if (s.startsWith('[') || s.startsWith('{')) {
        const parsed = JSON.parse(s)
        const arr = Array.isArray(parsed) ? parsed : [parsed]
        const pref = pickPreferredName(arr)
        if (!pref) return ''
        const explicit = (pref.fullName || pref.display || '').trim()
        if (explicit) return explicit
        const first = (pref.firstName || pref.givenName || '').trim()
        const last = (pref.lastName || pref.familyName || '').trim()
        return `${first} ${last}`.trim()
      }
      return s
    }
    if (Array.isArray(userNames)) {
      const pref = pickPreferredName(userNames)
      if (!pref) return ''
      const explicit = (pref.fullName || pref.display || '').trim()
      if (explicit) return explicit
      const first = (pref.firstName || pref.givenName || '').trim()
      const last = (pref.lastName || pref.familyName || '').trim()
      return `${first} ${last}`.trim()
    }
    return ''
  } catch {
    return ''
  }
}

/** CURRENT USER NAME from saved auth_attrs */
const currUser = computed(() => {
  const attrs = userStore.authAttrs
  if (!attrs) return ''
  return extractFullName(attrs.userNames) || attrs.userName || ''
})

/** ROLES (names) + compact display */
const roles = computed(() => userStore.roles)
const MAX_ROLE_CHIPS = 3
const visibleRoles = computed(() => roles.value.slice(0, MAX_ROLE_CHIPS))
const hiddenRolesCount = computed(() => Math.max(0, roles.value.length - MAX_ROLE_CHIPS))

onBeforeMount(() => {
  userStore.restoreSession()
  initUserInfo()
})

const initUserInfo = () => {
  const tokenExpiration = Number(localStorage.getItem('tokenExpiration'))
}

const visibleMenuOptions = computed(() =>
  menuOptions.filter(option => isMenuOptionVisible(option.to))
)

const isMenuOptionVisible = menuOption => {
  return true
}

const logout = () => {
  Loading.show({ spinner: QSpinnerRings })
  Loading.hide()
  router.push('/login')
}
</script>

<style lang="scss">
.menu {
  background-color: $primary;
}
.my-menu-link {
  color: black;
  background: white;
}
</style>
