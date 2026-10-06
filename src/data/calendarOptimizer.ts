/**
 * Calendar Optimizer Engine for GATE DA 2027
 * Sequences all 195 pre-recorded lectures (each ~2.5 hours) in optimal pedagogical order.
 * Supports:
 * 1. Multi-Subject Interleaving Mode ("Curious Mind"): 2-3 non-overlapping streams daily
 *    (Math Stream + CS/Coding Stream + Applied AI/ML Stream) to prevent mental fatigue & interference.
 * 2. Single-Subject Sequential Mode: Complete one subject at a time.
 * Calculates dynamic fast-track daily schedules starting from October 6, 2026.
 */

import lecturePlannersData from './lecturePlanners.json';

export const LECTURE_DURATION_HOURS = 2.5; // Each pre-recorded lecture is ~2.5 hours

export interface OptimizedLecture {
  id: string; // e.g. "linearAlgebra-lec-1"
  subjectKey: string;
  subjectName: string;
  lectureNumber: number;
  chapter: string;
  topic?: string;
  timing?: string;
  durationHours: number; // 2.5 hours
  dpp: string | null;
  test: string | null;
  badgeColor: string;
  badgeBg: string;
  orderIndex: number; // 1 to 195
  streamCategory: 'math' | 'cs-systems' | 'ai-ml';
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
  totalStudyHours: number;
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
  lecturesPerDay: number; // e.g. 2, 3, 4
  startDateStr: string; // "2026-10-06"
  targetExamDateStr: string; // "2027-02-06"
  trackMode: 'interleaved' | 'sequential'; // interleaved = multi-subject curious mind, sequential = one subject at a time
}

export const SUBJECT_METADATA: Record<
  string,
  {
    name: string;
    badgeBg: string;
    badgeColor: string;
    priority: string;
    stream: 'math' | 'cs-systems' | 'ai-ml';
    streamTitle: string;
    description: string;
  }
> = {
  linearAlgebra: {
    name: 'Linear Algebra',
    badgeBg: '#ede9fe',
    badgeColor: '#6d28d9',
    priority: 'Bedrock Math',
    stream: 'math',
    streamTitle: 'Stream 1: Mathematical Foundations',
    description: 'Matrices, Vector Spaces, Eigenvalues & SVD (Essential for ML)',
  },
  calculusAndOptimization: {
    name: 'Calculus & Optimization',
    badgeBg: '#fef3c7',
    badgeColor: '#b45309',
    priority: 'Core Math',
    stream: 'math',
    streamTitle: 'Stream 1: Mathematical Foundations',
    description: 'Maxima/Minima, Gradient, Hessian & Optimization (Prerequisite for Loss Optimization)',
  },
  probabilityAndStatistics: {
    name: 'Probability & Statistics',
    badgeBg: '#ffe4e6',
    badgeColor: '#be123c',
    priority: 'High Weightage',
    stream: 'math',
    streamTitle: 'Stream 1: Mathematical Foundations',
    description: 'Random Variables, Distributions & Bayes Rule (Critical for ML & AI)',
  },
  dataStructuresPython: {
    name: 'Data Structures (Python)',
    badgeBg: '#dcfce7',
    badgeColor: '#15803d',
    priority: 'Core Coding',
    stream: 'cs-systems',
    streamTitle: 'Stream 2: Algorithms & Data Systems',
    description: 'Arrays, Stacks, Queues, Trees & Hash Tables (Foundation for Search Algorithms)',
  },
  dbms: {
    name: 'DBMS',
    badgeBg: '#e0f2fe',
    badgeColor: '#0369a1',
    priority: 'Quick Scoring',
    stream: 'cs-systems',
    streamTitle: 'Stream 2: Algorithms & Data Systems',
    description: 'ER Models, Relational Algebra, SQL, Normalization & Indexing',
  },
  machineLearning: {
    name: 'Machine Learning',
    badgeBg: '#fce7f3',
    badgeColor: '#be185d',
    priority: 'Top Weightage',
    stream: 'ai-ml',
    streamTitle: 'Stream 3: Core AI & Machine Learning',
    description: 'Regression, Classification, SVM, Decision Trees, MLPs & Clustering',
  },
  artificialIntelligence: {
    name: 'Artificial Intelligence',
    badgeBg: '#e0e7ff',
    badgeColor: '#4338ca',
    priority: 'Core DA',
    stream: 'ai-ml',
    streamTitle: 'Stream 3: Core AI & Machine Learning',
    description: 'Uninformed/Informed Search, Adversarial Search & Propositional Logic',
  },
};

/**
 * Format local date without any UTC offset shift.
 */
export function formatLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Parse YYYY-MM-DD string into a safe local Date (noon eliminates any timezone issues)
 */
export function parseYMD(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

/**
 * Extract all 195 lectures from lecturePlanners.json.
 */
export function getAllSubjectLectures(subjectKey: string): OptimizedLecture[] {
  const subjectsData = (lecturePlannersData as any).subjects;
  const subObj = subjectsData[subjectKey];
  if (!subObj || !subObj.schedule) return [];

  const meta = SUBJECT_METADATA[subjectKey] || {
    name: subObj.subject,
    badgeBg: '#f4f4f5',
    badgeColor: '#18181b',
    stream: 'math' as const,
    streamTitle: 'General',
  };

  const list: OptimizedLecture[] = [];
  for (const session of subObj.schedule) {
    if (!session.lectureNumber) continue;
    list.push({
      id: `${subjectKey}-lec-${session.lectureNumber}`,
      subjectKey,
      subjectName: meta.name,
      lectureNumber: session.lectureNumber,
      chapter: session.chapter || 'Core Module',
      topic: session.topic,
      timing: session.timing,
      durationHours: LECTURE_DURATION_HOURS,
      dpp: session.dpp || null,
      test: session.test || null,
      badgeColor: meta.badgeColor,
      badgeBg: meta.badgeBg,
      orderIndex: 0,
      streamCategory: meta.stream,
    });
  }
  return list;
}

/**
 * Returns all 195 lectures ordered sequentially.
 */
export function getAllOrderedLectures(): OptimizedLecture[] {
  const orderedSubjectKeys = [
    'linearAlgebra',
    'calculusAndOptimization',
    'probabilityAndStatistics',
    'dataStructuresPython',
    'dbms',
    'machineLearning',
    'artificialIntelligence',
  ];

  const all: OptimizedLecture[] = [];
  let idx = 1;
  for (const key of orderedSubjectKeys) {
    const subLecs = getAllSubjectLectures(key);
    for (const lec of subLecs) {
      lec.orderIndex = idx++;
      all.push(lec);
    }
  }
  return all;
}

/**
 * Main schedule generator supporting:
 * - trackMode: "interleaved" (Curious Mind multi-subject: Math + CS + AI daily)
 * - trackMode: "sequential" (Single subject focus)
 */
export function generateOptimizedCalendar(config: PacingConfig): {
  days: DayCalendarSchedule[];
  milestones: SubjectMilestone[];
  totalLectures: number;
  lecturesPerDay: number;
  lectureCompletionDateStr: string;
  mockDaysCount: number;
  totalDays: number;
  trackMode: 'interleaved' | 'sequential';
} {
  const pace = Math.max(1, Math.min(6, config.lecturesPerDay));
  const trackMode = config.trackMode || 'interleaved';

  const startDate = parseYMD(config.startDateStr);
  const targetExamDate = parseYMD(config.targetExamDateStr);

  const days: DayCalendarSchedule[] = [];
  const milestones: SubjectMilestone[] = [];

  const subjectBounds: Record<
    string,
    { startDay?: number; finishDay?: number; startDate?: string; finishDate?: string; count: number }
  > = {};

  const todayStr = '2026-10-06'; // Base today per user requirement

  let currentDate = new Date(startDate);
  let dayCounter = 1;

  if (trackMode === 'interleaved') {
    // -------------------------------------------------------------
    // INTERLEAVED MODE: 3 Non-Overlapping Pedagogical Streams
    // Stream 1 (Math): Linear Algebra (20) -> Calculus (16) -> Prob & Stats (30) [66 lecs]
    // Stream 2 (CS & Systems): Data Structures Python (33) -> DBMS (15) [48 lecs]
    // Stream 3 (Applied AI & ML): Machine Learning (43) -> Artificial Intelligence (38) [81 lecs]
    // -------------------------------------------------------------
    const stream1: OptimizedLecture[] = [
      ...getAllSubjectLectures('linearAlgebra'),
      ...getAllSubjectLectures('calculusAndOptimization'),
      ...getAllSubjectLectures('probabilityAndStatistics'),
    ];
    const stream2: OptimizedLecture[] = [
      ...getAllSubjectLectures('dataStructuresPython'),
      ...getAllSubjectLectures('dbms'),
    ];
    const stream3: OptimizedLecture[] = [
      ...getAllSubjectLectures('machineLearning'),
      ...getAllSubjectLectures('artificialIntelligence'),
    ];

    let s1Cursor = 0;
    let s2Cursor = 0;
    let s3Cursor = 0;
    const totalAll = stream1.length + stream2.length + stream3.length; // 195

    while (s1Cursor < stream1.length || s2Cursor < stream2.length || s3Cursor < stream3.length) {
      const dayStr = formatLocalDateStr(currentDate);
      const dayLectures: OptimizedLecture[] = [];
      const dayMilestones: string[] = [];

      // Determine which stream to pull from for each slot of the day
      for (let slot = 0; slot < pace; slot++) {
        let picked: OptimizedLecture | null = null;

        // If pace >= 3: Slot 0 = Math (Stream 1), Slot 1 = CS/Systems (Stream 2), Slot 2 = AI/ML (Stream 3)
        // If pace == 2: Rotate across days so Math, CS, and AI/ML all progress smoothly
        // If pace == 1: Rotate day-by-day across all 3 streams
        const targetStreamIndex =
          pace === 2
            ? (dayCounter - 1 + slot) % 3
            : pace === 1
            ? (dayCounter - 1) % 3
            : slot % 3;

        if (targetStreamIndex === 0 && s1Cursor < stream1.length) {
          picked = stream1[s1Cursor++];
        } else if (targetStreamIndex === 1 && s2Cursor < stream2.length) {
          picked = stream2[s2Cursor++];
        } else if (targetStreamIndex === 2 && s3Cursor < stream3.length) {
          picked = stream3[s3Cursor++];
        } else {
          // Fallback: pick from whichever stream still has remaining lectures
          if (s3Cursor < stream3.length) {
            picked = stream3[s3Cursor++];
          } else if (s1Cursor < stream1.length) {
            picked = stream1[s1Cursor++];
          } else if (s2Cursor < stream2.length) {
            picked = stream2[s2Cursor++];
          }
        }

        if (picked) {
          dayLectures.push(picked);

          // Track subject start
          if (!subjectBounds[picked.subjectKey]) {
            subjectBounds[picked.subjectKey] = {
              startDay: dayCounter,
              startDate: dayStr,
              count: 0,
            };
          }
          subjectBounds[picked.subjectKey].count++;

          // Check if this subject is now finished
          const subTotal = (lecturePlannersData as any).subjects[picked.subjectKey]?.totalLectures || 0;
          if (subjectBounds[picked.subjectKey].count === subTotal && !subjectBounds[picked.subjectKey].finishDay) {
            subjectBounds[picked.subjectKey].finishDay = dayCounter;
            subjectBounds[picked.subjectKey].finishDate = dayStr;
            dayMilestones.push(`🏁 Completed all ${subTotal} lectures of ${picked.subjectName}!`);
          }
        }
      }

      const totalDoneSoFar = s1Cursor + s2Cursor + s3Cursor;
      if (totalDoneSoFar === totalAll) {
        dayMilestones.push('🚀 ALL 195 PRE-RECORDED LECTURES COMPLETED! FULL MOCK RUNWAY UNLOCKED!');
      }

      days.push({
        dateStr: dayStr,
        dateObj: new Date(currentDate),
        dayNumber: dayCounter,
        dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        monthName: currentDate.toLocaleDateString('en-US', { month: 'long' }),
        dayOfMonth: currentDate.getDate(),
        isToday: dayStr === todayStr,
        phase: 'lectures',
        lectures: dayLectures,
        totalStudyHours: dayLectures.length * LECTURE_DURATION_HOURS,
        milestones: dayMilestones,
      });

      currentDate.setDate(currentDate.getDate() + 1);
      dayCounter++;
    }
  } else {
    // -------------------------------------------------------------
    // SEQUENTIAL MODE: Complete one subject before next
    // -------------------------------------------------------------
    const allLectures = getAllOrderedLectures();
    let lectureCursor = 0;
    const totalLectures = allLectures.length;

    while (lectureCursor < totalLectures) {
      const dayStr = formatLocalDateStr(currentDate);
      const dayLectures: OptimizedLecture[] = [];
      const dayMilestones: string[] = [];

      for (let i = 0; i < pace && lectureCursor < totalLectures; i++) {
        const lec = allLectures[lectureCursor];
        dayLectures.push(lec);

        if (!subjectBounds[lec.subjectKey]) {
          subjectBounds[lec.subjectKey] = {
            startDay: dayCounter,
            startDate: dayStr,
            count: 0,
          };
        }
        subjectBounds[lec.subjectKey].count++;

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
        dayMilestones.push('🚀 ALL 195 PRE-RECORDED LECTURES COMPLETED! FULL MOCK RUNWAY UNLOCKED!');
      }

      days.push({
        dateStr: dayStr,
        dateObj: new Date(currentDate),
        dayNumber: dayCounter,
        dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        monthName: currentDate.toLocaleDateString('en-US', { month: 'long' }),
        dayOfMonth: currentDate.getDate(),
        isToday: dayStr === todayStr,
        phase: 'lectures',
        lectures: dayLectures,
        totalStudyHours: dayLectures.length * LECTURE_DURATION_HOURS,
        milestones: dayMilestones,
      });

      currentDate.setDate(currentDate.getDate() + 1);
      dayCounter++;
    }
  }

  const lectureCompletionDateStr = days[days.length - 1].dateStr;

  // Build subject milestones
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

  // -------------------------------------------------------------
  // MOCK TEST RUNWAY: From day after lectures until Feb 6, 2027
  // -------------------------------------------------------------
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
    const dayStr = formatLocalDateStr(currentDate);
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
      totalStudyHours: isExamDay ? 3.5 : activityTemplate.hours,
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
    totalLectures: 195,
    lecturesPerDay: pace,
    lectureCompletionDateStr,
    mockDaysCount,
    totalDays: days.length,
    trackMode,
  };
}
