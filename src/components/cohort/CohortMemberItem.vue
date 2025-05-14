<template>
  <q-slide-item
    ref="slideRef"
    @right="onCall"
    right-color="grey-2"
    class="slide-item"
  >
    <!-- Slide Action -->
    <template v-slot:right>
      <q-btn flat icon="phone" color="green" label="Ligar" />
    </template>

    <!-- Member Card -->
    <q-card class="q-mb-sm q-pa-sm rounded-card" flat bordered @click="$emit('selected', member)">
      <div class="row items-start justify-between">
        <!-- Icon and Info -->
        <div class="row no-wrap items-start q-gutter-sm">
          <q-icon
            :name="genderIcon"
            :color="genderColor"
            size="sm"
            class="q-mt-s"
          />

          <div>
            <!-- Statuses -->
            <div class="row q-gutter-xs q-mb-xs">
              <q-badge
                v-for="status in member.statuses"
                :key="status"
                :label="status"
                class="text-caption"
                :color="getStatusColor(status)"
                flat
              />
            </div>

            <div class="text-body1 text-weight-medium">{{ member.name }}</div>
            <div class="text-body1 text-green-8">{{ member.nid }}</div>
            <div class="text-caption text-grey-8 ellipsis">{{ member.address }}</div>
          </div>
        </div>

        <!-- Age -->
        <div class="text-caption text-grey-10 q-mt-xs">
          {{ member.age }} Anos
        </div>
      </div>
    </q-card>
  </q-slide-item>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';

const props = defineProps({
  member: Object
});

defineEmits(['selected'])
const { alertWarningAction } = useSwal();
const slideRef = ref(null);

const genderIcon = computed(() =>
  props.member.gender === 'M' ? 'male' : 'female'
);
const genderColor = computed(() =>
  props.member.gender === 'M' ? 'blue' : 'pink'
);

const getStatusColor = (status) => {
  if (status === 'AL') return 'green-5';
  if (status === 'SIM') return 'orange-5';
  if (status === 'AA') return 'pink-5';
  return 'grey-5';
};

const onCall = async () => {
  const phone = props.member.phoneNumber;
  const name = props.member.name;

  if (!phone) {
    slideRef.value?.reset();
    return;
  }

  const confirmed = await alertWarningAction(
    `Deseja ligar para ${name} (${phone})?`
  );

  slideRef.value?.reset();

  if (confirmed) {
    window.open(`tel:${phone}`, '_self');
  }
};
</script>

<style scoped>
.rounded-card {
  border-radius: 5px;
  border-color: #f5f5f5;
  background-color: white;
}
.slide-item {
  background-color: #f5f5f5;
}
</style>
