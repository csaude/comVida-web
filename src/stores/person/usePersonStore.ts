import { defineStore } from 'pinia'
import PersonService from 'src/services/person/PersonService'
import { Person } from 'src/entities/person/Person'

export const usePersonStore = defineStore('person', {
  state: () => ({
    personsPages: {} as Record<number, Person[]>, // cache das páginas
    currentPagePersons: [] as Person[], // pessoas da página atual
    currentPerson: null as Person | null,
    loading: false,
    error: null as string | null,
    pagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
    },
  }),

  actions: {
    async fetchPersons(
      params: {
        page?: number
        size?: number
        sort?: string
        [key: string]: any
      } = {},
    ) {
      const page = params.page ?? 0

      if (this.personsPages[page]) {
        this.currentPagePersons = this.personsPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null
      try {
        const response = await PersonService.getAll(params)
        const persons = response.content.map((dto: any) => Person.fromDTO(dto))

        this.personsPages[page] = persons
        this.currentPagePersons = persons

        this.pagination = {
          totalSize: response.totalSize,
          totalPages: response.totalPages,
          currentPage: response.number,
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar pessoas'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async getPersonDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await PersonService.getById(id)
        this.currentPerson = Person.fromDTO(dto)
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes da pessoa'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async savePerson(data: Partial<Person>) {
      this.error = null
      try {
        const dtoToSend =
          data instanceof Person ? data.toDTO() : new Person(data).toDTO()

        const savedDto = await PersonService.save(dtoToSend)
        const saved = Person.fromDTO(savedDto)

        const page = this.pagination.currentPage
        if (this.personsPages[page]) {
          const index = this.personsPages[page].findIndex(
            (p) => p.id === saved.id,
          )
          if (index !== -1) {
            this.personsPages[page][index] = saved
          } else {
            this.personsPages[page].push(saved)
          }
          this.currentPagePersons = this.personsPages[page]
        }

        this.currentPerson = saved
      } catch (error: any) {
        this.error = 'Erro ao salvar pessoa'
        console.error(error)
      }
    },

    async deletePerson(id: number) {
      this.error = null
      try {
        await PersonService.delete(id)

        for (const page in this.personsPages) {
          this.personsPages[page] = this.personsPages[page].filter(
            (p) => p.id !== id,
          )
        }

        this.currentPagePersons =
          this.personsPages[this.pagination.currentPage] ?? []

        if (this.currentPerson?.id === id) {
          this.currentPerson = null
        }
      } catch (error: any) {
        this.error = 'Erro ao apagar pessoa'
        console.error(error)
      }
    },
  },
})
