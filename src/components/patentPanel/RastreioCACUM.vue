<template>
  <div class="q-pb-md">
    <!-- Header Section -->
    <header-component />

    <!-- Title -->
    <div class="q-mt-md q-mb-md text-center text-h6 text-primary">
      Rastreio CACUM
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="q-my-md text-center">
      <q-spinner-dots color="blue" size="40px" />
    </div>

    <!-- Cards for Dados CACUM Data -->
    <div v-else>
      <div v-for="(section, index) in rastreioData" :key="index" class="q-mb-md">
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
import rastreioCACUMService from 'src/services/patient/rastreioCACUM';

// Inject patient data
const patient = inject('selectedPatient');
const loading = ref(true); // Loading state

const rastreioData = ref([]);

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

// Fetch Dados CACUM data
onMounted(async () => {
  if (!patient.value) {
    console.error('Patient data is missing.');
    loading.value = false; // Stop loading if there's no patient
    return;
  }

  try {
    const patientId = patient.value.uuid;

    const [rastreioCacumData, hPVDNAResultData] =
      await Promise.all([
        rastreioCACUMService.getRastreioCacumDAta(patientId),
        rastreioCACUMService.getHPVDNAResultData(patientId)
      ]);

      console.log('rastreioCacumData: ', JSON.stringify(rastreioCacumData, null, 2))
    // Populate rastreioData
    rastreioData.value = [
      {
        title: 'VIA: Data do último rastreio',
        isList: true,
        items: rastreioCacumData.length > 0
          ? rastreioCacumData.map((item) => ({
              value: formatDate(item.encounterDatetime) || 'Sem dados no SESP',
              source: {
                form: item.encounter?.form?.display || 'CCU: RASTREIO',
                date: formatDate(item.encounterDatetime) || 'Sem data',
              },
            }))
          : [{ value: 'Sem dados no SESP', source: { form: 'CCU: RASTREIO', date: '', location: '' } }],
      },
      {
        title: 'Resultado de HPV-DNA',
        isList: true,
        items: hPVDNAResultData.length > 0
          ? hPVDNAResultData.map((item) => ({
              value: formatDate(item.encounterDatetime) || 'Sem dados no SESP',
              source: {
                form: item.encounter?.form?.display || 'CCU: RASTREIO',
                date: formatDate(item.encounterDatetime) || 'Sem data',
              },
            }))
          : [{ value: 'Sem dados no SESP', source: { form: 'CCU: RASTREIO', date: '', location: '' } }],
      }
    ];
  } catch (error) {
    console.error('Error fetching Dados CACUM data:', error);
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
