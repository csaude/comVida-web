<template>
    <div class="q-pa-md">
      <!-- General Settings -->
      <div class="q-mt-md">
        <!-- Header -->
        <div class="text-subtitle1 text-grey-8 q-mb-md">Configurações Gerais</div>
        <q-list bordered separator>
          <!-- Auto Send Usage Data -->
          <q-item>
            <q-item-section>
            <q-item-label>Auto enviar dados de uso</q-item-label>
            </q-item-section>
            <q-item-section side>
            <q-toggle v-model="settings.autoSendUsage" color="primary" @change="saveSettings" />
            </q-item-section>
        </q-item>

        <!-- Remember Username -->
        <q-item>
            <q-item-section>
            <q-item-label>Recordar username</q-item-label>
            </q-item-section>
            <q-item-section side>
            <q-toggle v-model="settings.rememberUsername" color="primary" @change="saveSettings" />
            </q-item-section>
        </q-item>

        <!-- Auto Log Out -->
        <q-item>
            <q-item-section>
            <q-item-label>Auto Log Out</q-item-label>
            </q-item-section>
            <q-item-section side>
            <q-select
                v-model="settings.autoLogout"
                :options="logoutOptions"
                emit-value
                map-options
                color="primary"
                dense
                outlined
                @change="saveSettings"
            />
            </q-item-section>
        </q-item>
        </q-list>
  
        <!-- Roles Section -->
        <q-card class="q-my-md" flat bordered>
          <q-card-section>
            <div class="text-h6 text-weight-bold">Perfis</div>
            <div v-if="roles.length > 0">
              <q-list separator>
                <q-item v-for="(role, index) in roles" :key="index">
                  <q-item-section>
                    <div class="text-weight-regular">{{ role.name }}</div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div v-else>
              <p class="text-grey">Sem perfis disponíveis.</p>
            </div>
          </q-card-section>
        </q-card>
  
        <!-- Action Buttons -->
        <div class="q-mt-md">
          <q-btn
            label="PARTILHAR DADOS DE USO"
            class="full-width q-mb-md"
            color="positive"
            unelevated
          />
          <q-btn
            label="RECONFIGURAR"
            class="full-width"
            color="yellow"
            text-color="black"
            unelevated
            @click="handleReconfigure"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import { useSwal } from 'src/composables/shared/dialog/dialog';
  import userService from 'src/services/user/userService';
  
  const roles = ref([]);
  const { alertWarningAction } = useSwal();
  

  const settings = ref({
    autoSendUsage: true,
    rememberUsername: true,
    autoLogout: 15,
    });
  
  const logoutOptions = [
    { label: '5 minutos', value: 5 },
    { label: '10 minutos', value: 10 },
    { label: '15 minutos', value: 15 },
    { label: '30 minutos', value: 30 },
    { label: '1 hora', value: 60 },
  ];
  
  // Fetch roles from sessionStorage on component mount
  onMounted(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
        settings.value = JSON.parse(savedSettings);
    }
    const rolesData = sessionStorage.getItem('roles');
    try {
      roles.value = rolesData ? JSON.parse(rolesData) : [];
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
      roles.value = [];
    }
  });
  
  // Save settings to localStorage
    const saveSettings = () => {
    localStorage.setItem('settings', JSON.stringify(settings.value));
    };

    // Watch settings changes and save them automatically (optional)
    watch(settings, saveSettings, { deep: true });

  // Handle Reconfiguration
  const handleReconfigure = async () => {
    const confirmed = await alertWarningAction(
      'Deseja apagar todas as configurações do aplicativo e reconfigurar?'
    );
  
    if (confirmed) {
      // Clear localStorage and sessionStorage
      localStorage.clear();
      userService.logout();
    }
  };
  </script>
  
  <style scoped>
  .text-subtitle1 {
    font-size: 1rem;
    font-weight: 600;
  }
  .q-btn {
    font-size: 0.9rem;
  }
  </style>
  