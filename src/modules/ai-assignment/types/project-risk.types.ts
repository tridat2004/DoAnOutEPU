export interface AiProjectRiskSummaryPayload {
  project: {
    id: string;
    name: string;
    projectKey: string;
    description: string | null;
  };
  taskSummary: {
    totalTasks: number;
    byStatus: Array<{
      code: string;
      name: string;
      count: number;
    }>;
  };
  prioritySummary: Array<{
    code: string;
    name: string;
    count: number;
  }>;
  workloadSummary: Array<{
    fullName: string;
    role: string;
    totalAssignedTasks: number;
    openTasks: number;
    doneTasks: number;
  }>;
  dueSummary: {
    overdueTasks: number;
    dueToday: number;
    dueThisWeek: number;
  };
  recentActivities: Array<{
    fieldName: string;
    oldValue: string | null;
    newValue: string | null;
    taskCode: string;
    taskTitle: string;
    changedByFullName: string;
    createdAt: string;
  }>;
  tasks: Array<{
    id: string;
    taskCode: string;
    title: string;
    description: string | null;
    statusCode: string;
    statusName: string;
    priorityCode: string;
    priorityName: string;
    assigneeFullName: string | null;
    dueDate: string | null;
    estimatedHours: number | null;
    updatedAt: string;
  }>;
}

export interface AiProjectRiskSummaryResponse {
  projectRiskLevel: 'good' | 'medium' | 'at_risk';
  topRisks: string[];
  overloadedMembers: Array<{
    fullName: string;
    openTasks: number;
  }>;
  tasksNeedingAttention: Array<{
    taskCode: string;
    title: string;
    reason: string;
  }>;
  recommendedActions: string[];
}

export interface AiTaskRiskPayload {
  project: {
    id: string;
    name: string;
    projectKey: string;
  };
  task: {
    id: string;
    taskCode: string;
    title: string;
    description: string | null;
    statusCode: string;
    statusName: string;
    priorityCode: string;
    priorityName: string;
    assigneeFullName: string | null;
    dueDate: string | null;
    estimatedHours: number | null;
    createdAt: string;
    updatedAt: string;
  };
  recentActivities: Array<{
    fieldName: string;
    oldValue: string | null;
    newValue: string | null;
    changedByFullName: string;
    createdAt: string;
  }>;
  comments: Array<{
    authorFullName: string;
    content: string;
    createdAt: string;
  }>;
  workloadContext: {
    assigneeOpenTasks: number | null;
    assigneeDoneTasks: number | null;
  };
}

export interface AiTaskRiskResponse {
  taskRiskLevel: 'good' | 'medium' | 'at_risk';
  reasons: string[];
  blockerSummary: string;
  shouldEscalatePriority: boolean;
  suggestedPriorityCode: 'low' | 'medium' | 'high' | null;
  suggestedNextAction: string;
}