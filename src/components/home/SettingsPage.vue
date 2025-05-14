<template>
    <q-page :class="pageClass">
  
      <q-list class="q-pa-md flat">
        <q-item>
          <q-item-section avatar>
            <q-icon name="dns" color="orange" />
          </q-item-section>
          <q-item-section>
            <q-item-label><strong>Servidor:</strong></q-item-label>
            <q-item-label caption>https://10.10.2.17:8989/openmrschabeco</q-item-label>
          </q-item-section>
        </q-item>
  
        <q-item class="q-mt-md">
          <q-item-section avatar>
            <q-icon name="location_on" color="blue" />
          </q-item-section>
          <q-item-section>
            <q-item-label><strong>Unidade Sanitária:</strong></q-item-label>
            <q-item-label caption>CS Chabeco</q-item-label>
          </q-item-section>
        </q-item>
  
        <q-item class="q-mt-md">
          <q-item-section avatar>
            <q-icon name="person" color="green" />
          </q-item-section>
          <q-item-section>
            <q-item-label><strong>Utilizador:</strong></q-item-label>
            <q-item-label caption>pf.adultos</q-item-label>
          </q-item-section>
        </q-item>
  
        <!-- Perfis -->
        <q-item class="q-mt-md">
          <q-item-section avatar>
            <q-icon name="groups" color="green-9" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-bold">Perfis:</q-item-label>
            <div class="q-mt-sm q-pa-sm bg-grey-3 rounded-borders">
              <div class="row items-center q-gutter-sm">
                <q-icon name="check_circle" size="16px" color="brown" />
                <span class="text-brown-10">Ponto Focal da Pediatria</span>
              </div>
              <div class="row items-center q-gutter-sm">
                <q-icon name="check_circle" size="16px" color="brown" />
                <span class="text-brown-10">Ponto Focal SMI</span>
              </div>
              <div class="row items-center q-gutter-sm">
                <q-icon name="check_circle" size="16px" color="brown" />
                <span class="text-brown-10">Ponto Focal SAAJ</span>
              </div>
              <div class="row items-center q-gutter-sm">
                <q-icon name="check_circle" size="16px" color="brown" />
                <span class="text-brown-10">Ponto Focal Adultos</span>
              </div>
            </div>
          </q-item-section>
        </q-item>
  
        <!-- Session Time -->
      <q-item class="q-mt-md">
        <q-item-section avatar>
          <q-icon name="alarm" color="brown" />
        </q-item-section>
        <q-item-section>
          <q-item-label><strong>Tempo de sessão (min)</strong></q-item-label>
          <q-input
            v-model.number="sessionTime"
            type="number"
            dense
            min="2"
            max="30"
            outlined
            :rules="[val => val >= 2 && val <= 30 || 'Entre 2 e 30']"
          />
        </q-item-section>
      </q-item>

      <!-- Dark Mode -->
      <q-item class="q-mt-md">
        <q-item-section avatar>
          <q-icon name="dark_mode" />
        </q-item-section>
        <q-item-section>
          <q-item-label><strong>Modo escuro</strong></q-item-label>
          <q-item-label caption>Activar tema escuro</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="darkMode" color="teal" />
        </q-item-section>
      </q-item>

      <!-- Language Selection -->
      <q-item class="q-mt-md">
        <q-item-section avatar>
          <q-icon name="language" color="green" />
        </q-item-section>
        <q-item-section>
          <q-item-label><strong>Língua</strong></q-item-label>
          <q-select
            v-model="language"
            :options="languageOptions"
            dense
            outlined
            emit-value
            map-options
          />
        </q-item-section>
      </q-item>

      </q-list>
    </q-page>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, computed } from 'vue';
  import { useQuasar } from 'quasar';
  import { useI18n } from 'vue-i18n';
  import { SecureStorageEcho } from '@ionic-native/secure-storage-echo';
  import { useSwal } from 'src/composables/shared/dialog/dialog';
  
  const { alertError } = useSwal();
  const $q = useQuasar();
  const { locale } = useI18n();
  
  const darkMode = ref(false);
  const sessionTime = ref(15);
  const language = ref('pt'); // default language
  const storageInstance = ref(null);
  const languageOptions = [
    { label: 'Português', value: 'pt' },
    { label: 'English', value: 'en' },
    { label: 'Français', value: 'fr' },
    ];

    const pageClass = computed(() => (darkMode.value ? 'bg-black text-white' : 'bg-grey-2'));

  const STORAGE_NAMESPACE = 'muzima_settings';
  const STORAGE_KEY = 'settings';
  
  // Load settings on mount
  onMounted(async () => {
    try {
      storageInstance.value = await SecureStorageEcho.create(STORAGE_NAMESPACE);
  
      const savedSettings = await storageInstance.value.get(STORAGE_KEY);
      const parsed = JSON.parse(savedSettings);
  
      sessionTime.value = parsed.sessionTime ?? 15;
      darkMode.value = parsed.darkMode ?? false;
      language.value = parsed.language ?? 'pt';
  
      // Apply on load
      $q.dark.set(darkMode.value);
      locale.value = language.value;
  
    } catch (err) {
      if (err?.message?.includes('not found')) {
        console.warn('Configuração não encontrada. Usando padrões.');
      } else {
        console.error('Erro ao carregar configurações:', err);
        alertError('Erro ao carregar configurações.');
      }
    }
  });
  
  // Save settings to SecureStorage
  const saveSettings = async () => {
    if (!storageInstance.value) return;
  
    const settingsToSave = {
      sessionTime: sessionTime.value,
      darkMode: darkMode.value,
      language: language.value
    };
  
    try {
      await storageInstance.value.set(STORAGE_KEY, JSON.stringify(settingsToSave));
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      alertError('Erro ao salvar configurações.');
    }
  };
  
  // Auto-save on change
  watch(darkMode, val => {
    $q.dark.set(val);
    saveSettings();
  });
  
  watch(language, val => {
    locale.value = val;
    saveSettings();
  });
  
  watch(sessionTime, val => {
    // Ensure it's within valid range
    if (val >= 2 && val <= 30) {
      saveSettings();
    }
  });
  </script>
  
  
  <style scoped>
  .rounded-borders {
    border-radius: 16px;
  }
  </style>
  