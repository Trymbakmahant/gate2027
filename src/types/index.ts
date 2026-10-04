export type ConfidenceRating = 'G' | 'Y' | 'R' | null;

export type DayStatus = 'pending' | 'in-progress' | 'completed';

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  type?: 'reference' | 'video' | 'pyq' | 'notes';
  addedAt?: Date | string;
}

export interface SubTaskItem {
  id?: string;
  key?: string;
  name?: string;
  label?: string;
  hours: number;
  completed?: boolean;
  desc?: string;
}

export interface DaySchedule {
  id: string;
  date: string;
  dayOfWeek: string;
  month: string;
  part: string;
  partTitle: string;
  subject: string;
  tier: 'Tier S' | 'Tier A' | 'Tier B';
  topic: string;
  subTopics?: string[];
  guidance?: string;
  isTest?: boolean;
  isSunday?: boolean;
  isCheckpoint?: boolean;
  milestone?: string;
  suggestedHours?: number;
  defaultTasks?: SubTaskItem[];
}

export interface DayProgressData {
  dayId: string;
  completed: boolean;
  status: DayStatus;
  confidence?: ConfidenceRating;
  notes: string;
  links: LinkItem[];
  subTasks: Record<string, boolean>;
  hoursLogged: number;
  lastUpdated?: Date | string;
}

export interface MistakeLogData {
  id: string;
  date: string;
  question: string;
  topic: string;
  subject: string;
  errorType: string;
  reason?: string;
  actionTaken?: string;
  referenceUrl?: string;
  resolved?: boolean;
  createdAt?: Date | string;
}

export interface MockScoreData {
  checkpointId: string;
  score: number;
  targetScore?: string;
  notes?: string;
  savedAt?: Date | string;
}

export interface RoutineBlock {
  key: string;
  name: string;
  hours: number;
  desc: string;
}

export interface TargetProgressionItem {
  date: string;
  target: string;
  desc: string;
}
