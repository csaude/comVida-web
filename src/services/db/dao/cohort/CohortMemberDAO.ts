import DatabaseManager from 'src/services/db/DatabaseManager'
import { CohortMember } from 'src/entities/cohort/CohortMember'
import { Repository, Like } from 'typeorm'

class CohortMemberDAO {
  private cohortMemberRepo: Repository<CohortMember>

  constructor() {
    const dataSource = DatabaseManager.getInstance().getDataSource()
    this.cohortMemberRepo = dataSource.getRepository(CohortMember)
  }

  // Criar um novo CohortMember
  async create(cohortMemberData: Partial<CohortMember>): Promise<CohortMember> {
    const cohortMember = this.cohortMemberRepo.create(cohortMemberData)
    return await this.cohortMemberRepo.save(cohortMember)
  }

  // Obter todos os CohortMembers
  async getAll(): Promise<CohortMember[]> {
    return await this.cohortMemberRepo.find({
      relations: ['cohort', 'patient'],
    })
  }

  // Obter um CohortMember por ID
  async getById(id: number): Promise<CohortMember | null> {
    return await this.cohortMemberRepo.findOne({
      where: { id },
      relations: ['cohort', 'patient'],
    })
  }

  // Atualizar um CohortMember
  async update(
    id: number,
    updateData: Partial<CohortMember>,
  ): Promise<CohortMember> {
    const cohortMember = await this.cohortMemberRepo.findOneBy({ id })

    if (!cohortMember) {
      throw new Error('CohortMember not found')
    }

    Object.assign(cohortMember, updateData)
    return await this.cohortMemberRepo.save(cohortMember)
  }

  // Deletar um CohortMember
  async delete(id: number): Promise<void> {
    const cohortMember = await this.cohortMemberRepo.findOneBy({ id })

    if (!cohortMember) {
      throw new Error('CohortMember not found')
    }

    await this.cohortMemberRepo.remove(cohortMember)
  }

  // Buscar CohortMembers por UUID, Cohort ou Patient
  async search(criteria: string): Promise<CohortMember[]> {
    try {
      return await this.cohortMemberRepo.find({
        where: [
          { uuid: Like(`%${criteria}%`) },
          { cohort: { name: Like(`%${criteria}%`) } },
          { patient: { names: Like(`%${criteria}%`) } },
        ],
        relations: ['cohort', 'patient'],
        order: { inclusionDate: 'DESC' }, // Ordenar pela data de início, mais recente primeiro
      })
    } catch (error) {
      console.error('Error searching for cohort members:', error)
      throw new Error('Failed to search cohort members')
    }
  }
}

export default new CohortMemberDAO()
