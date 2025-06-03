import { BaseEntity } from '../base/base-entity'

export interface Cohort extends BaseEntity {
  name: string
  description?: string
  templateFile: string | ArrayBuffer | Uint8Array // depende da forma como será usado
}
