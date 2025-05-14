<template>
    <div class="login-page">
      <q-dialog v-model="isFirstTimeSetup">
        <AddHealthFacility
          @save="handleFirstTimeSetup"
          @cancel="handleCancelSetup"
        />
      </q-dialog>
      <div v-if="!isFirstTimeSetup" class="login-form">
        <h1>Muzima</h1>
        <p>
          Ao acessar este sistema, você está prestes a visualizar informações
          altamente confidenciais de utentes. É sua responsabilidade protegê-las
          adequadamente e usá-las somente para os fins autorizados.
        </p>
        <q-select
          v-model="selectedFacility"
          :options="facilities.map(facility => ({
            label: facility.name,
            value: facility,
          }))"
          label="Unidade Sanitária"
          outlined
          dense
        />
        <q-input
          v-model="username"
          label="Utilizador"
          outlined
          dense
          autofocus
        />
        <q-input
          v-model="password"
          label="Password"
          outlined
          dense
          type="password"
        />
        <q-btn
          label="ENTRAR"
          color="primary"
          class="full-width"
          @click="handleLogin"
          :loading="isLoading"
        />
        <q-btn
          label="ADICIONAR UNIDADE SANITÁRIA"
          color="yellow"
          class="full-width"
          @click="openAddHealthFacility"
        />
        <AddHealthFacility v-if="isAddDialogOpen"
            @save="addHealthFacility"
            @cancel="isAddDialogOpen = false"
          />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import userService from 'src/services/user/userService';
  import AddHealthFacility from '../components/login/AddHealthFacility.vue';
  
  const router = useRouter();
  
  // State variables
  const username = ref('');
  const password = ref('');
  const selectedFacility = ref(null);
  const facilities = ref([]);
  const isLoading = ref(false);
  const isAddDialogOpen = ref(false);
  const isFirstTimeSetup = ref(false);
  
  // Check if configuration exists in local storage
  onMounted(() => {
    const savedFacilities = localStorage.getItem('facilities');
    if (!savedFacilities) {
      isFirstTimeSetup.value = true;
    } else {
      facilities.value = JSON.parse(savedFacilities);
    }
  });
  
  const handleFirstTimeSetup = (facility) => {
    facilities.value.push(facility);
    localStorage.setItem('facilities', JSON.stringify(facilities.value));
    isFirstTimeSetup.value = false;
  };
  
  const handleCancelSetup = () => {
    alert('O aplicativo requer configuração inicial para prosseguir.');
  };
  
  const handleLogin = async () => {
    if (!selectedFacility.value) {
      alert('Selecione uma unidade sanitária antes de entrar.');
      return;
    }
  
    isLoading.value = true;
  
    try {
      // Set the server URL in the API service
      userService.setServerUrl(selectedFacility.value.url);
  
      // Call login with the username and password
      await userService.login(username.value, password.value);
      router.push('/main');
    } catch (error) {
      console.error(error);
      alert('Erro ao realizar login. Por favor, verifique as credenciais.');
    } finally {
      isLoading.value = false;
    }
  };
  
  const openAddHealthFacility = () => {
    isAddDialogOpen.value = true;
  };
  
  const addHealthFacility = (facility) => {
    facilities.value.push(facility);
    localStorage.setItem('facilities', JSON.stringify(facilities.value));
    isAddDialogOpen.value = false;
  };
  </script>
  