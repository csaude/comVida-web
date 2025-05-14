<template>
  <div class="q-pb-md">
    <!-- Header Section -->
    <header-component />

    <!-- Title -->
    <div class="q-mt-md q-mb-md text-center text-h6 text-primary">
      Resultados Laboratoriais
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="q-my-md text-center">
      <q-spinner-dots color="blue" size="40px" />
    </div>

    <!-- Cards for Resultados Data -->
    <div v-if="!loading">
      <div v-for="(section, index) in resultadosData" :key="index" class="q-mb-md">
        <q-card flat bordered>
          <!-- Section Header -->
          <q-card-section 
            class="q-py-sm bg-light-green-1 cursor-pointer"
            @click="toggleSection(index)"
          >
            <div class="row items-center">
              <div class="col text-weight-bold text-h6">{{ section.title }}</div>
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
                <q-separator v-if="idx < section.items.length - 1" class="q-mb-md" />
              </div>
            </template>
            <template v-else>
              <div class="row items-center">
                <div class="col text-caption">{{ section.value || 'Sem dados no SESP' }}</div>
                <div class="col-auto text-caption text-right">
                  <div class="badge-container q-mr-sm">
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
  import resultadosLaboratoriaisService from 'src/services/patient/resultadosLaboratoriaisService';

  // Inject patient data
  const patient = inject('selectedPatient');
  const loading = ref(true); // Loading state

  // Reactive data for Resultados Laboratoriais
  const resultadosData = ref([]);

  // Track collapsed states for each section
  const collapsedSections = ref([]);

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
  
    const allCD4CoverageFLG = await resultadosLaboratoriaisService.allCD4CoverageFLG(patient.value.uuid);
    const allCD4CoverageFSR = await resultadosLaboratoriaisService.allCD4CoverageFSR(patient.value.uuid)
    const allCD4AbsFSR = await resultadosLaboratoriaisService.allCD4AbsFSR(patient.value.uuid)
    const allCD4AbsFLG = await resultadosLaboratoriaisService.allCD4AbsFLG(patient.value.uuid)
    const allGenexpert = await resultadosLaboratoriaisService.allGenexpert(patient.value.uuid)
    const allGenexpertFC = await resultadosLaboratoriaisService.allGenexpertFC(patient.value.uuid)
    const allBaciloscopia = await resultadosLaboratoriaisService.allBaciloscopia(patient.value.uuid)
    const allBaciloscopiaFC = await resultadosLaboratoriaisService.allBaciloscopiaFC(patient.value.uuid)
    const { rastreioTBLAMLabGeral, rastreioTBLAMELab, rastreioTBLAMFichaClinica } = await resultadosLaboratoriaisService.allTBLAM(patient.value.uuid);
    const allHGB = await resultadosLaboratoriaisService.allHGB(patient.value.uuid);
    const allAST = await resultadosLaboratoriaisService.allAST(patient.value.uuid);
    const allALT = await resultadosLaboratoriaisService.allALT(patient.value.uuid);
    const allAMI = await resultadosLaboratoriaisService.allAMI(patient.value.uuid);
    const allGLC = await resultadosLaboratoriaisService.allGLC(patient.value.uuid);
    const allPCR = await resultadosLaboratoriaisService.allPCR(patient.value.uuid);


    const allVLs = await resultadosLaboratoriaisService.allVLs(patient.value.uuid);

    console.log('allVLs=======>: ', JSON.stringify(allVLs, null, 2))

    // Populate resultadosData
    resultadosData.value = [
      {
        title: 'Carga Viral (Cópias/ml)',
        isList: true,
        items: allVLs.length > 0
          ? allVLs.map((item) => ({
              value: item.value.value.display ? item.value.value.display : item.value.value,
              source: {
                form: item.encounter?.form?.display || 'Sem dados no SESP',
                date: formatDate(item.value.obsDatetime) || '',
              },
            }))
          : [{ 
              value: 'Sem dados no SESP', 
              source: { form: 'FLABORATORIO GERAL', date: '', location: '' } 
            }],
      },
      {
        title: 'CD4 Absoluto',
        isList: true,
        items:
          (allCD4AbsFSR.length > 0 && allCD4AbsFLG.length > 0)
            ? [
                ...allCD4AbsFLG.map((item) => ({
                  value: item.value || 'Sem dados no SESP',
                  source: {
                    form: item?.encounter?.form?.display | 'LABORATORIO GERAL',
                    date: formatDate(item.obsDatetime) || '',
                  },
                })),
                ...allCD4AbsFSR.map((item) => ({
                  value: item.value || 'Sem dados no SESP',
                  source: {
                    form: item?.encounter?.form?.display | 'e-Lab',
                    date: formatDate(item.obsDatetime) || '',
                  },
                })),
              ]
            : [{ 
                value: 'Sem dados no SESP', 
                source: { form: 'LABORATORIO GERAL', date: '', location: '' } 
              },
              { 
                value: 'Sem dados no SESP', 
                source: { form: 'e-Lab', date: '', location: '' } 
              }],
        },
      {
        title: 'CD4 Percentual',
        isList: true,
        items:
          (allCD4CoverageFLG.length > 0 || allCD4CoverageFSR.length > 0)
            ? [
                ...allCD4CoverageFLG.map((item) => ({
                  value: item.value || 'Sem dados no SESP',
                  source: {
                    form: item?.encounter?.form?.display || 'LABORATORIO GERAL',
                    date: formatDate(item.obsDatetime) || '',
                  },
                })),
                ...allCD4CoverageFSR.map((item) => ({
                  value: item.value || 'Sem dados no SESP',
                  source: {
                    form: item?.encounter?.form?.display || 'e-Lab',
                    date: formatDate(item.obsDatetime) || '',
                  },
                })),
              ]
            : [{ 
                value: 'Sem dados no SESP', 
                source: { form: 'LABORATORIO GERAL', date: '', location: '' } 
              },
              { 
                value: 'Sem dados no SESP', 
                source: { form: 'e-Lab', date: '', location: '' } 
              }],
        },
      {
        title: 'GeneXpert',
        isList: true,
        items:
          (allGenexpert.length > 0 || allGenexpertFC.length > 0)
            ? [
                ...allGenexpert.map((item) => ({
                  value: item.value || 'Sem dados no SESP',
                  source: {
                    form: item?.encounter?.form?.display || 'LABORATORIO GERAL',
                    date: formatDate(item.obsDatetime) || '',                    
                  },
                })),
                ...allGenexpertFC.map((item) => ({
                  value: item.value || 'Sem dados no SESP',
                  source: {
                    form: item?.encounter?.form?.display || 'FICHA CLINICA',
                    date: formatDate(item.obsDatetime) || '',                    
                  },
                })),
              ]
            : [{ 
                value: 'Sem dados no SESP', 
                source: { form: 'LABORATORIO GERAL', date: '', location: '' } 
              },
              { 
                value: 'Sem dados no SESP', 
                source: { form: 'FICHA CLINICA', date: '', location: '' } 
              }],
        },
        {
        title: 'Baciloscopia',
        isList: true,
        items:
          (allBaciloscopia.length > 0 || allBaciloscopiaFC.length > 0)
            ? [
                ...allBaciloscopia.map((item) => ({
                  value: item.value || 'Sem dados no SESP',
                  source: {
                    form: item?.encounter?.form?.display || 'LABORATORIO GERAL',
                    date: formatDate(item.obsDatetime) || '',                    
                  },
                })),
                ...allBaciloscopiaFC.map((item) => ({
                  value: item.value || 'Sem dados no SESP',
                  source: {
                    form: item?.encounter?.form?.display || 'FICHA CLINICA',
                    date: formatDate(item.obsDatetime) || '',                    
                  },
                })),
              ]
            : [{ 
                value: 'Sem dados no SESP', 
                source: { form: 'LABORATORIO GERAL', date: '', location: '' } 
              },
              { 
                value: 'Sem dados no SESP', 
                source: { form: 'FICHA CLINICA', date: '', location: '' } 
              }],
        },
        {
        title: 'TB LAM',
        isList: true,
        items: 
        (rastreioTBLAMLabGeral.length > 0 || rastreioTBLAMELab.length > 0 || rastreioTBLAMFichaClinica.length > 0)
          ? [
              ...rastreioTBLAMLabGeral.map((item) => ({
                value: item.value?.display || 'Sem dados no SESP',
                comment: item.value?.comment || '',
                source: {
                  form: item.encounter?.form?.display || 'LABORATORIO GERAL',
                  date: formatDate(item.obsDatetime) || '',                  
                },
              })),
              ...rastreioTBLAMELab.map((item) => ({
                value: item.value?.display || 'Sem dados no SESP',
                comment: item.value?.comment || '',
                source: {
                  form: item.encounter?.form?.display || 'FORMULARIO ELECTRONICO DE LABORATORIO',
                  date: formatDate(item.obsDatetime) || '',                  
                },
              })),
              ...rastreioTBLAMFichaClinica.map((item) => ({
                value: item.value?.display || 'Sem dados no SESP',
                comment: item.value?.comment || '',
                source: {
                  form: item.encounter?.form?.display || 'FICHA CLINICA',
                  date: formatDate(item.obsDatetime) || '',                  
                },
              })),
            ]
          : [
              {
                value: 'Sem dados no SESP',
                source: { form: 'LABORATORIO GERAL', date: '', location: '' },
              },
              {
                value: 'Sem dados no SESP',
                source: { form: 'FORMULARIO ELECTRONICO DE LABORATORIO', date: '', location: '' },
              },
              {
                value: 'Sem dados no SESP',
                source: { form: 'FICHA CLINICA', date: '', location: '' },
              },
            ],
          },
          {
            title: 'Hemoglobina (HGB ou HB)',
            isList: true,
            items:
              allHGB.length > 0
                ? allHGB.map((item) => ({
                    value: item.value || 'Sem dados no SESP',
                    source: {
                      form: item?.encounter?.form?.display || 'LABORATORIO GERAL',
                      date: formatDate(item.obsDatetime) || 'Sem data',
                    },
                  }))
                : [{ 
                    value: 'Sem dados no SESP', 
                    source: { form: 'LABORATORIO GERAL', date: '', location: '' } 
                  }],
          },
          {
            title: 'Aspartato Aminotransferase',
            isList: true,
            items:
              allAST.length > 0
                ? allAST.map((item) => ({
                    value: item.value || 'Sem dados no SESP',
                    source: {
                      form: item?.encounter?.form?.display || 'LABORATORIO GERAL',
                      date: formatDate(item.obsDatetime) || 'Sem data',
                    },
                  }))
                : [{ 
                    value: 'Sem dados no SESP', 
                    source: { form: 'LABORATORIO GERAL', date: '', location: '' } 
                  }],
          },
          {
            title: 'Alanina Aminotransferase',
            isList: true,
            items:
              allALT.length > 0
                ? allALT.map((item) => ({
                    value: item.value || 'Sem dados no SESP',
                    source: {
                      form: item?.encounter?.form?.display || 'LABORATORIO GERAL',
                      date: formatDate(item.obsDatetime) || 'Sem data',
                    },
                  }))
                : [{ 
                    value: 'Sem dados no SESP', 
                    source: { form: 'LABORATORIO GERAL', date: '', location: '' } 
                  }],
          },
          {
            title: 'Amilase (AMI)',
            isList: true,
            items:
              allAMI.length > 0
                ? allAMI.map((item) => ({
                    value: item.value || 'Sem dados no SESP',
                    source: {
                      form: item?.encounter?.form?.display || 'LABORATORIO GERAL',
                      date: formatDate(item.obsDatetime) || 'Sem data',
                    },
                  }))
                : [{ 
                    value: 'Sem dados no SESP', 
                    source: { form: 'LABORATORIO GERAL', date: '', location: '' } 
                  }],
          },
          {
            title: 'Glucose (GLC)',
            isList: true,
            items:
              allGLC.length > 0
                ? allGLC.map((item) => ({
                    value: item.value || 'Sem dados no SESP',
                    source: {
                      form: item?.encounter?.form?.display || 'LABORATORIO GERAL',
                      date: formatDate(item.obsDatetime) || 'Sem data',
                    },
                  }))
                : [{ 
                    value: 'Sem dados no SESP', 
                    source: { form: 'LABORATORIO GERAL', date: '', location: '' } 
                  }],
          },
          {
            title: 'PCR',
            isList: true,
            items:
              allPCR.length > 0
                ? allPCR.map((item) => ({
                    value: item.value || 'Sem dados no SESP',
                    source: {
                      form: item?.encounter?.form?.display || 'LABORATORIO GERAL',
                      date: formatDate(item.obsDatetime) || 'Sem data',
                    },
                  }))
                : [{ 
                    value: 'Sem dados no SESP', 
                    source: { form: 'LABORATORIO GERAL', date: '', location: '' } 
                  }],
          },
    ];
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