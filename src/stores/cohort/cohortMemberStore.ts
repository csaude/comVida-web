import { defineStore } from 'pinia';
import CohortMemberService from 'src/services/cohort/CohortMemberService';
import { CohortMember } from 'src/entities/cohort/CohortMember';

export const useCohortMemberStore = defineStore('cohortMember', {
  state: () => ({
    members: [] as CohortMember[],
    currentMember: null as CohortMember | null,
  }),
  actions: {
    async fetchMembers() {
      try {
        this.members = await CohortMemberService.getAll();
      } catch (error) {
        console.error('Error fetching cohort members:', error);
      }
    },

    async getMemberDetails(id: number) {
      try {
        this.currentMember = await CohortMemberService.getById(id);
      } catch (error) {
        console.error('Error fetching member details:', error);
      }
    },

    async saveMember(memberData: Partial<CohortMember>) {
      try {
        const newMember = await CohortMemberService.save(memberData);
        this.members.push(newMember);
      } catch (error) {
        console.error('Error saving cohort member:', error);
      }
    },

    async deleteMember(id: number) {
      try {
        await CohortMemberService.delete(id);
        this.members = this.members.filter((member) => member.id !== id);
      } catch (error) {
        console.error('Error deleting cohort member:', error);
      }
    },
  },
});
