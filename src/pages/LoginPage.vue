<template>
  <div class="login-wrapper column full-width full-height q-pa-md bg-white items-center" style="padding-top: 5%;">
    


    <div class="q-mt-xl q-pa-lg q-mt-xl items-center" style="max-width: 30%; width: 100%; text-align: center;">
      <div class="column items-center q-mb-lg">
        <q-img src="/comVida.png" style="width: 20%" />
        <div class="q-mt-md text-italic text-subtitle2 text-center">
          por uma saúde mais próxima das pessoas...
        </div>
      </div>

      <q-input v-model="username" label="Nome do utilizador" class="q-mt-md" outlined>
        <template #prepend>
          <q-icon name="person" />
        </template>
      </q-input>

      <q-input
        v-model="password"
        label="Senha"
        type="password"
        class="q-mt-md"
        outlined
      >
        <template #prepend>
          <q-icon name="lock" />
        </template>
      </q-input>

      <div class="row items-center q-mt-sm">
        <q-checkbox v-model="remember" label="Lembrar" />
      </div>

      <q-btn
        label="Entrar"
        color="primary"
        class="q-mt-lg q-px-lg"
        style="width: 35%;"
        @click="login"
      />

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useRouter } from 'vue-router';

// Dialogs
const { alertError, alertWarning } = useSwal();
const router = useRouter();

const server = ref('')
const username = ref('')
const password = ref('')
const remember = ref(false)

onMounted(() => {
  // Show privacy warning on mount
  showPrivacyWarning();
});

const showPrivacyWarning = () => {
  alertWarning(
    'Ao acessar este sistema, você está prestes a visualizar informações altamente confidenciais de utentes. É sua responsabilidade protegê-las adequadamente e usá-las somente para os fins autorizados.'
  );
};

function login() {
  console.log('Logging in with:', {
    server: server.value,
    username: username.value,
    password: password.value,
    remember: remember.value
  })
  router.push('/home');
  // Implement real login logic here
}
</script>

<style scoped>
.absolute-top-right {
  top: 10px;
  right: 10px;
}
</style>
