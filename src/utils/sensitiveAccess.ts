interface SensitiveAccessParams {
  employeeId?: string | null;
  assignedToId?: string | null;
  allowIfSameAssignee?: boolean; // future flexibility
}

export const canViewSensitiveData = ({
  employeeId,
  assignedToId,
  allowIfSameAssignee = true,
}: SensitiveAccessParams): boolean => {
  if (!employeeId || !assignedToId) return false;

  if (allowIfSameAssignee && employeeId === assignedToId) {
    return true;
  }

  return false;
};
