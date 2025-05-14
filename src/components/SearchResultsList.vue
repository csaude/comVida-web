<template>
    <q-list class="q-px-md">
      <!-- Render Search Result Items -->
      <SearchResultItem
        v-for="result in results"
        :key="result.uuid"
        :name="getName(result)"
        :nid="getNID(result)"
        :location="getLocation(result)"
        :age="result.person.age"
        :gender="result.person.gender"
        :dead="result.person.dead"
        :uuid="result.uuid"
        @open="open"
      />
  
      <!-- Infinite Scroll -->
      <q-infinite-scroll
        :offset="300"
        @load="emitLoadNext"
        v-if="nextUrl"
      >
      <q-spinner size="md" color="primary" v-if="loadingNext" />
      </q-infinite-scroll>
    </q-list>
  </template>
  
  <script setup>
  import SearchResultItem from './SearchResultItem.vue';
  
  const props = defineProps({
    results: {
      type: Array,
      required: true,
    },
    nextUrl: {
      type: String,
      default: null,
    },
    loadingNext: {
        type: Boolean,
        default: false,
    },
  });
  
  const emit = defineEmits(['load-next', 'open']);
  
  // Helper methods for extracting data
  const getNID = (result) => {
    const displayParts = result.display?.split(' - ');
    return displayParts?.[0]?.trim() || 'N/A';
  };
  
  const getName = (result) => {
    const displayParts = result.display?.split(' - ');
    return displayParts?.[1]?.trim() || 'Unknown Name';
  };
  
  const getLocation = (result) => {
    const identifier = result.identifiers?.[0];
    return identifier?.location?.name || 'Unknown Location';
  };

  const open =(uuid, name, nid)=> {
    emit('open', uuid, name, nid);
  }
  
  // Emit load-next event
  function emitLoadNext(done) {
    emit('load-next', props.nextUrl, done);
  }
  </script>
  
  <style scoped>
  .q-list {
    background-color: white;
  }
  </style>
  