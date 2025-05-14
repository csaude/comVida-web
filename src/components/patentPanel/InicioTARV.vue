<template>
  <div class="q-pb-md">
    <!-- Header Section -->
    <header-component />

    <!-- Title -->
    <div class="q-mt-md q-mb-md text-center text-h6 text-primary">
      Dados do Início TARV
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="q-my-md text-center">
      <q-spinner-dots color="blue" size="40px" />
    </div>

    <!-- Cards for Dados Início TARV Data -->
    <div v-else>
      <div v-for="(section, index) in inicioTARVData" :key="index" class="q-mb-md">
        <q-card flat bordered>
          <!-- Section Header -->
          <q-card-section class="q-py-sm bg-light-green-1">
            <div class="row items-center">
              <div class="col text-weight-bold text-h6">{{ section.title }}</div>
              <div class="col-auto text-caption text-right text-grey">Fonte</div>
            </div>
          </q-card-section>
          <q-separator />

          <!-- Section Content -->
          <q-card-section>
            <template v-if="section.isList">
              <div v-for="(item, idx) in section.items" :key="idx">
                <div class="row items-center q-mb-sm">
                  <div class="col text-caption">{{ item.value }}</div>
                  <div class="col-auto text-caption text-right">
                    <div class="q-mb-xs">
                      <q-badge color="blue">{{ item.source.form }}</q-badge>
                    </div>
                    <div v-if="item.source.date" class="q-mb-xs">
                      <q-badge color="green">{{ item.source.date }}</q-badge>
                    </div>
                  </div>
                </div>
                <!-- Add a separator except for the last item -->
                <q-separator v-if="idx < section.items.length - 1" class="q-mb-md" />
              </div>
            </template>
            <template v-else>
              <div class="row items-center">
                <div class="col text-caption">{{ section.value || 'Sem dados no SESP' }}</div>
                <div class="col-auto text-caption text-right">
                  <div class="q-mb-xs">
                    <q-badge color="blue">{{ section.source.form }}</q-badge>
                  </div>
                  <div v-if="section.source.date" class="q-mb-xs">
                    <q-badge color="green">{{ section.source.date }}</q-badge>
                  </div>
                </div>
              </div>
            </template>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, onMounted } from 'vue';
import headerComponent from './headerComponent.vue';
import inicioTarvService from 'src/services/patient/inicioTARVService';

// Inject patient data
const patient = inject('selectedPatient');
const loading = ref(true); // Loading state

// Reactive data for Dados Início TARV
const inicioTARVData = ref([]);

// Helper function to format date to dd-MM-yyyy
function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Fetch Dados Início TARV data
onMounted(async () => {
  if (!patient.value) {
    console.error('Patient data is missing.');
    loading.value = false; // Stop loading if there's no patient
    return;
  }

  try {
    const patientId = patient.value.uuid;

    const [ARTStartDate, HfARTStart, PregnancyAtARTStart, WHOStagingAtARTStart] =
      await Promise.all([
        inicioTarvService.getARTStartDate(patientId),
        inicioTarvService.getHealthFacilityAtARTStart(patientId),
        inicioTarvService.getPregnancyStatusAtARTStart(patientId),
        inicioTarvService.getWHOStagingAtARTStart(patientId),
      ]);

    // Populate inicioTARVData
    inicioTARVData.value = [
      {
        title: 'Data de Início TARV',
        isList: true,
        items: ARTStartDate.length > 0
          ? ARTStartDate.map((item) => ({
              value: formatDate(item.value) || 'Sem dados no SESP',
              source: {
                form: item.encounter?.form?.display || 'Sem formulário',
                date: formatDate(item.obsDatetime) || 'Sem data',
                location: item.encounter?.location?.name || 'Sem localidade',
              },
            }))
          : [{ value: 'Sem dados no SESP', source: { form: 'FICHA RESUMO', date: '', location: '' } }],
      },
      {
        title: 'Unidade Sanitária de Início TARV',
        isList: true,
        items: HfARTStart.length > 0
          ? HfARTStart.map((item) => ({
              value: item.value || 'Sem dados no SESP',
              source: {
                form: item.encounter?.form?.display || 'Sem formulário',
                date: formatDate(item.obsDatetime) || 'Sem data',
                location: item.encounter?.location?.name || 'Sem localidade',
              },
            }))
          : [{ value: 'Sem dados no SESP', source: { form: 'FICHA RESUMO', date: '', location: '' } }],
      },
      {
        title: 'Estado de Gravidez no Início TARV',
        isList: true,
        items: PregnancyAtARTStart.length > 0
          ? PregnancyAtARTStart.map((item) => ({
              value: item.value.display || 'Sem dados no SESP',
              source: {
                form: item.source || 'Sem formulário',
                date: formatDate(item.obsDatetime) || 'Sem data',
                location: item.encounter?.location?.name || 'Sem localidade',
              },
            }))
          : [{ value: 'Sem dados no SESP', source: { form: 'FICHA RESUMO', date: '', location: '' } }],
      },
      {
        title: 'Estado de OMS no Início TARV',
        isList: true,
        items: WHOStagingAtARTStart.length > 0
          ? WHOStagingAtARTStart.map((item) => ({
              value: item.value.display || 'Sem dados no SESP',
              source: {
                form: item.source || 'Sem formulário',
                date: formatDate(item.obsDatetime) || 'Sem data',
                location: item.encounter?.location?.name || 'Sem localidade',
              },
            }))
          : [{ value: 'Sem dados no SESP', source: { form: 'FICHA RESUMO', date: '', location: '' } }],
      },
    ];
  } catch (error) {
    console.error('Error fetching Dados Início TARV data:', error);
  } finally {
    loading.value = false; // Stop loading after fetching data
  }
});
</script>


<style scoped>
.q-card {
  border: 1px solid #e0e0e0;
}
.text-h6 {
  font-size: 1.1em;
}
.text-caption {
  font-size: 0.9em;
}
</style>
