import { Cohort } from 'src/entities/cohort/Cohort'
import { CohortMember } from 'src/entities/cohort/CohortMember'

export class CohortWithMembers {
  cohort!: Cohort
  members: CohortMember[] = []

  constructor(init?: Partial<CohortWithMembers>) {
    if (init) Object.assign(this, init)
  }

  static fromDTO(dto: any): CohortWithMembers {
    return new CohortWithMembers({
      cohort: Cohort.fromDTO(dto.cohort),
      members: (dto.members ?? []).map((m: any) => CohortMember.fromDTO(m)),
    })
  }
}
