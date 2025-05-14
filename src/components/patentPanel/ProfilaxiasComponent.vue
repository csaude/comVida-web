<template>
  <div class="q-pb-md">
    <!-- Header Section -->
    <header-component />

    <!-- Title -->
    <div class="q-mt-md q-mb-md text-center text-h6 text-primary">
      Profilaxias
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="q-my-md text-center">
      <q-spinner-dots color="blue" size="40px" />
    </div>

    
    <div v-else>
      <!-- Cards for TPT/TPI -->
      <div v-for="(section, index) in profilaxiaData" :key="index" class="q-mb-md">
        <q-card flat bordered>
          <!-- Section Header -->
          <q-card-section 
            class="q-py-sm bg-light-green-1 cursor-pointer"
            @click="toggleSection(index)"
          >
            <div class="row items-center">
              <div class="col text-weight-bold text-h6">Profilaxia({{ section.title }})</div>
              <div class="col-auto text-caption text-right text-grey">Fonte</div>
              <!-- Expand/Collapse Icon -->
              <q-icon 
                :name="collapsedSections[index] ? 'keyboard_arrow_down' : 'keyboard_arrow_up'"
                size="sm" 
                color="grey"
              />
            </div>
          </q-card-section>
          <q-separator />

          <!-- Section Content -->
          <q-card-section v-show="!collapsedSections[index]">
            <template v-if="section.isList">
              <div v-for="(item, idx) in section.items" :key="idx" class="q-mb-sm">
                <div class="row items-center q-mb-sm">
                  <!-- Coluna de Profilaxia e Data de Início de TPT -->
                  <div class="col text-caption" v-if="item.value">{{ item.source.profilaxia }} ({{ item.value }})</div>
                  <div class="col text-caption" v-else>{{ item.source.profilaxia }}</div>

                  <!-- Coluna de Fonte -->
                  <div class="col-5 text-caption text-right">
                    <div class="badge-container text-right">
                      <q-badge color="blue">{{ item.source.form }}</q-badge>
                    </div>
                  </div>
                </div>
                <q-separator v-if="idx < section.items.length - 1" class="q-mb-md" />
              </div>
            </template>
            <template v-else>
              <div class="row items-center">
                <!-- Coluna de Profilaxia e Data de Início de TPT -->
                <div class="col text-caption" v-if="item.value">{{ item.source.profilaxia }} ({{ item.value }})</div>
                <div class="col text-caption" v-else>{{ item.source.profilaxia }}</div>

                <!-- Coluna de Fonte -->
                <div class="col-5 text-caption text-right">
                  <div class="badge-container text-right">
                    <q-badge color="blue">{{ section.source.form }}</q-badge>
                  </div>
                </div>
              </div>
            </template>
          </q-card-section>
        </q-card>
      </div>

      <!-- Cards for anything else-->
      <div v-for="(section, index) in resultadosData" :key="index" class="q-mb-md">
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
              <div v-for="(item, idx) in section.items" :key="idx" class="q-mb-sm">
                <div class="row items-center">
                  <div class="col text-caption">{{ item.value }}</div>
                  <div class="col-auto text-caption text-right">
                    <div class="badge-container q-mr-sm">
                      <q-badge color="blue">{{ item.source.form }}</q-badge>
                    </div>
                  </div>
                </div>
                <q-separator v-if="idx < section.items.length - 1" class="q-mb-md" />
              </div>
            </template>
            <template v-else>
              <div class="row items-center">
                <div class="col text-caption">{{ section.value || 'Sem dados no SESP' }}</div>
                <div class="col-auto text-caption text-right">
                  <div class="badge-container">
                    <q-badge color="blue">{{ section.source.form }}</q-badge>
                  </div>
                  <div v-if="section.source.date" class="badge-container">
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
  import profilaxiasService from 'src/services/patient/profilaxiasService';

  // Inject patient data
  const patient = inject('selectedPatient');

  // Reactive data for Resultados Laboratoriais
  const profilaxiaData = ref([]);
  const resultadosData = ref([]);
  const loading = ref(true); // Loading state
  const collapsedSections = ref([]); // Track collapsed states for each section

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

  // Toggle collapse state for a section
  function toggleSection(index) {
    collapsedSections.value[index] = !collapsedSections.value[index];
  }

  onMounted(async () => {
  if (!patient.value) {
    console.error('Patient data is missing.');
    loading.value = false;
    return;
  }

  try {
  
    const allIPTStart = await profilaxiasService.allIPTStart(patient.value.uuid)
    const allIPTEnd = await profilaxiasService.allIPTEnd(patient.value.uuid)
    const CTZStartFichaClinica = await profilaxiasService.CTZStartFichaClinica(patient.value.uuid)
    const IPTEndFichaFILT = await profilaxiasService.IPTEndFichaFILT(patient.value.uuid)

    const expectedForms = ['FICHA RESUMO', 'FICHA CLINICA', 'FICHA DE SEGUIMENTO'];

    // Map data for `allIPTStart`
    const startItems = allIPTStart.map((item) => ({
      value: item.value.display ? formatDate(item.obsDatetime) : item.value,
      source: {
        profilaxia: item.profilaxia || 'Sem dados no SESP',
        form: item?.encounter?.form?.display,
      },
    }));

    const missingStartForms = expectedForms.filter(
      (form) => !startItems.some((item) => item.source.form === form)
    );

    const missingStartItems = missingStartForms.map((form) => ({
      value: '_',
      source: {
        profilaxia: 'Sem dados no SESP',
        form,
      },
    }));

    // Map data for `allIPTEnd`
    const endItems = allIPTEnd.map((item) => ({
      value: item.value.display ? formatDate(item.obsDatetime) : item.value,
      source: {
        profilaxia: item.profilaxia || 'Sem dados no SESP',
        form: item?.encounter?.form?.display,
      },
    }));

    const missingEndForms = expectedForms.filter(
      (form) => !endItems.some((item) => item.source.form === form)
    );

    const missingEndItems = missingEndForms.map((form) => ({
      value: '_',
      source: {
        profilaxia: 'Sem dados no SESP',
        form,
      },
    }));

    profilaxiaData.value = [
      {
        title: 'Data de início de TPT',
        isList: true,
        items: [...startItems, ...missingStartItems],
      },
      {
        title: 'Data de fim de TPI',
        isList: true,
        items: [...endItems, ...missingEndItems],
      },
    ];

    // Populate resultadosData
    resultadosData.value = [
      {
        title: 'Data do último levantamento INH',
        value: IPTEndFichaFILT[0]?.obsDatetime
          ? formatDate(IPTEndFichaFILT[0]?.obsDatetime)
          : 'Sem dados no SESP',
        source: IPTEndFichaFILT[0]
          ? {
              form: IPTEndFichaFILT[0]?.encounter?.form?.display || 'Sem formulário',
              date: formatDate(IPTEndFichaFILT[0]?.obsDatetime) || 'Sem dados no SESP',
            }
          : { form: 'FILT', date: '', location: '' },
      },
      {
        title: 'Tipo do último levantamento INH',
        value: IPTEndFichaFILT[0]?.value?.display
          ? IPTEndFichaFILT[0]?.value?.display
          : 'Sem dados no SESP',
        source: IPTEndFichaFILT[0]
          ? {
              form: IPTEndFichaFILT[0]?.encounter?.form?.display || 'Sem formulário',
              date: formatDate(IPTEndFichaFILT[0]?.obsDatetime) || 'Sem dados no SESP',
            }
          : { form: 'FILT', date: '', location: '' },
      },
      {
        title: 'Data de início de CTZ',
        isList: true,
        items: CTZStartFichaClinica.length > 0
          ? CTZStartFichaClinica.map((item) => ({
              value: item.value.display ? formatDate(item.obsDatetime) : item?.value,
              source: {
                form: item.encounter?.form?.display || 'Sem dados no SESP',
                date: formatDate(item.obsDatetime) || 'Sem dados no SESP',
              },
            }))
          : [{ 
              value: 'Sem dados no SESP', 
              source: { form: 'FICHA CLINICA', date: '', location: '' } 
            }],
      },
      {
        title: 'Data do Fim de CTZ',
        isList: true,
        items: IPTEndFichaFILT.length > 0
          ? IPTEndFichaFILT.map((item) => ({
              value: item.value.display ? formatDate(item.obsDatetime) : item?.value,
              source: {
                form: item.encounter?.form?.display || 'Sem dados no SESP',
                date: formatDate(item.obsDatetime) || 'Sem dados no SESP',
              },
            }))
          : [{ 
              value: 'Sem dados no SESP', 
              source: { form: 'FICHA CLINICA', date: '', location: '' } 
            }],
      },
    ]
    } catch (error) {
      console.error('Error fetching Levantamento ARV data:', error);
    } finally {
      loading.value = false; // Stop loading spinner
    }
});

</script>

<style scoped>
/* Ajuste para estilizar o cabeçalho com fundo cinza */
.bg-grey-3 {
  background-color: #e0e0e0;
}
.q-th {
  text-align: center;
}
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