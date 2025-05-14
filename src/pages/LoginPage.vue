<template>
  <div class="login-wrapper column full-width full-height">
    <!-- Top Banner -->
    <div class="top-banner"></div>

    <!-- Floating Logo -->
    <div class="logo-container">
      <q-avatar size="80px" class="bg-white">
        <img src="/muzima-logo.png" />
      </q-avatar>
    </div>

    <!-- White form area with rounded top corners -->
    <div class="form-area column items-center">
      <div class="text-h4 text-weight-bold text-teal q-mb-md q-my-xl">mUzima</div>

      <!-- Inputs -->
      <q-input
        v-model="serverUrl"
        label="Servidor"
        outlined
        dense
        class="q-mb-md full-width"
      >
        <template v-slot:prepend>
          <q-icon name="link" />
        </template>
      </q-input>

      <q-input
        v-model="username"
        label="Nome do utilizador"
        outlined
        dense
        class="q-mb-md full-width"
      >
        <template v-slot:prepend>
          <q-icon name="person" />
        </template>
      </q-input>

      <q-input
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        label="Senha"
        outlined
        dense
        class="q-mb-md full-width"
      >
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
        <template v-slot:append>
          <q-icon
            :name="showPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <!-- Remember Me -->
      <q-checkbox v-model="rememberMe" label="Remember me" class="q-mb-md self-start" />

      <!-- Login Button -->
      <q-btn
        label="ENTRAR"
        color="teal"
        class="q-mb-xl"
        style="width: 200px;"
        unelevated
        @click="handleLogin"
      />

      <!-- Version -->
      <div class="text-caption text-grey q-mt-xl">{{ appVersion }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
//import userService from 'src/services/user/userService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
//import EncryptionManager from 'src/utils/EncryptionManager';
import { version } from '../../package.json';

// Dialogs
const { alertError, alertWarning } = useSwal();

// Router
const router = useRouter();

// State
const showPassword = ref(false);
const username = ref('');
const password = ref('');
const serverUrl = ref('');
const isLoading = ref(false);
const isFirstTimeSetup = ref(false);
const appVersion = version;
const rememberMe = ref(false);

onMounted(() => {
  const justLoggedOut = sessionStorage.getItem('justLoggedOut');

  if (!justLoggedOut) {
    showPrivacyWarning();
  } else {
    sessionStorage.removeItem('justLoggedOut');
  }

  const settingsExist = localStorage.getItem('settings');
  if (!settingsExist) {
    isFirstTimeSetup.value = true;
  }
});

const showPrivacyWarning = () => {
  alertWarning(
    'Ao acessar este sistema, você está prestes a visualizar informações altamente confidenciais de utentes. É sua responsabilidade protegê-las adequadamente e usá-las somente para os fins autorizados.'
  );
};

const handleLogin = async () => {
  isLoading.value = true;

  try {
    //EncryptionManager.setEncryptedSessionItem('username', username.value);
    //EncryptionManager.setEncryptedSessionItem('password', password.value);

    //await userService.login(username.value, password.value);

    router.push('/home');
  } catch (error) {
    console.error('Login failed:', error);
    alertError('Erro ao realizar login. Por favor, verifique as credenciais.');
  } finally {
    isLoading.value = false;
  }
};
</script>


<style scoped>
.login-wrapper {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.top-banner {
  height: 250px;
  background-color: #009688;
  position: relative;
  z-index: 1;
}

.logo-container {
  position: absolute;
  top: 180px; /* adjusts how much it overlaps the form */
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
}

.form-area {
  background: white;
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  padding: 24px;
  margin-top: -40px; /* more space to accommodate floating logo */
  width: 100%;
  flex: 1;
  z-index: 2;
  position: relative;
}



</style>
