<template>
  <q-card flat bordered class="q-mb-sm q-pa-sm" @click="handleClick">
    <div class="row no-wrap items-center">
      <!-- Gender Icon -->
      <div class="q-mr-md">
        <q-icon :name="genderIcon" :color="genderColor" size="lg" />
      </div>

      <!-- Details -->
      <div class="col">
        <div class="text-weight-bold text-lg">{{ name }}</div>
        <div class="text-caption">{{ nid }}</div>
        <div class="text-caption">{{ location }}</div>
      </div>

      <!-- Age Chip and Death Badge -->
      <div class="row items-center q-ml-md">
        <q-chip
          color="grey-5"
          text-color="black"
          size="sm"
          outlined
          class="q-mr-sm"
        >
          {{ age }} anos
        </q-chip>
        <q-badge
          v-if="dead"
          color="red"
          text-color="white"
          class="q-ml-sm"
        >
          Óbito
        </q-badge>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  nid: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true, // 'M' or 'F'
  },
  dead: {
    type: Boolean,
    required: true,
  },
  uuid: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['open']);

const handleClick =()=> {
  emit('open', props.uuid, props.name, props.nid);
  }

// Gender icon and color mapping
const genderIcon = computed(() => (props.gender === 'M' ? 'male' : 'female'));
const genderColor = computed(() => (props.gender === 'M' ? 'blue' : 'pink'));
</script>

<style scoped>
.q-card {
  border: 1px solid #e0e0e0;
}
.text-lg {
  font-size: 1.2em;
}
</style>
