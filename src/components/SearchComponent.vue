<template>
  <div>
    <!-- Search Form -->
    <div class="row items-center justify-between q-pa-md">
      <q-input
        v-model="searchQuery"
        label="Pesquisar por Nome ou NID"
        square outlined
        dense
        class="col q-mr-md"
      >
        <template v-slot:append>
          <q-icon name="close" @click="resetSearch" class="cursor-pointer" />
        </template>
      </q-input>
      <q-btn
        color="green"
        outline round
        size="md"
        icon="search"
        :loading="loading"
        @click="onSearch"
      />
    </div>

    <!-- Search Results -->
    <SearchResultsList
      v-if="results.length"
      :results="results"
      :next-url="nextUrl"
      :loading-next="loadingNext"
      @load-next="loadNext"
      @open="openPatient"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import SearchResultsList from './SearchResultsList.vue';
import patientService from 'src/services/patient/patientService';
import { useRouter } from 'vue-router';
import { useStorage } from "@vueuse/core";
import { version as applicationVersion } from '../../package.json';

const searchQuery = ref('');
const results = ref([]);
const loading = ref(false);
const nextUrl = ref(null);
const loadingNext = ref(false);
const router = useRouter();
const visualizedPatients = useStorage("visualizedPatients", []);

// Destructure dialog methods
const { alertError, alertWarning, alertWarningAction } = useSwal();

// Search function
async function onSearch() {
  if (!searchQuery.value || searchQuery.value.length <= 2) {
    alertWarning('Por favor preencha o campo de pesquisa com pelo menos 3 caracteres!');
    return;
  }

  loading.value = true;
  results.value = [];
  nextUrl.value = null;

  try {
    const response = await patientService.searchPatients(searchQuery.value);
    console.log(response)
    results.value = response.results || [];
    nextUrl.value = response.links?.find((link) => link.rel === 'next')?.uri || null;
    if (results.value.length === 0) {
      alertInfo('Nenhum paciente foi encontrado de acordo com o critério de busca!');
    }
  } catch (error) {
    console.error('Erro na pesquisa:', error);
    alertError('Não foi possível carregar os pacientes. Verifique sua conexão e tente novamente.');
  } finally {
    loading.value = false;
  }
}

// Load next set of results
async function loadNext(url, done) {
  if (!url) {
    if (done) done(); // Stop infinite scroll if no more data
    return;
  }

  loadingNext.value = true;

  try {
    const response = await patientService.getNextResults(url);

    if (response.results) {
      results.value.push(...response.results);
    }
    nextUrl.value = response.nextUrl || null;
  } catch (error) {
    console.error('Error loading next results:', error);
  } finally {
    loadingNext.value = false;
    if (done) done(); // Notify QInfiniteScroll
  }
}

const openPatient = async (uuid, name, nid) => {
  const confirmed = await alertWarningAction(
    `Deseja carregar o sumário clínico do utente ${nid} - ${name}?`
  );

  if (confirmed) {
    const selectedPatient = results.value.find((patient) => patient.uuid === uuid);
    if (selectedPatient) {
      // Save patient to sessionStorage
      sessionStorage.setItem("selectedPatient", JSON.stringify(selectedPatient));

      // Build patient info
      const currentDate = new Date().toISOString();
      const userName = sessionStorage.getItem("username") || "Usuário";

      const facilityData = sessionStorage.getItem('selectedFacility');
      const facility = facilityData ? JSON.parse(facilityData) : null;

      const visualizedPatientInfo = {
        uuid: uuid,
        report: "SESP Sumario Clinico",
        unidadeSanitaria: selectedPatient?.identifiers?.[0]?.location?.name || "Desconhecido",
        userName: userName,
        terms: "ASSINADO",
        dateOpened: currentDate,
        applicationVersion: applicationVersion,
        status: "not_uploaded",
        serverKey: facility?.value?.key
      };

      // Add patient to visualizedPatients if not already present
      const existingIndex = visualizedPatients.value.findIndex((p) => p.uuid === uuid);
      if (existingIndex === -1) {
        visualizedPatients.value.push(visualizedPatientInfo);
      }

      console.log("Visualized Patients:", visualizedPatients.value);
    }
    router.push("/patientPanel");
  }
};

// Reset search
function resetSearch() {
  searchQuery.value = '';
  results.value = [];
}
</script>

<style scoped>
</style>
