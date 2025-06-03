export interface BaseEntity {
  id: number;
  uuid: string;
  createdBy: string;
  createdAt: string; // ISO format; pode usar Date se converter
  updatedBy?: string;
  updatedAt?: string;
  lifeCycleStatus: string; // Ou LifeCycleStatus se usar enum
}
