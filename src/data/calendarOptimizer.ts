/**
 * Calendar Optimizer Engine for GATE DA 2027
 * Sequences all 195 pre-recorded lectures in optimal pedagogical dependency order,
 * computes dynamic fast-track daily schedules starting from October 6, 2026,
 * and builds the Mock Test Runway up to GATE Exam Day (February 6, 2027).
 */

import lecturePlannersData from './lecturePlanners.json';

export interface OptimizedLecture {
  id: string; // e.g. "linearAlgebra-lec-1"
  subjectKey: string;
  subjectName: string;
  lectureNumber: number;
  chapter: string;
  topic?: string;
  timing?: string;
  dpp: string | null;
  test: string | null;
  badgeColor: string;
  badgeBg: string;
  orderIndex: number; // 1 to 195
}

export interface DayCalendarSchedule {
  dateStr: string; // "YYYY-MM-DD"
  dateObj: Date;
  dayNumber: number; // 1, 2, 3...
  dayOfWeek: string;
  monthName: string;
  dayOfMonth: number;
  isToday: boolean;
  phase: 'lectures' | 'mock-phase';
  lectures: OptimizedLecture[];
  milestones: string[];
  mockActivity?: {
    title: string;
    type: 'sectional' | 'full-mock' | 'pyq-review' | 'formula-sprint' | 'rest-buffer';
    description: string;
    durationHours: number;
  };
}

export interface SubjectMilestone {
  subjectKey: string;
  subjectName: string;
  totalLectures: number;
  startDateStr: string;
  finishDateStr: string;
  dayRangeStart: number;
  dayRangeEnd: number;
  badgeBg: string;
  badgeColor: string;
}

export interface PacingConfig {
  lecturesPerDay: number; // e.g. 2, 3, 4, 5
  startDateStr: string; // "2026-10-06"
  targetExamDateStr: string; // "2027-02-06"
  trackMode: 'sequential' | 'balanced'; // sequential = finish subject by subject, balanced = alternate math & AI/CS
}

export const SUBJECT_METADATA: Record<
  string,
  { name: string; badgeBg: string; badgeColor: string; priority: string; description: string }
> = {
  linearAlgebra: {
    name: 'Linear Algebra',
    badgeBg: '#ede9fe',
    badgeColor: '#6d28d9',
    priority: 'Bedrock Math',
    description: 'Matrices, Vector Spaces, Eigenvalues & SVD (Prerequisite for ML)',
  },
  calculusAndOptimization: {
    name: 'Calculus & Optimization',
    badgeBg: '#fef3c7',
    badgeColor: '#b45309',
    priority: 'Core Math',
    description: 'Maxima/Minima, Gradient, Hessian & Optimization (Prerequisite for Loss Optimization)',
  },
  probabilityAndStatistics: {
    name: 'Probability & Statistics',
    badgeBg: '#ffe4e6',
    badgeColor: '#be123c',
    priority: 'High Weightage',
    description: 'Random Variables, Distributions & Bayes Rule (Critical for ML & AI)',
  },
  dataStructuresPython: {
    name: 'Data Structures (Python)',
    badgeBg: '#dcfce7',
    badgeColor: '#15803d',
    priority: 'Core Coding',
    description: 'Arrays, Stacks, Queues, Trees & Hash Tables (Foundation for Search Algorithms)',
  },
  dbms: {
    name: 'DBMS',
    badgeBg: '#e0f2fe',
    badgeColor: '#0369a1',
    priority: 'Quick Scoring',
    description: 'ER Models, Relational Algebra, SQL, Normalization & Indexing',
  },
  machineLearning: {
    name: 'Machine Learning',
    badgeBg: '#fce7f3',
    badgeColor: '#be185d',
    priority: 'Top Weightage',
    description: 'Regression, Classification, SVM, Decision Trees, MLPs & Clustering',
  },
  artificialIntelligence: {
    name: 'Artificial Intelligence',
    badgeBg: '#e0e7ff',
    badgeColor: '#4338ca',
    priority: 'Core DA',
    description: 'Uninformed/Informed Search, Adversarial Search & Propositional Logic',
  },
};

/**
 * Extract all 195 lectures in pedagogical order:
 * 1. Linear Algebra (20)
 * 2. Calculus & Optimization (16)
 * 3. Probability & Statistics (30)
 * 4. Data Structures Through Python (33)
 * 5. DBMS (15)
 * 6. Machine Learning (43)
 * 7. Artificial Intelligence (38)
 */
export function getAllOrderedLectures(): OptimizedLecture[] {
  const subjectsData = (lecturePlannersData as any).subjects;
  const orderedSubjectKeys = [
    'linearAlgebra',
    'calculusAndOptimization',
    'probabilityAndStatistics',
    'dataStructuresPython',
    'dbms',
    'machineLearning',
    'artificialIntelligence',
  ];

  const allLectures: OptimizedLecture[] = [];
  let globalIndex = 1;

  for (const subKey of orderedSubjectKeys) {
    const subObj = subjectsData[subKey];
    if (!subObj || !subObj.schedule) continue;

    const meta = SUBJECT_METADATA[subKey] || {
      name: subObj.subject,
      badgeBg: '#f4f4f5',
      badgeColor: '#18181b',
    };

    for (const session of subObj.schedule) {
      if (!session.lectureNumber) continue;
      allLectures.push({
        id: `${subKey}-lec-${session.lectureNumber}`,
        subjectKey: subKey,
        subjectName: meta.name,
        lectureNumber: session.lectureNumber,
        chapter: session.chapter || 'Core Module',
        topic: session.topic,
        timing: session.timing,
        dpp: session.dpp || null,
        test: session.test || null,
        badgeColor: meta.badgeColor,
        badgeBg: meta.badgeBg,
        orderIndex: globalIndex++,
      });
    }
  }

  return allLectures;
}

/**
 * Generate calendar schedule from Oct 6, 2026 until Feb 6, 2027
 */
export function generateOptimizedCalendar(config: PacingConfig): {
  days: DayCalendarSchedule[];
  milestones: SubjectMilestone[];
  totalLectures: number;
  lecturesPerDay: number;
  lectureCompletionDateStr: string;
  mockDaysCount: number;
  totalDays: number;
} {
  const allLectures = getAllOrderedLectures();
  const totalLectures = allLectures.length; // 195
  const pace = Math.max(1, Math.min(6, config.lecturesPerDay));

  const startDate = new Date(config.startDateStr + 'T00:00:00');
  const targetExamDate = new Date(config.targetExamDateStr + 'T00:00:00');

  const days: DayCalendarSchedule[] = [];
  const milestones: SubjectMilestone[] = [];

  // Track subject start & finish
  const subjectBounds: Record<
    string,
    { startDay?: number; finishDay?: number; startDate?: string; finishDate?: string; count: number }
  > = {};

  let lectureCursor = 0;
  let currentDate = new Date(startDate);
  let dayCounter = 1;

  const todayStr = '2026-10-06'; // Base today per requirements

  // 1. Fill lecture days
  while (lectureCursor < totalLectures) {
    const dayStr = currentDate.toISOString().split('T')[0];
    const dayLectures: OptimizedLecture[] = [];
    const dayMilestones: string[] = [];

    for (let i = 0; i < pace && lectureCursor < totalLectures; i++) {
      const lec = allLectures[lectureCursor];
      dayLectures.push(lec);

      // Track subject first appearance
      if (!subjectBounds[lec.subjectKey]) {
        subjectBounds[lec.subjectKey] = {
          startDay: dayCounter,
          startDate: dayStr,
          count: 0,
        };
      }
      subjectBounds[lec.subjectKey].count++;

      // Check if this was the last lecture of this subject
      const isLastOfSub =
        lectureCursor === totalLectures - 1 ||
        allLectures[lectureCursor + 1].subjectKey !== lec.subjectKey;

      if (isLastOfSub) {
        subjectBounds[lec.subjectKey].finishDay = dayCounter;
        subjectBounds[lec.subjectKey].finishDate = dayStr;
        dayMilestones.push(`🏁 Completed all ${subjectBounds[lec.subjectKey].count} lectures of ${lec.subjectName}!`);
      }

      lectureCursor++;
    }

    if (lectureCursor === totalLectures) {
      dayMilestones.push('🚀 ALL 195 PRE-RECORDED LECTURES COMPLETED! TRANSITIONING TO MOCK RUNWAY!');
    }

    const daySchedule: DayCalendarSchedule = {
      dateStr: dayStr,
      dateObj: new Date(currentDate),
      dayNumber: dayCounter,
      dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
      monthName: currentDate.toLocaleDateString('en-US', { month: 'long' }),
      dayOfMonth: currentDate.getDate(),
      isToday: dayStr === todayStr,
      phase: 'lectures',
      lectures: dayLectures,
      milestones: dayMilestones,
    };

    days.push(daySchedule);

    currentDate.setDate(currentDate.getDate() + 1);
    dayCounter++;
  }

  const lectureCompletionDateStr = days[days.length - 1].dateStr;

  // Build subject milestones list
  for (const [subKey, bounds] of Object.entries(subjectBounds)) {
    const meta = SUBJECT_METADATA[subKey];
    milestones.push({
      subjectKey: subKey,
      subjectName: meta?.name || subKey,
      totalLectures: bounds.count,
      startDateStr: bounds.startDate || '',
      finishDateStr: bounds.finishDate || '',
      dayRangeStart: bounds.startDay || 1,
      dayRangeEnd: bounds.finishDay || 1,
      badgeBg: meta?.badgeBg || '#f4f4f5',
      badgeColor: meta?.badgeColor || '#18181b',
    });
  }

  // 2. Fill mock phase days until Exam Date
  const mockPlanActivities = [
    { title: 'Maths Sectional Test 01', type: 'sectional' as const, desc: 'Linear Algebra & Calculus 30-mark timed sectional + notebook logging', hours: 3 },
    { title: 'Probability & Stats Deep Drill', type: 'pyq-review' as const, desc: 'Bivariate RVs & Bayes theorem 2024-2026 PYQs solve', hours: 4 },
    { title: 'CS Foundations Sectional', type: 'sectional' as const, desc: 'Python Data Structures (Trees, Hashing) + DBMS Normalization mock', hours: 3 },
    { title: 'ML Sectional Mock 01', type: 'sectional' as const, desc: 'Regression, Classification & SVM numericals test', hours: 3 },
    { title: 'AI Logic & Search Drill', type: 'pyq-review' as const, desc: 'Adversarial minimax & Alpha-Beta pruning tricky PYQs', hours: 3.5 },
    { title: 'FULL LENGTH MOCK 01 (FLT-1)', type: 'full-mock' as const, desc: 'Simulated 3-hr GATE DA computer-based test (65 Qs / 100 Marks)', hours: 5 },
    { title: 'FLT-1 Mistake Notebook Surgery', type: 'pyq-review' as const, desc: 'Deep forensic review of all wrong & unattempted questions from FLT-1', hours: 4 },
    { title: 'Multi-Subject Combo Mock (Math + ML)', type: 'sectional' as const, desc: '50-mark timed sectional focusing on high-weightage math + ML intersection', hours: 3.5 },
    { title: 'FULL LENGTH MOCK 02 (FLT-2)', type: 'full-mock' as const, desc: '65 Questions / 100 Marks. Strict timing with GATE Virtual Calculator', hours: 5 },
    { title: 'FLT-2 Mistake & Concept Patching', type: 'pyq-review' as const, desc: 'Review weak spots identified in FLT-2; formula sheet update', hours: 4 },
    { title: 'FULL LENGTH MOCK 03 (FLT-3)', type: 'full-mock' as const, desc: 'All 7 subjects full exam simulation', hours: 5 },
    { title: 'FLT-3 Deep Error Analysis', type: 'pyq-review' as const, desc: 'Catalogue silly mistakes vs concept gaps in Mistake Notebook', hours: 4 },
    { title: 'FULL LENGTH MOCK 04 (FLT-4)', type: 'full-mock' as const, desc: 'Aiming for 50+ marks milestone threshold', hours: 5 },
    { title: 'Speed & Accuracy Re-Calibration', type: 'pyq-review' as const, desc: 'Time management drill: Q1-30 in 60 mins; Virtual calc practice', hours: 3.5 },
    { title: 'FULL LENGTH MOCK 05 (FLT-5)', type: 'full-mock' as const, desc: 'Strict negative marking discipline test', hours: 5 },
    { title: 'FULL LENGTH MOCK 06 (FLT-6)', type: 'full-mock' as const, desc: 'Mid-point benchmark exam', hours: 5 },
    { title: 'High-Weightage PYQ Marathon', type: 'pyq-review' as const, desc: 'Re-solving top 50 trickiest GATE DA questions from past papers', hours: 4 },
    { title: 'FULL LENGTH MOCK 07 (FLT-7)', type: 'full-mock' as const, desc: 'Full exam simulation', hours: 5 },
    { title: 'FULL LENGTH MOCK 08 (FLT-8)', type: 'full-mock' as const, desc: 'Consistency validation exam', hours: 5 },
    { title: 'FULL LENGTH MOCK 09 (FLT-9)', type: 'full-mock' as const, desc: 'High difficulty challenge paper', hours: 5 },
    { title: 'FULL LENGTH MOCK 10 (FLT-10)', type: 'full-mock' as const, desc: 'Simulated morning slot exam (9:30 AM - 12:30 PM)', hours: 5 },
    { title: 'Formula Master Sprint (All 7 Subjects)', type: 'formula-sprint' as const, desc: 'Rapid recall of all Eigenvalue properties, Bayes formulas, ML cost functions', hours: 4 },
    { title: 'FULL LENGTH MOCK 11 (FLT-11)', type: 'full-mock' as const, desc: 'Final stretch simulation', hours: 5 },
    { title: 'FULL LENGTH MOCK 12 (FINAL FLT)', type: 'full-mock' as const, desc: 'Dress rehearsal mock test', hours: 5 },
    { title: 'Mistake Notebook Final Sweep', type: 'formula-sprint' as const, desc: 'Re-read all logged traps to guarantee zero repeat mistakes', hours: 3.5 },
    { title: 'Exam Day Eve Mindset & Rest', type: 'rest-buffer' as const, desc: 'Formula sheet scan, admit card checklist, sleep early & stay calm', hours: 2 },
  ];

  let mockPlanIndex = 0;
  let mockDaysCount = 0;

  while (currentDate <= targetExamDate) {
    const dayStr = currentDate.toISOString().split('T')[0];
    const isExamDay = dayStr === config.targetExamDateStr;

    const activityTemplate = mockPlanActivities[mockPlanIndex % mockPlanActivities.length];
    mockPlanIndex++;
    mockDaysCount++;

    const dayMilestones: string[] = [];
    if (isExamDay) {
      dayMilestones.push('🎯 GATE 2027 EXAM DAY! CONFIDENCE HIGH — 45+ MARKS SECURED!');
    }

    days.push({
      dateStr: dayStr,
      dateObj: new Date(currentDate),
      dayNumber: dayCounter,
      dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
      monthName: currentDate.toLocaleDateString('en-US', { month: 'long' }),
      dayOfMonth: currentDate.getDate(),
      isToday: dayStr === todayStr,
      phase: 'mock-phase',
      lectures: [],
      milestones: dayMilestones,
      mockActivity: isExamDay
        ? {
            title: 'GATE DA 2027 OFFICIAL EXAM',
            type: 'full-mock',
            description: 'Execute your strategy with calm focus. Read questions carefully and dominate!',
            durationHours: 3.5,
          }
        : {
            title: activityTemplate.title,
            type: activityTemplate.type,
            description: activityTemplate.desc,
            durationHours: activityTemplate.hours,
          },
    });

    currentDate.setDate(currentDate.getDate() + 1);
    dayCounter++;
  }

  return {
    days,
    milestones,
    totalLectures,
    lecturesPerDay: pace,
    lectureCompletionDateStr,
    mockDaysCount,
    totalDays: days.length,
  };
}
