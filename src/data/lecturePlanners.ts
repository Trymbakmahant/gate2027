import lecturePlannersData from './lecturePlanners.json';

export interface LectureSession {
  sessionNumber?: number;
  lectureNumber: number | null;
  chapter: string;
  topic?: string;
  date: string;
  isoDate: string;
  dayOfWeek: string;
  timing?: string;
  dpp: string | null;
  test: string | null;
  isClass?: boolean;
}

export interface ChapterSummary {
  name: string;
  lectures: number;
}

export interface SubjectLecturePlanner {
  subject: string;
  targetExam: string;
  totalSessions?: number;
  totalLectures: number;
  noClassSessions?: number;
  totalDpps: number;
  totalTests: number;
  dateRange: {
    start: string;
    end: string;
  };
  chapters?: ChapterSummary[];
  schedule: LectureSession[];
}

export interface LecturePlannersCollection {
  title: string;
  source: string;
  lastUpdated: string;
  subjects: {
    dbms: SubjectLecturePlanner;
    probabilityAndStatistics: SubjectLecturePlanner;
    machineLearning: SubjectLecturePlanner;
    artificialIntelligence: SubjectLecturePlanner;
    dataStructuresPython: SubjectLecturePlanner;
    linearAlgebra: SubjectLecturePlanner;
    calculusAndOptimization: SubjectLecturePlanner;
  };
}

export type SubjectPlannerKey =
  | 'dbms'
  | 'probabilityAndStatistics'
  | 'machineLearning'
  | 'artificialIntelligence'
  | 'dataStructuresPython'
  | 'linearAlgebra'
  | 'calculusAndOptimization';

export const LECTURE_PLANNERS = lecturePlannersData as unknown as LecturePlannersCollection;

export function getSubjectPlanner(subjectKey: SubjectPlannerKey): SubjectLecturePlanner {
  return LECTURE_PLANNERS.subjects[subjectKey];
}
