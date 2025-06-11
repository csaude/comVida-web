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
          <div class="text-grey-1 text-subtitle1 q-mt-sm">
            Ponto Focal SAAJ
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
import { ref, computed, onBeforeMount, onMounted, onBeforeUnmount } from 'vue';
import { Loading, QSpinnerRings, LocalStorage } from 'quasar';
import { useRouter } from 'vue-router';
import { version } from '../../package.json';

const leftDrawerOpen = ref(false);
const link = ref('home');
const router = useRouter();
const appVersion = version;

const menuOptions = [
  { label: 'Página inícial', icon: 'home', to: '/home', link: 'home' },
  { label: 'Coortes', icon: 'diversity_3', to: '/cohorts', link: 'cohorts' },
  { label: 'Tracking', icon: 'pin_drop', to: '/tracking', link: 'tracking' },
  { label: 'Utilizadores', icon: 'person', to: '/users', link: 'users' },
  { label: 'Dashboard', icon: 'analytics', to: '/dashboard', link: 'dashboard' },
  { label: 'Relatórios', icon: 'assignment', to: '/reports', link: 'reports' },
  { label: 'Configurações', icon: 'settings', to: '/settings', link: 'settings' },
];

const currentMenuLabel = computed(() => {
  const match = menuOptions.find(option => option.link === link.value);
  return match?.label || 'comVida';
});


let inactivityTimer; // Store the inactivity timer
let warningTimer; // Store the warning timer
const INACTIVITY_TIME = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME = 30 * 1000; // Show warning 30 seconds before logout
const warningTime = ref(WARNING_TIME);
const showWarningDialog = ref(false);

const currUser = 'Felisberto Silva'; // Placeholder for current user, replace with actual user data

onBeforeMount(() => {
  initUserInfo();
});


const initUserInfo = () => {
  const tokenExpiration = Number(localStorage.getItem('tokenExpiration'));

};

const visibleMenuOptions = computed(() =>
  menuOptions.filter(option => isMenuOptionVisible(option.to))
);

const isMenuOptionVisible = menuOption => {
   return true;
  // const userData = JSON.parse(localStorage.getItem('userData')) || {};
  // const roles = userData.roles || [];

  // const rolePermissions = {
  //   NATIONAL_ADMINISTRATOR: ['/home', '/cohorts', '/tracking', '/users', '/dashboard', '/rondas', '/settings'],
  //   PROVINCIAL_ADMINISTRATOR: ['/home', '/tables', '/mentors', '/mentees', '/rondas', '/settings'],
  //   DISTRICT_ADMINISTRATOR: ['/home', '/mentees', '/rondas', '/settings'],
  //   NATIONAL_MENTOR: ['/home', '/reports', '/mentees'],
  //   PROVINCIAL_MENTOR: ['/home', '/reports', '/mentees'],
  //   DISTRICT_MENTOR: ['/home', '/reports', '/mentees'],
  //   HEALTH_FACILITY_MENTOR: ['/home', '/mentees', '/resources', '/reports'],
  //   MENTEE: ['/home', '/resources'],
  // };

  // const allowedPaths = roles.reduce((paths, role) => {
  //   const rolePaths = rolePermissions[role] || [];
  //   return [...new Set([...paths, ...rolePaths])]; // Merge paths without duplicates
  // }, []);

  // return allowedPaths.includes(menuOption);
};

const logout = () => {
  Loading.show({ spinner: QSpinnerRings });
  Loading.hide();
  router.push('/login');
};

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
