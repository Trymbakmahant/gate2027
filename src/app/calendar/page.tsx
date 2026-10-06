'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  generateOptimizedCalendar,
  getAllOrderedLectures,
  SUBJECT_METADATA,
  DayCalendarSchedule,
  OptimizedLecture,
  SubjectMilestone,
} from '@/data/calendarOptimizer';

export type ThemeMode = 'cream-black' | 'all-black' | 'cream-white';

export default function FastTrackCalendarPage() {
  // Theme state
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('cream-black');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gate2027_theme') as ThemeMode | null;
      if (saved && (saved === 'cream-black' || saved === 'all-black' || saved === 'cream-white')) {
        setCurrentTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        document.documentElement.setAttribute('data-theme', 'cream-black');
      }
    } catch (e) {}
  }, []);

  const handleThemeChange = (theme: ThemeMode) => {
    setCurrentTheme(theme);
    try {
      localStorage.setItem('gate2027_theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
  };

  // Pacing & Strategy configuration
  const [lecturesPerDay, setLecturesPerDay] = useState<number>(3); // Default 3 lecs/day (~7.5 hrs) or 2 lecs/day (~5.0 hrs)
  const [trackMode, setTrackMode] = useState<'interleaved' | 'sequential'>('interleaved'); // Default: Curious Mind Interleaved
  const [activeView, setActiveView] = useState<'month' | 'agenda' | 'roadmap'>('month');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMonthIndex, setActiveMonthIndex] = useState<number>(0); // 0=Oct 2026, 1=Nov, 2=Dec, 3=Jan 2027, 4=Feb 2027

  // Progress state: Set of completed lecture IDs
  const [completedLectureIds, setCompletedLectureIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('gate2027_calendar_progress');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return new Set(parsed);
        }
      } catch (e) {}
    }
    return new Set<string>();
  });

  // Save progress changes
  useEffect(() => {
    try {
      localStorage.setItem(
        'gate2027_calendar_progress',
        JSON.stringify(Array.from(completedLectureIds))
      );
    } catch (e) {}
  }, [completedLectureIds]);

  // Selected Day for Detail Drawer / Modal
  const [selectedDayModal, setSelectedDayModal] = useState<DayCalendarSchedule | null>(null);

  // Compute optimized schedule based on pace & pedagogical track mode
  const calendarData = useMemo(() => {
    return generateOptimizedCalendar({
      lecturesPerDay,
      startDateStr: '2026-10-06',
      targetExamDateStr: '2027-02-06',
      trackMode,
    });
  }, [lecturesPerDay, trackMode]);

  const allLectures = useMemo(() => getAllOrderedLectures(), []);
  const totalLecturesCount = allLectures.length; // 195
  const completedCount = completedLectureIds.size;
  const progressPercent = Math.round((completedCount / totalLecturesCount) * 100);

  // Available months in range
  const months = useMemo(() => {
    return [
      { key: '2026-10', name: 'October 2026', year: 2026, month: 9 }, // 0-indexed month
      { key: '2026-11', name: 'November 2026', year: 2026, month: 10 },
      { key: '2026-12', name: 'December 2026', year: 2026, month: 11 },
      { key: '2027-01', name: 'January 2027', year: 2027, month: 0 },
      { key: '2027-02', name: 'February 2027', year: 2027, month: 1 },
    ];
  }, []);

  const currentMonth = months[activeMonthIndex] || months[0];

  // Days in selected month for grid view
  const monthDays = useMemo(() => {
    const y = currentMonth.year;
    const m = currentMonth.month;

    // First day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
    const firstDayObj = new Date(y, m, 1);
    // Convert so Monday is 0, Sunday is 6
    const firstDayWeekday = (firstDayObj.getDay() + 6) % 7;
    const totalDaysInMonth = new Date(y, m + 1, 0).getDate();

    const cells: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      scheduleItem?: DayCalendarSchedule;
    }> = [];

    // Prepend padding for previous month days
    for (let i = 0; i < firstDayWeekday; i++) {
      cells.push({
        dateStr: `prev-${i}`,
        dayNumber: 0,
        isCurrentMonth: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const padM = String(m + 1).padStart(2, '0');
      const padD = String(d).padStart(2, '0');
      const dateStr = `${y}-${padM}-${padD}`;
      const scheduleItem = calendarData.days.find((day) => day.dateStr === dateStr);

      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        scheduleItem,
      });
    }

    return cells;
  }, [currentMonth, calendarData]);

  // Filtered agenda days
  const filteredAgendaDays = useMemo(() => {
    return calendarData.days.filter((day) => {
      // Subject filter
      if (selectedSubjectFilter !== 'all') {
        if (selectedSubjectFilter === 'mock-phase') {
          if (day.phase !== 'mock-phase') return false;
        } else {
          const hasSubject = day.lectures.some((l) => l.subjectKey === selectedSubjectFilter);
          if (!hasSubject) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchDate = day.dateStr.includes(q) || day.dayOfWeek.toLowerCase().includes(q);
        const matchLecture = day.lectures.some(
          (l) =>
            l.chapter.toLowerCase().includes(q) ||
            l.subjectName.toLowerCase().includes(q) ||
            (l.topic && l.topic.toLowerCase().includes(q))
        );
        const matchMock = day.mockActivity && (
          day.mockActivity.title.toLowerCase().includes(q) ||
          day.mockActivity.description.toLowerCase().includes(q)
        );
        const matchMilestone = day.milestones.some((m) => m.toLowerCase().includes(q));
        if (!matchDate && !matchLecture && !matchMock && !matchMilestone) return false;
      }

      return true;
    });
  }, [calendarData, selectedSubjectFilter, searchQuery]);

  // Toggle single lecture completion
  const handleToggleLecture = (lectureId: string) => {
    setCompletedLectureIds((prev) => {
      const next = new Set(prev);
      if (next.has(lectureId)) {
        next.delete(lectureId);
      } else {
        next.add(lectureId);
        // Small victory confetti
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      }
      return next;
    });
  };

  // Mark all lectures on a given day as complete
  const handleMarkDayComplete = (day: DayCalendarSchedule) => {
    if (day.lectures.length === 0) return;
    setCompletedLectureIds((prev) => {
      const next = new Set(prev);
      day.lectures.forEach((l) => next.add(l.id));
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      return next;
    });
  };

  // Reset progress confirmation
  const handleResetProgress = () => {
    if (window.confirm('Reset all checked lecture progress back to 0?')) {
      setCompletedLectureIds(new Set());
    }
  };

  // Format date helper without UTC timezone shift
  const formatDateDisplay = (dateStr: string, includeYear: boolean = false) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(includeYear ? { year: 'numeric' } : {}),
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="calendar-page-shell">
      {/* Top Header */}
      <header className="calendar-top-header">
        <div className="cal-header-left">
          <Link href="/" className="cal-back-link" title="Return to Schedule Master Tracker">
            <span>← Master Tracker</span>
          </Link>
          <Link href="/docs" className="cal-back-link" title="View Syllabus Docs & Modules">
            <span>📚 Syllabus Docs</span>
          </Link>
          <div className="cal-title-block">
            <div className="cal-badge-pill">
              <span className="cal-live-dot"></span>
              <span>FAST-TRACK LECTURE OPTIMIZER</span>
            </div>
            <h1 className="cal-main-title">GATE DA 2027 Study Calendar</h1>
            <p className="cal-subtitle">
              Pre-recorded binge acceleration starting <strong>Today (Oct 6, 2026)</strong>.
              Finish all 195 lectures ASAP to unlock maximum Mock Test & Revision runway!
            </p>
          </div>
        </div>

        <div className="cal-header-right">
          {/* Theme switcher */}
          <div className="theme-switcher" role="group" aria-label="Theme Switcher">
            <button
              type="button"
              className={`theme-btn ${currentTheme === 'cream-black' ? 'active' : ''}`}
              onClick={() => handleThemeChange('cream-black')}
              title="Cream & Black Border"
            >
              <span className="theme-swatch swatch-cream-black"></span>
            </button>
            <button
              type="button"
              className={`theme-btn ${currentTheme === 'all-black' ? 'active' : ''}`}
              onClick={() => handleThemeChange('all-black')}
              title="All Black (Obsidian)"
            >
              <span className="theme-swatch swatch-all-black"></span>
            </button>
            <button
              type="button"
              className={`theme-btn ${currentTheme === 'cream-white' ? 'active' : ''}`}
              onClick={() => handleThemeChange('cream-white')}
              title="Cream & White Border"
            >
              <span className="theme-swatch swatch-cream-white"></span>
            </button>
          </div>
        </div>
      </header>

      {/* STRATEGIC CONTROL DECK: PACING & KPI CARDS */}
      <section className="cal-control-deck">
        <div className="cal-pacing-controls">
          <div className="cal-control-header">
            <div>
              <span className="cal-control-tag">CHOOSE YOUR DAILY SPRINT PACE</span>
              <h2 className="cal-control-title">How fast do you want to finish all 195 lectures?</h2>
            </div>
            <div className="cal-progress-badge">
              <span className="cal-prog-text">
                {completedCount} / {totalLecturesCount} Completed ({progressPercent}%)
              </span>
              <div className="cal-prog-track">
                <div
                  className="cal-prog-bar"
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Strategy Mode Toggle (Curious Mind vs Single Subject) */}
          <div className="cal-strategy-card">
            <div className="strategy-card-header">
              <span className="cal-control-tag">COGNITIVE STRATEGY (CURIOSITY & RETENTION)</span>
              <h3 className="strategy-heading">Study 2–3 Non-Overlapping Subjects Daily or 1 Single Subject?</h3>
            </div>
            <div className="strategy-toggle-grid">
              <button
                type="button"
                className={`strategy-toggle-card ${trackMode === 'interleaved' ? 'active' : ''}`}
                onClick={() => setTrackMode('interleaved')}
              >
                <div className="strategy-badge rec">🧠 CURIOUS MIND MODE (RECOMMENDED)</div>
                <div className="strategy-toggle-title">🔀 2–3 Non-Overlapping Streams Daily</div>
                <p className="strategy-toggle-desc">
                  Watch <strong>Math</strong> in the morning, <strong>CS / Python</strong> in the afternoon, and <strong>AI / ML</strong> in the evening. Eliminates mental fatigue, resets attention span, and prevents knowledge interference!
                </p>
                <div className="strategy-streams-preview">
                  <span className="stream-pill math">📐 Stream 1: Math (Linear Alg → Calc → Prob & Stats)</span>
                  <span className="stream-pill cs">💻 Stream 2: Systems (Python DS → DBMS)</span>
                  <span className="stream-pill aiml">🤖 Stream 3: AI & ML (Machine Learning → AI)</span>
                </div>
              </button>

              <button
                type="button"
                className={`strategy-toggle-card ${trackMode === 'sequential' ? 'active' : ''}`}
                onClick={() => setTrackMode('sequential')}
              >
                <div className="strategy-badge mono">🎯 SINGLE-SUBJECT FOCUS</div>
                <div className="strategy-toggle-title">1 Subject at a Time (Sequential)</div>
                <p className="strategy-toggle-desc">
                  Watch lectures from only 1 single subject until all its lectures are finished before moving to the next subject in dependency order.
                </p>
                <div className="strategy-streams-preview">
                  <span className="stream-pill seq">Linear Alg (20) → Calc (16) → Stats (30) → DS (33) → DBMS (15) → ML (43) → AI (38)</span>
                </div>
              </button>
            </div>
          </div>

          <div className="pacing-cards-grid">
            {/* 4 Lectures / Day: Ultra Sprint */}
            <button
              type="button"
              className={`pace-card ${lecturesPerDay === 4 ? 'active' : ''}`}
              onClick={() => setLecturesPerDay(4)}
            >
              <div className="pace-badge ultra">⚡ ULTRA FULL-TIME SPRINT</div>
              <div className="pace-number">4 Lectures / Day</div>
              <div className="pace-time">⏱️ 10.0 Hours Daily (~2.5h each)</div>
              <div className="pace-finish">
                Finishes: <strong>Nov 23, 2026</strong> (49 Days)
              </div>
              <div className="pace-runway highlight-emerald">
                🎯 <strong>75 Full Days</strong> for Mock Tests!
              </div>
            </button>

            {/* 3 Lectures / Day: Recommended Fast Track */}
            <button
              type="button"
              className={`pace-card ${lecturesPerDay === 3 ? 'active' : ''}`}
              onClick={() => setLecturesPerDay(3)}
            >
              <div className="pace-badge rec">🚀 RECOMMENDED POWER PACE</div>
              <div className="pace-number">3 Lectures / Day</div>
              <div className="pace-time">⏱️ 7.5 Hours Daily (~2.5h each)</div>
              <div className="pace-finish">
                Finishes: <strong>Dec 09, 2026</strong> (65 Days)
              </div>
              <div className="pace-runway highlight-indigo">
                🎯 <strong>59 Full Days</strong> for Mock Tests!
              </div>
            </button>

            {/* 2 Lectures / Day: Steady Pace */}
            <button
              type="button"
              className={`pace-card ${lecturesPerDay === 2 ? 'active' : ''}`}
              onClick={() => setLecturesPerDay(2)}
            >
              <div className="pace-badge steady">🎯 BALANCED INTENSIVE</div>
              <div className="pace-number">2 Lectures / Day</div>
              <div className="pace-time">⏱️ 5.0 Hours Daily (~2.5h each)</div>
              <div className="pace-finish">
                Finishes: <strong>Jan 11, 2027</strong> (98 Days)
              </div>
              <div className="pace-runway highlight-amber">
                🎯 <strong>26 Days</strong> for Mock Tests
              </div>
            </button>

            {/* Custom Slider Pace */}
            <div className={`pace-card custom ${![2, 3, 4].includes(lecturesPerDay) ? 'active' : ''}`}>
              <div className="pace-badge custom">⚙️ CUSTOM PACE</div>
              <div className="pace-slider-label">
                <span>Pace:</span>
                <strong>{lecturesPerDay} lecs ({ (lecturesPerDay * 2.5).toFixed(1) }h / day)</strong>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={lecturesPerDay}
                onChange={(e) => setLecturesPerDay(parseInt(e.target.value, 10))}
                className="cal-pace-slider"
              />
              <div className="pace-finish">
                Finishes: <strong>{calendarData.lectureCompletionDateStr}</strong>
              </div>
              <div className="pace-runway">
                🎯 <strong>{calendarData.mockDaysCount} Days</strong> for Mocks
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Runway Summary Cards */}
        <div className="runway-stat-deck">
          <div className="runway-card">
            <span className="runway-card-label">TOTAL PRE-RECORDED LECTURES</span>
            <span className="runway-card-val">{totalLecturesCount}</span>
            <span className="runway-card-sub">7 Core Subjects in Dependency Order</span>
          </div>
          <div className="runway-card">
            <span className="runway-card-label">LECTURE COMPLETION TARGET</span>
            <span className="runway-card-val highlight-target">
              {formatDateDisplay(calendarData.lectureCompletionDateStr)}
            </span>
            <span className="runway-card-sub">All theoretical curriculum finished</span>
          </div>
          <div className="runway-card">
            <span className="runway-card-label">MOCK TEST & REVISION RUNWAY</span>
            <span className="runway-card-val highlight-runway">
              {calendarData.mockDaysCount} Days
            </span>
            <span className="runway-card-sub">Pure FLTs, PYQs & Mistake Book Analysis</span>
          </div>
          <div className="runway-card">
            <span className="runway-card-label">OFFICIAL EXAM DAY</span>
            <span className="runway-card-val">Feb 6, 2027</span>
            <span className="runway-card-sub">GATE Data Science & AI Window</span>
          </div>
        </div>
      </section>

      {/* VIEW SWITCHER & FILTER BAR */}
      <section className="cal-view-toolbar">
        <div className="cal-view-tabs">
          <button
            type="button"
            className={`view-tab-btn ${activeView === 'month' ? 'active' : ''}`}
            onClick={() => setActiveView('month')}
          >
            <span>📅 Monthly Calendar</span>
          </button>
          <button
            type="button"
            className={`view-tab-btn ${activeView === 'agenda' ? 'active' : ''}`}
            onClick={() => setActiveView('agenda')}
          >
            <span>📋 Daily Agenda & Checklist</span>
            <span className="tab-counter">{filteredAgendaDays.length}</span>
          </button>
          <button
            type="button"
            className={`view-tab-btn ${activeView === 'roadmap' ? 'active' : ''}`}
            onClick={() => setActiveView('roadmap')}
          >
            <span>🗺️ Subject Roadmap</span>
          </button>
        </div>

        {/* Subject & Search Filter */}
        <div className="cal-filters-row">
          <div className="cal-search-box">
            <span className="cal-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search chapter, topic, date, DPP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cal-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="cal-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="cal-subject-select"
          >
            <option value="all">All Subjects & Phases</option>
            <option value="linearAlgebra">Linear Algebra (20)</option>
            <option value="calculusAndOptimization">Calculus & Optimization (16)</option>
            <option value="probabilityAndStatistics">Probability & Statistics (30)</option>
            <option value="dataStructuresPython">Data Structures (Python) (33)</option>
            <option value="dbms">DBMS (15)</option>
            <option value="machineLearning">Machine Learning (43)</option>
            <option value="artificialIntelligence">Artificial Intelligence (38)</option>
            <option value="mock-phase">🎯 Full Mock Test Phase</option>
          </select>

          {completedCount > 0 && (
            <button
              type="button"
              className="cal-reset-btn"
              onClick={handleResetProgress}
              title="Reset all completed lecture checkboxes"
            >
              Reset ({completedCount})
            </button>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* VIEW 1: MONTHLY CALENDAR GRID                                  */}
      {/* ============================================================== */}
      {activeView === 'month' && (
        <section className="cal-month-section">
          {/* Month Pagination Header */}
          <div className="month-nav-header">
            <div className="month-pagination-buttons">
              <button
                type="button"
                className="month-nav-arrow"
                disabled={activeMonthIndex === 0}
                onClick={() => setActiveMonthIndex((prev) => Math.max(0, prev - 1))}
              >
                ‹ Prev Month
              </button>
              <div className="current-month-display">
                <h2>{currentMonth.name}</h2>
                <span className="month-phase-tag">
                  {currentMonth.year === 2026 && currentMonth.month < 11
                    ? '📚 Fast-Track Lecture Sprints'
                    : '🎯 Full Mocks & Revision Phase'}
                </span>
              </div>
              <button
                type="button"
                className="month-nav-arrow"
                disabled={activeMonthIndex === months.length - 1}
                onClick={() => setActiveMonthIndex((prev) => Math.min(months.length - 1, prev + 1))}
              >
                Next Month ›
              </button>
            </div>

            <div className="month-quick-pills">
              {months.map((m, idx) => (
                <button
                  key={m.key}
                  type="button"
                  className={`quick-month-btn ${idx === activeMonthIndex ? 'active' : ''}`}
                  onClick={() => setActiveMonthIndex(idx)}
                >
                  {m.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Weekday Names Header */}
          <div className="cal-weekdays-grid">
            <div className="weekday-cell">Mon</div>
            <div className="weekday-cell">Tue</div>
            <div className="weekday-cell">Wed</div>
            <div className="weekday-cell">Thu</div>
            <div className="weekday-cell">Fri</div>
            <div className="weekday-cell">Sat</div>
            <div className="weekday-cell sunday">Sun</div>
          </div>

          {/* Month Days Grid */}
          <div className="cal-month-grid">
            {monthDays.map((cell, idx) => {
              if (!cell.isCurrentMonth || !cell.scheduleItem) {
                return <div key={`empty-${idx}`} className="cal-day-cell empty"></div>;
              }

              const day = cell.scheduleItem;
              const isToday = day.isToday;
              const isMockPhase = day.phase === 'mock-phase';
              const lectures = day.lectures;
              const completedInDay = lectures.filter((l) => completedLectureIds.has(l.id)).length;
              const isAllDayCompleted = lectures.length > 0 && completedInDay === lectures.length;

              return (
                <div
                  key={cell.dateStr}
                  className={`cal-day-cell ${isToday ? 'is-today' : ''} ${
                    isMockPhase ? 'is-mock' : ''
                  } ${isAllDayCompleted ? 'is-completed' : ''}`}
                  onClick={() => setSelectedDayModal(day)}
                  tabIndex={0}
                  role="button"
                >
                  <div className="cal-cell-header">
                    <span className="cal-cell-date">{cell.dayNumber}</span>
                    {isToday && <span className="today-chip">TODAY</span>}
                    {isAllDayCompleted && <span className="check-chip">✓</span>}
                    {isMockPhase && (
                      <span className="mock-tag-mini">
                        {day.dateStr === '2027-02-06' ? '🏆 EXAM' : 'MOCK'}
                      </span>
                    )}
                  </div>

                  {/* Cell Body */}
                  <div className="cal-cell-body">
                    {/* Lecture Phase */}
                    {!isMockPhase && (
                      <>
                        <div className="cell-lecture-count">
                          <strong>{lectures.length}</strong> Lectures
                          {completedInDay > 0 && (
                            <span className="completed-counter">
                              ({completedInDay}/{lectures.length})
                            </span>
                          )}
                        </div>

                        {/* Subject Chips */}
                        <div className="cell-subject-badges">
                          {lectures.map((lec) => (
                            <div
                              key={lec.id}
                              className={`mini-lec-pill ${
                                completedLectureIds.has(lec.id) ? 'done' : ''
                              }`}
                              style={{
                                backgroundColor: lec.badgeBg,
                                color: lec.badgeColor,
                                border: `1px solid ${lec.badgeColor}40`,
                              }}
                              title={`${lec.subjectName} — Lec ${lec.lectureNumber}: ${lec.chapter}`}
                            >
                              <span className="pill-sub">
                                {lec.subjectName.split(' ')[0]} L{lec.lectureNumber}
                              </span>
                              {lec.dpp && <span className="pill-dpp-dot" title="DPP Available">•</span>}
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Mock Phase */}
                    {isMockPhase && day.mockActivity && (
                      <div className="cell-mock-activity">
                        <span className="mock-act-title">{day.mockActivity.title}</span>
                        <span className="mock-act-time">{day.mockActivity.durationHours} hrs</span>
                      </div>
                    )}

                    {/* Milestone indicator */}
                    {day.milestones.length > 0 && (
                      <div className="cell-milestone-flag" title={day.milestones.join('\n')}>
                        🏁 {day.milestones[0].slice(0, 24)}...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: DAILY AGENDA & INTERACTIVE CHECKLIST                   */}
      {/* ============================================================== */}
      {activeView === 'agenda' && (
        <section className="cal-agenda-section">
          <div className="agenda-list">
            {filteredAgendaDays.length === 0 ? (
              <div className="agenda-empty-state">
                <span className="empty-icon">🔍</span>
                <h3>No schedule entries match your filter</h3>
                <p>Try clearing your search query or subject dropdown.</p>
              </div>
            ) : (
              filteredAgendaDays.map((day) => {
                const isMock = day.phase === 'mock-phase';
                const lectures = day.lectures;
                const completedInDay = lectures.filter((l) => completedLectureIds.has(l.id)).length;
                const isAllDayCompleted =
                  lectures.length > 0 && completedInDay === lectures.length;

                return (
                  <article
                    key={day.dateStr}
                    className={`agenda-day-card ${day.isToday ? 'is-today' : ''} ${
                      isMock ? 'is-mock' : ''
                    }`}
                  >
                    <div className="agenda-day-header">
                      <div className="agenda-date-group">
                        <span className="agenda-day-num">DAY {day.dayNumber}</span>
                        <h3 className="agenda-date-title">
                          {day.dayOfWeek}, {formatDateDisplay(day.dateStr, true)}
                        </h3>
                        {day.isToday && <span className="today-badge-banner">TODAY (OCT 6)</span>}
                      </div>

                      <div className="agenda-header-actions">
                        {!isMock && lectures.length > 0 && (
                          <>
                            <span className="agenda-completion-stat">
                              {completedInDay} of {lectures.length} watched
                            </span>
                            {!isAllDayCompleted && (
                              <button
                                type="button"
                                className="mark-day-btn"
                                onClick={() => handleMarkDayComplete(day)}
                              >
                                Mark All {lectures.length} Done
                              </button>
                            )}
                          </>
                        )}
                        {isMock && (
                          <span className="mock-phase-pill">
                            {day.dateStr === '2027-02-06' ? '🏆 EXAM DAY' : '🎯 MOCK RUNWAY'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Milestones Banner */}
                    {day.milestones.length > 0 && (
                      <div className="agenda-milestone-banner">
                        {day.milestones.map((m, mIdx) => (
                          <div key={mIdx} className="milestone-item">
                            {m}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Lecture Items Checklist */}
                    {!isMock && (
                      <div className="agenda-lectures-grid">
                        {lectures.map((lec) => {
                          const isDone = completedLectureIds.has(lec.id);
                          return (
                            <div
                              key={lec.id}
                              className={`agenda-lecture-row ${isDone ? 'completed' : ''}`}
                            >
                              <label className="lec-checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => handleToggleLecture(lec.id)}
                                  className="lec-check-input"
                                />
                                <span className="lec-custom-check"></span>
                              </label>

                              <div className="lec-info-block">
                                <div className="lec-badges-line">
                                  {lec.streamCategory === 'math' && (
                                    <span className="lec-stream-tag math">📐 Math</span>
                                  )}
                                  {lec.streamCategory === 'cs-systems' && (
                                    <span className="lec-stream-tag systems">💻 CS / Systems</span>
                                  )}
                                  {lec.streamCategory === 'ai-ml' && (
                                    <span className="lec-stream-tag aiml">🤖 AI & ML</span>
                                  )}
                                  <span className="lec-duration-tag">⏱️ 2.5 hrs</span>
                                  <span
                                    className="lec-subject-badge"
                                    style={{
                                      backgroundColor: lec.badgeBg,
                                      color: lec.badgeColor,
                                      border: `1px solid ${lec.badgeColor}40`,
                                    }}
                                  >
                                    {lec.subjectName} • Lec #{lec.lectureNumber}
                                  </span>
                                  {lec.timing && (
                                    <span className="lec-timing-badge">🕒 {lec.timing}</span>
                                  )}
                                  {lec.dpp && (
                                    <span className="lec-dpp-badge">📝 {lec.dpp}</span>
                                  )}
                                  {lec.test && (
                                    <span className="lec-test-badge">🏆 {lec.test}</span>
                                  )}
                                </div>

                                <h4 className="lec-chapter-title">{lec.chapter}</h4>
                                {lec.topic && lec.topic !== lec.chapter && (
                                  <p className="lec-topic-sub">{lec.topic}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Mock Activity Block */}
                    {isMock && day.mockActivity && (
                      <div className="agenda-mock-box">
                        <div className="mock-box-top">
                          <span className="mock-box-type">{day.mockActivity.type.toUpperCase()}</span>
                          <span className="mock-box-hours">⏱️ {day.mockActivity.durationHours} Hours Timed Session</span>
                        </div>
                        <h4 className="mock-box-title">{day.mockActivity.title}</h4>
                        <p className="mock-box-desc">{day.mockActivity.description}</p>
                        <div className="mock-box-footer">
                          <Link href="/#tab-timer" className="start-timer-link">
                            ▶ Launch Focus Timer ({day.mockActivity.durationHours}h)
                          </Link>
                          <Link href="/#tab-mistakes" className="log-mistake-link">
                            📓 Log Mistake in Notebook
                          </Link>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: SUBJECT ROADMAP & MILESTONES (GANTT)                   */}
      {/* ============================================================== */}
      {activeView === 'roadmap' && (
        <section className="cal-roadmap-section">
          <div className="roadmap-header">
            <div>
              <span className="roadmap-tag">
                {trackMode === 'interleaved'
                  ? '🧠 CURIOUS MIND PARALLEL STREAMS'
                  : '🎯 ACCELERATION ROADMAP'}
              </span>
              <h2 className="roadmap-title">
                {trackMode === 'interleaved'
                  ? '3 Non-Overlapping Cognitive Streams in Parallel'
                  : 'Sequential Pedagogical Dependency Schedule'}
              </h2>
              <p className="roadmap-desc">
                Calculated based on your selected pace of{' '}
                <strong>
                  {lecturesPerDay} lectures ({(lecturesPerDay * 2.5).toFixed(1)}h video) per day
                </strong>
                .
              </p>
            </div>
          </div>

          {trackMode === 'interleaved' && (
            <div className="interleaved-roadmap-guide">
              <span className="cal-control-tag">WHY THESE 3 STREAMS DON&apos;T INTERFERE:</span>
              <p className="roadmap-desc">
                Each stream exercises a completely distinct cognitive pathway. Switching between them prevents mental fatigue, boosts retention, and keeps your curiosity peak high!
              </p>
              <div className="roadmap-streams-summary">
                <div className="stream-summary-box">
                  <span className="stream-summary-title" style={{ color: '#6d28d9' }}>
                    📐 Stream 1: Math Foundations (66 Lecs)
                  </span>
                  <p className="stream-summary-desc">
                    Linear Algebra (20) → Calculus &amp; Opt (16) → Probability &amp; Stats (30).
                    Rigorous deductive reasoning, matrix algebra, and vector spaces.
                  </p>
                </div>
                <div className="stream-summary-box">
                  <span className="stream-summary-title" style={{ color: '#15803d' }}>
                    💻 Stream 2: Algorithmic Systems (48 Lecs)
                  </span>
                  <p className="stream-summary-desc">
                    Python Data Structures (33) → DBMS (15).
                    Procedural programming, tree traversal, SQL schemas, and normalization.
                  </p>
                </div>
                <div className="stream-summary-box">
                  <span className="stream-summary-title" style={{ color: '#be185d' }}>
                    🤖 Stream 3: Core AI &amp; ML (81 Lecs)
                  </span>
                  <p className="stream-summary-desc">
                    Machine Learning (43) → Artificial Intelligence (38).
                    Empirical modeling, gradient descent, loss functions, and heuristic search.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="milestones-timeline-grid">
            {calendarData.milestones.map((m, idx) => {
              const meta = SUBJECT_METADATA[m.subjectKey];
              const isPast =
                new Date(m.finishDateStr + 'T23:59:59') < new Date('2026-10-06T00:00:00');

              return (
                <div key={m.subjectKey} className={`roadmap-card ${isPast ? 'done' : ''}`}>
                  <div className="roadmap-step-num">STAGE {idx + 1}</div>
                  <div className="roadmap-card-header">
                    <span
                      className="roadmap-sub-badge"
                      style={{
                        backgroundColor: m.badgeBg,
                        color: m.badgeColor,
                        border: `1px solid ${m.badgeColor}40`,
                      }}
                    >
                      {m.subjectName}
                    </span>
                    <span className="roadmap-count">{m.totalLectures} Lectures</span>
                  </div>

                  <p className="roadmap-subject-desc">{meta?.description}</p>

                  <div className="roadmap-dates-box">
                    <div className="date-col">
                      <span className="date-col-label">START DATE</span>
                      <strong>{formatDateDisplay(m.startDateStr)}</strong>
                      <span className="day-col-tag">Day {m.dayRangeStart}</span>
                    </div>
                    <div className="date-arrow">→</div>
                    <div className="date-col">
                      <span className="date-col-label">FINISH DATE</span>
                      <strong className="finish-highlight">
                        {formatDateDisplay(m.finishDateStr)}
                      </strong>
                      <span className="day-col-tag">Day {m.dayRangeEnd}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Final Grand Mock Runway Stage */}
            <div className="roadmap-card mock-stage">
              <div className="roadmap-step-num highlight-mock">FINAL STAGE</div>
              <div className="roadmap-card-header">
                <span className="roadmap-sub-badge mock-badge">
                  🎯 Full Mock Tests & PYQ Mastery
                </span>
                <span className="roadmap-count">{calendarData.mockDaysCount} Days Runway</span>
              </div>
              <p className="roadmap-subject-desc">
                12 Full-Length 3-hr GATE Mocks, Multi-Subject Sectionals, Virtual Calculator Drills, and
                Mistake Notebook forensic reviews.
              </p>
              <div className="roadmap-dates-box">
                <div className="date-col">
                  <span className="date-col-label">START DATE</span>
                  <strong>{formatDateDisplay(calendarData.lectureCompletionDateStr)}</strong>
                </div>
                <div className="date-arrow">→</div>
                <div className="date-col">
                  <span className="date-col-label">GATE EXAM</span>
                  <strong className="finish-highlight">Feb 6, 2027</strong>
                  <span className="day-col-tag">Final D-Day</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* DAY DETAIL DRAWER / MODAL */}
      {selectedDayModal && (
        <div className="cal-modal-overlay" onClick={() => setSelectedDayModal(null)}>
          <div className="cal-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cal-modal-header">
              <div>
                <span className="cal-modal-daytag">DAY {selectedDayModal.dayNumber} OF 124</span>
                <h3 className="cal-modal-title">
                  {selectedDayModal.dayOfWeek}, {formatDateDisplay(selectedDayModal.dateStr, true)}
                </h3>
              </div>
              <button
                type="button"
                className="cal-modal-close"
                onClick={() => setSelectedDayModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="cal-modal-body">
              {/* If Lecture Day */}
              {selectedDayModal.phase === 'lectures' && (
                <>
                  <div className="modal-section-intro">
                    <span>Scheduled Pre-Recorded Lectures:</span>
                    <strong>{selectedDayModal.lectures.length} Lectures</strong>
                  </div>

                  <div className="modal-lectures-list">
                    {selectedDayModal.lectures.map((lec) => {
                      const isDone = completedLectureIds.has(lec.id);
                      return (
                        <div
                          key={lec.id}
                          className={`modal-lecture-item ${isDone ? 'done' : ''}`}
                        >
                          <label className="modal-check-label">
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => handleToggleLecture(lec.id)}
                            />
                            <span className="modal-check-custom"></span>
                          </label>
                          <div className="modal-lec-detail">
                            <div className="modal-lec-badges">
                              {lec.streamCategory === 'math' && (
                                <span className="lec-stream-tag math">📐 Math</span>
                              )}
                              {lec.streamCategory === 'cs-systems' && (
                                <span className="lec-stream-tag systems">💻 CS / Systems</span>
                              )}
                              {lec.streamCategory === 'ai-ml' && (
                                <span className="lec-stream-tag aiml">🤖 AI & ML</span>
                              )}
                              <span className="lec-duration-tag">⏱️ 2.5 hrs</span>
                              <span
                                className="modal-sub-tag"
                                style={{
                                  backgroundColor: lec.badgeBg,
                                  color: lec.badgeColor,
                                  border: `1px solid ${lec.badgeColor}40`,
                                }}
                              >
                                {lec.subjectName} • Lec #{lec.lectureNumber}
                              </span>
                              {lec.timing && <span className="modal-time-tag">🕒 {lec.timing}</span>}
                              {lec.dpp && <span className="modal-dpp-tag">📝 {lec.dpp}</span>}
                            </div>
                            <h4 className="modal-lec-name">{lec.chapter}</h4>
                            {lec.topic && <p className="modal-lec-subtopic">{lec.topic}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="modal-actions-bar">
                    <button
                      type="button"
                      className="modal-mark-all-btn"
                      onClick={() => handleMarkDayComplete(selectedDayModal)}
                    >
                      ✓ Mark All Lectures Done Today
                    </button>
                  </div>
                </>
              )}

              {/* If Mock Day */}
              {selectedDayModal.phase === 'mock-phase' && selectedDayModal.mockActivity && (
                <div className="modal-mock-detail">
                  <span className="mock-detail-type">
                    {selectedDayModal.mockActivity.type.toUpperCase()}
                  </span>
                  <h4 className="mock-detail-title">{selectedDayModal.mockActivity.title}</h4>
                  <p className="mock-detail-desc">{selectedDayModal.mockActivity.description}</p>
                  <div className="mock-detail-stats">
                    <span>⏱️ Duration: {selectedDayModal.mockActivity.durationHours} Hours</span>
                    <span>🎯 Goal: Deep Error Extraction</span>
                  </div>
                  <div className="modal-mock-links">
                    <Link href="/#tab-timer" className="modal-btn-timer">
                      Start 7-Hour Daily Tracker
                    </Link>
                    <Link href="/#tab-mistakes" className="modal-btn-mistakes">
                      Open Mistake Notebook
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
