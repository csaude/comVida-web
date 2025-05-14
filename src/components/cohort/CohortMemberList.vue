<template>
  <div class="q-mt-sm">
    <div v-if="members.length === 0" class="text-center q-pa-md text-grey">
      <q-icon name="people_outline" size="48px" class="q-mb-sm" />
      <div>Nenhum utente encontrado</div>
    </div>
    <q-list v-else  class="rounded-borders bg-white">
      <CohortMemberItem
        v-for="member in members"
        :key="member.id"
        :member="member"
      />
    </q-list>
  </div>
</template>


<script setup>
import CohortMemberItem from './CohortMemberItem.vue';

defineProps({
  members: {
    type: Array,
    required: true
  }
});
</script>

<style scoped>
.rounded-borders {
  border-radius: 5px;
}
</style>
