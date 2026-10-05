import React from 'react';

export type QuestionType = 'MCQ' | 'MSQ' | 'NAT';
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard' | 'GATE PYQ';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  marks: 1 | 2;
  difficulty: QuestionDifficulty;
  gateReference?: string; // e.g. "GATE DA 2024", "IIT Madras Model Q"
  prompt: string;
  subPrompt?: string;
  options?: QuestionOption[]; // For MCQ and MSQ
  correctOptionIds?: string[]; // IDs of correct options
  correctNumericValue?: number; // For NAT
  numericTolerance?: number; // e.g. 0.02
  explanation: string;
  examTrapNotice?: string;
}

export interface TopicFormulaItem {
  id: string;
  title: string;
  latexOrText: string;
  description: string;
  keyTrap?: string;
}

export type AppThemeMode = 'cream-black' | 'all-black' | 'cream-white';

export interface TopicModule {
  subtopicId: string;
  title: string;
  sectionId: string;
  summary: string;
  keyTakeaways: string[];
  gateImportance: 'High' | 'Very High' | 'Critical (Direct Marks)';
  simulation?: {
    title: string;
    tabLabel: string;
    badge?: string;
    component: React.ComponentType<{ themeMode: AppThemeMode }>;
    description?: string;
  };
  formulas?: {
    title: string;
    tabLabel: string;
    component?: React.ComponentType<{ themeMode: AppThemeMode }>;
    items?: TopicFormulaItem[];
  };
  quiz?: {
    title: string;
    tabLabel: string;
    questions: QuizQuestion[];
    passingScore?: number;
  };
}

export type TopicWorkspaceTab = 'overview' | 'simulation' | 'formulas' | 'quiz' | 'notes';
