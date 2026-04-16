export interface AiRecommendPayload {
  task: {
    id: string;
    title: string;
    description: string | null;
    taskType: string;
    priority: string;
  };
  candidates: Array<{
    userId: string;
    fullName: string;
    email: string;
    role: string;
    skills: Array<{
      skillName: string;
      levelScore: number;
    }>;
    openTasksCount: number;
    isCurrentAssignee: boolean;
  }>;
}

export interface AiRecommendResponse {
  recommendedUserId: string;
  finalScore: number;
  reasonText: string;
  scoreBreakdownJson: Record<string, number> | null;
  topCandidates?: Array<{
    userId: string;
    fullName: string;
    finalScore: number;
  }>;
}