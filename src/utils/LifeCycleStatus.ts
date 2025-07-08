export enum LifeCycleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED',
}

export const listAllLifeCycleStatuses = () => {
  return Object.values(LifeCycleStatus);
};

export const listActiveAndInactiveLifeCycleStatuses = () => {
  return [LifeCycleStatus.ACTIVE, LifeCycleStatus.INACTIVE];
};
