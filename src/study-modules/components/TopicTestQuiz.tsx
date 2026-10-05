'use client';

import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';

interface TopicTestQuizProps {
  title: string;
  subtopicId: string;
  questions: QuizQuestion[];
  themeMode?: string;
}

interface UserAnswerState {
  selectedOptionIds: string[]; // For MCQ / MSQ
  numericInput: string;        // For NAT
  isSubmitted: boolean;
  isCorrect: boolean;
  marksAwarded: number;
}

export default function TopicTestQuiz({
  title,
  subtopicId,
  questions,
  themeMode
}: TopicTestQuizProps) {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswerState>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  // Reset or load saved answers per subtopic
  const storageKey = `gate2027_quiz_${subtopicId}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setAnswers(JSON.parse(saved));
      } else {
        setAnswers({});
      }
    } catch (e) {
      setAnswers({});
    }
    setCurrentIdx(0);
    setShowExplanation({});
  }, [subtopicId, storageKey]);

  const saveAnswersToStorage = (newAnswers: Record<string, UserAnswerState>) => {
    setAnswers(newAnswers);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newAnswers));
    } catch (e) {}
  };

  const currentQ = questions[currentIdx];
  const currentAnswer = answers[currentQ?.id] || {
    selectedOptionIds: [],
    numericInput: '',
    isSubmitted: false,
    isCorrect: false,
    marksAwarded: 0
  };

  // Option selection handler for MCQ / MSQ
  const handleToggleOption = (optId: string) => {
    if (currentAnswer.isSubmitted) return; // Locked once submitted

    let newSelection: string[];
    if (currentQ.type === 'MCQ') {
      newSelection = [optId];
    } else {
      // MSQ
      if (currentAnswer.selectedOptionIds.includes(optId)) {
        newSelection = currentAnswer.selectedOptionIds.filter((id) => id !== optId);
      } else {
        newSelection = [...currentAnswer.selectedOptionIds, optId];
      }
    }

    const updated = {
      ...answers,
      [currentQ.id]: {
        ...currentAnswer,
        selectedOptionIds: newSelection
      }
    };
    saveAnswersToStorage(updated);
  };

  // Numeric input handler for NAT
  const handleNumericChange = (val: string) => {
    if (currentAnswer.isSubmitted) return;
    const updated = {
      ...answers,
      [currentQ.id]: {
        ...currentAnswer,
        numericInput: val
      }
    };
    saveAnswersToStorage(updated);
  };

  // Submit and verify answer
  const handleSubmitAnswer = () => {
    if (!currentQ) return;

    let isCorrect = false;
    let marksAwarded = 0;

    if (currentQ.type === 'MCQ' || currentQ.type === 'MSQ') {
      const correctIds = currentQ.correctOptionIds || [];
      const userIds = currentAnswer.selectedOptionIds;

      const isSameLength = correctIds.length === userIds.length;
      const allMatched = correctIds.every((id) => userIds.includes(id));

      isCorrect = isSameLength && allMatched;
      marksAwarded = isCorrect ? currentQ.marks : 0;
    } else if (currentQ.type === 'NAT') {
      const parsed = parseFloat(currentAnswer.numericInput);
      if (!isNaN(parsed) && currentQ.correctNumericValue !== undefined) {
        const tol = currentQ.numericTolerance ?? 0.05;
        const diff = Math.abs(parsed - currentQ.correctNumericValue);
        isCorrect = diff <= tol;
        marksAwarded = isCorrect ? currentQ.marks : 0;
      }
    }

    const updated = {
      ...answers,
      [currentQ.id]: {
        ...currentAnswer,
        isSubmitted: true,
        isCorrect,
        marksAwarded
      }
    };
    saveAnswersToStorage(updated);

    // Auto-reveal explanation upon submission
    setShowExplanation((prev) => ({ ...prev, [currentQ.id]: true }));
  };

  // Reset entire quiz
  const handleResetQuiz = () => {
    if (window.confirm('Reset all answers for this topic test?')) {
      setAnswers({});
      setShowExplanation({});
      setCurrentIdx(0);
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}
    }
  };

  // Score stats
  const totalQuestions = questions.length;
  const answeredCount = Object.values(answers).filter((a) => a.isSubmitted).length;
  const totalPossibleMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const totalEarnedMarks = Object.values(answers).reduce((sum, a) => sum + (a.isSubmitted ? a.marksAwarded : 0), 0);
  const correctCount = Object.values(answers).filter((a) => a.isSubmitted && a.isCorrect).length;

  if (!questions || questions.length === 0) {
    return (
      <div className="empty-quiz-card">
        <div className="empty-quiz-icon">📝</div>
        <h3>No questions registered yet for this topic</h3>
        <p>Practice questions for this syllabus area are currently being curated according to IIT Madras guidelines.</p>
      </div>
    );
  }

  return (
    <div className="topic-quiz-container">
      {/* Quiz Header & Live Scorecard */}
      <div className="quiz-header-card">
        <div className="quiz-header-info">
          <div className="quiz-badge-row">
            <span className="quiz-badge-live">GATE DA Exam Simulator</span>
            <span className="quiz-badge-total">{totalQuestions} High-Yield Questions</span>
          </div>
          <h3 className="quiz-title">{title}</h3>
        </div>

        <div className="quiz-scoreboard">
          <div className="score-stat-box">
            <span className="score-label">Score</span>
            <span className="score-value highlight">
              {totalEarnedMarks} / {totalPossibleMarks}
            </span>
          </div>
          <div className="score-stat-box">
            <span className="score-label">Accuracy</span>
            <span className="score-value">
              {answeredCount > 0 ? `${Math.round((correctCount / answeredCount) * 100)}%` : '--'}
            </span>
          </div>
          <div className="score-stat-box">
            <span className="score-label">Attempted</span>
            <span className="score-value">
              {answeredCount} / {totalQuestions}
            </span>
          </div>
          <button
            type="button"
            className="quiz-reset-btn"
            onClick={handleResetQuiz}
            title="Reset and re-attempt all questions"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Question Number Pills Navigator */}
      <div className="quiz-nav-pills">
        {questions.map((q, idx) => {
          const ans = answers[q.id];
          let pillClass = 'q-pill';
          if (idx === currentIdx) pillClass += ' active';
          if (ans?.isSubmitted) {
            pillClass += ans.isCorrect ? ' correct' : ' wrong';
          } else if (ans?.selectedOptionIds?.length > 0 || ans?.numericInput) {
            pillClass += ' draft';
          }

          return (
            <button
              key={q.id}
              type="button"
              className={pillClass}
              onClick={() => setCurrentIdx(idx)}
            >
              Q{idx + 1}
              {ans?.isSubmitted && (
                <span className="pill-dot">{ans.isCorrect ? '✓' : '✗'}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Question Display Card */}
      {currentQ && (
        <div className="question-active-card">
          <div className="question-meta-row">
            <span className="q-type-badge">{currentQ.type}</span>
            <span className="q-marks-badge">{currentQ.marks} Mark{currentQ.marks > 1 ? 's' : ''}</span>
            <span className={`q-diff-badge ${currentQ.difficulty.toLowerCase()}`}>
              {currentQ.difficulty}
            </span>
            {currentQ.gateReference && (
              <span className="q-ref-badge">{currentQ.gateReference}</span>
            )}
            <span className="q-counter-tag">
              Question {currentIdx + 1} of {totalQuestions}
            </span>
          </div>

          <div className="question-prompt-text">
            {currentQ.prompt.split('\n').map((line, lidx) => (
              <p key={lidx}>{line}</p>
            ))}
          </div>

          {currentQ.subPrompt && (
            <div className="question-subprompt-text">
              <em>{currentQ.subPrompt}</em>
            </div>
          )}

          {/* Options for MCQ / MSQ */}
          {(currentQ.type === 'MCQ' || currentQ.type === 'MSQ') && currentQ.options && (
            <div className="quiz-options-list">
              {currentQ.options.map((opt) => {
                const isSelected = currentAnswer.selectedOptionIds.includes(opt.id);
                const isSubmitted = currentAnswer.isSubmitted;
                const isCorrectOption = currentQ.correctOptionIds?.includes(opt.id);

                let optClass = 'quiz-opt-item';
                if (isSelected) optClass += ' selected';
                if (isSubmitted) {
                  if (isCorrectOption) {
                    optClass += ' reveals-correct';
                  } else if (isSelected && !isCorrectOption) {
                    optClass += ' reveals-wrong';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={optClass}
                    onClick={() => handleToggleOption(opt.id)}
                    disabled={isSubmitted}
                  >
                    <div className="opt-indicator">
                      {currentQ.type === 'MCQ' ? (
                        <span className={`radio-circle ${isSelected ? 'checked' : ''}`} />
                      ) : (
                        <span className={`check-box ${isSelected ? 'checked' : ''}`} />
                      )}
                    </div>
                    <div className="opt-text">{opt.text}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Numerical Input for NAT */}
          {currentQ.type === 'NAT' && (
            <div className="nat-input-block">
              <label htmlFor="nat-val-input" className="nat-label">
                Enter Numerical Value:
              </label>
              <div className="nat-row">
                <input
                  id="nat-val-input"
                  type="number"
                  step="any"
                  className="nat-input-field"
                  placeholder="e.g. 6.00 or 0.64"
                  value={currentAnswer.numericInput || ''}
                  onChange={(e) => handleNumericChange(e.target.value)}
                  disabled={currentAnswer.isSubmitted}
                />
                {!currentAnswer.isSubmitted && (
                  <button
                    type="button"
                    className="nat-submit-btn"
                    disabled={!currentAnswer.numericInput}
                    onClick={handleSubmitAnswer}
                  >
                    Submit Value
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Actions: Submit / Feedback Bar */}
          <div className="question-actions-row">
            {!currentAnswer.isSubmitted ? (
              <button
                type="button"
                className="q-submit-btn"
                disabled={
                  (currentQ.type !== 'NAT' && currentAnswer.selectedOptionIds.length === 0) ||
                  (currentQ.type === 'NAT' && !currentAnswer.numericInput)
                }
                onClick={handleSubmitAnswer}
              >
                Submit &amp; Check Answer
              </button>
            ) : (
              <div className="answer-result-banner">
                <span className={`result-tag ${currentAnswer.isCorrect ? 'correct' : 'wrong'}`}>
                  {currentAnswer.isCorrect
                    ? `✓ Correct! (+${currentQ.marks} Marks)`
                    : `✗ Incorrect (0 Marks)`}
                </span>
                <button
                  type="button"
                  className="toggle-explanation-btn"
                  onClick={() =>
                    setShowExplanation((prev) => ({
                      ...prev,
                      [currentQ.id]: !prev[currentQ.id]
                    }))
                  }
                >
                  {showExplanation[currentQ.id] ? 'Hide Explanation ▲' : 'Show Explanation ▼'}
                </button>
              </div>
            )}

            <div className="q-nav-buttons">
              <button
                type="button"
                className="q-step-btn"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              >
                ◀ Previous
              </button>
              <button
                type="button"
                className="q-step-btn primary"
                disabled={currentIdx === questions.length - 1}
                onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
              >
                Next ▶
              </button>
            </div>
          </div>

          {/* Detailed Explanation & Exam Trap Card */}
          {currentAnswer.isSubmitted && showExplanation[currentQ.id] && (
            <div className="explanation-drawer-card">
              <div className="exp-section-title">
                <span>💡 Step-by-Step Mathematical Explanation</span>
              </div>
              <div className="exp-text">
                {currentQ.explanation.split('\n').map((line, elidx) => (
                  <p key={elidx}>{line}</p>
                ))}
              </div>

              {currentQ.type === 'NAT' && currentQ.correctNumericValue !== undefined && (
                <div className="nat-key-box">
                  <strong>Expected Answer:</strong> {currentQ.correctNumericValue}
                  {currentQ.numericTolerance ? ` (Tolerance: ±${currentQ.numericTolerance})` : ''}
                </div>
              )}

              {currentQ.examTrapNotice && (
                <div className="exp-trap-alert">
                  <span className="trap-icon">⚠️</span>
                  <div className="trap-body">
                    <strong>GATE DA Trap Watch:</strong>
                    <p>{currentQ.examTrapNotice}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
