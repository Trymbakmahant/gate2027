'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { GATE_DA_SYLLABUS, SyllabusSection, SyllabusSubtopic } from '@/data/syllabusData';

export type ThemeMode = 'cream-black' | 'all-black' | 'cream-white';

export default function DocsPage() {
  // Theme State
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

  // State for selected section and subtopic
  const [selectedSectionId, setSelectedSectionId] = useState<string>('prob-stats');
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string>('counting-perm-comb');
  const [searchSubjectQuery, setSearchSubjectQuery] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Custom dropdown open/close state
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // User study scratchpad state (saved in localStorage per subtopic)
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);

  // Load saved notes from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gate2027_docs_user_notes');
      if (saved) {
        setUserNotes(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  // Save notes handler
  const handleNoteChange = (text: string) => {
    const updated = { ...userNotes, [selectedSubtopicId]: text };
    setUserNotes(updated);
    setIsSavingNotes(true);
    try {
      localStorage.setItem('gate2027_docs_user_notes', JSON.stringify(updated));
    } catch (e) {}
    setTimeout(() => setIsSavingNotes(false), 600);
  };

  // Current active section
  const currentSection: SyllabusSection = useMemo(() => {
    return GATE_DA_SYLLABUS.find((s) => s.id === selectedSectionId) || GATE_DA_SYLLABUS[0];
  }, [selectedSectionId]);

  // Current active subtopic
  const currentSubtopic: SyllabusSubtopic = useMemo(() => {
    return (
      currentSection.subtopics.find((st) => st.id === selectedSubtopicId) ||
      currentSection.subtopics[0]
    );
  }, [currentSection, selectedSubtopicId]);

  // Subtopic index and navigation helpers
  const currentSubtopicIndex = useMemo(() => {
    return currentSection.subtopics.findIndex((st) => st.id === currentSubtopic.id);
  }, [currentSection, currentSubtopic]);

  const prevSubtopic = useMemo(() => {
    return currentSubtopicIndex > 0 ? currentSection.subtopics[currentSubtopicIndex - 1] : null;
  }, [currentSubtopicIndex, currentSection]);

  const nextSubtopic = useMemo(() => {
    return currentSubtopicIndex < currentSection.subtopics.length - 1
      ? currentSection.subtopics[currentSubtopicIndex + 1]
      : null;
  }, [currentSubtopicIndex, currentSection]);

  // Switch section handler (automatically resets subtopic to first of new section)
  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    const targetSection = GATE_DA_SYLLABUS.find((s) => s.id === sectionId);
    if (targetSection && targetSection.subtopics.length > 0) {
      setSelectedSubtopicId(targetSection.subtopics[0].id);
    }
    setIsMobileSidebarOpen(false);
  };

  // Filtered sections based on search
  const filteredSections = useMemo(() => {
    if (!searchSubjectQuery.trim()) return GATE_DA_SYLLABUS;
    const q = searchSubjectQuery.toLowerCase().trim();
    return GATE_DA_SYLLABUS.filter((sec) => {
      const matchTitle = sec.title.toLowerCase().includes(q);
      const matchDesc = sec.officialDescription.toLowerCase().includes(q);
      const matchSub = sec.subtopics.some((st) => st.title.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchSub;
    });
  }, [searchSubjectQuery]);

  return (
    <div className="docs-shell">
      {/* Top Universal Navbar */}
      <header className="docs-top-nav">
        <div className="docs-nav-left">
          <button
            type="button"
            className="mobile-sidebar-toggle-btn"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            title="Toggle Subjects Menu"
          >
            <span>☰</span>
            <span className="btn-label">Subjects</span>
          </button>

          <Link href="/" className="back-tracker-btn" title="Return to Schedule Master Tracker">
            <span>← Master Tracker</span>
          </Link>

          <div className="docs-brand-badge">
            <span className="live-dot"></span>
            <span className="docs-badge-title">GATE DA 2027 • Official Syllabus Docs</span>
          </div>
        </div>

        <div className="docs-nav-right">
          <a
            href="/DA_GATE2027_Syllabus.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="pdf-download-btn"
            title="View original official PDF"
          >
            <span>📄 View Official PDF</span>
          </a>

          {/* Theme Switcher */}
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
              title="Cream BG with White Border"
            >
              <span className="theme-swatch swatch-cream-white"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout: Sidebar (Subjects) + Main Bar (Droper & Content) */}
      <div className="docs-layout-container">
        {/* Mobile Backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="docs-sidebar-backdrop"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>
        )}

        {/* SIDEBAR: Subjects from DA_GATE2027_Syllabus.pdf */}
        <aside className={`docs-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-header-title">
              <span className="syllabus-iit-tag">IIT MADRAS</span>
              <h3>GATE DA Subjects</h3>
            </div>
            <div className="sidebar-search-box">
              <input
                type="text"
                placeholder="Search subject or topic..."
                value={searchSubjectQuery}
                onChange={(e) => setSearchSubjectQuery(e.target.value)}
              />
              {searchSubjectQuery && (
                <button className="clear-search-btn" onClick={() => setSearchSubjectQuery('')}>
                  ×
                </button>
              )}
            </div>
          </div>

          {/* DEDICATED CUSTOM SUB-TOPIC DROPDOWN NAVIGATOR */}
          <div className="sidebar-subtopic-navigator" ref={dropdownRef}>
            <div className="subtopic-nav-header">
              <span className="subtopic-nav-kicker">📌 ACTIVE SUB-TOPIC</span>
              <span className="subtopic-nav-subject">
                Sec {currentSection.sectionNumber}: {currentSection.code}
              </span>
            </div>

            {/* Custom Dropdown Trigger */}
            <div className="custom-dropdown-wrap">
              <button
                type="button"
                className={`custom-dropdown-trigger ${isDropdownOpen ? 'is-open' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                <div className="trigger-badge-title">
                  <span className="trigger-num">{String(currentSubtopicIndex + 1).padStart(2, '0')}</span>
                  <span className="trigger-text">{currentSubtopic.title}</span>
                </div>
                <span className={`trigger-arrow-icon ${isDropdownOpen ? 'rotated' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Custom Dropdown Menu with solid 2px black border, cream/white bg */}
              {isDropdownOpen && (
                <div className="custom-dropdown-menu" role="listbox">
                  <div className="dropdown-menu-header">
                    <span>{currentSection.title} • {currentSection.subtopics.length} Topics</span>
                  </div>
                  <div className="dropdown-menu-scroll">
                    {currentSection.subtopics.map((st, idx) => {
                      const isCurrent = st.id === selectedSubtopicId;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          role="option"
                          aria-selected={isCurrent}
                          className={`dropdown-menu-item ${isCurrent ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedSubtopicId(st.id);
                            setIsDropdownOpen(false);
                            setIsMobileSidebarOpen(false);
                          }}
                        >
                          <span className="item-num-pill">{String(idx + 1).padStart(2, '0')}</span>
                          <span className="item-label">{st.title}</span>
                          {isCurrent && <span className="item-check-icon">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Step Buttons */}
            <div className="subtopic-quick-stepper">
              <button
                type="button"
                className="stepper-btn"
                disabled={!prevSubtopic}
                onClick={() => {
                  if (prevSubtopic) {
                    setSelectedSubtopicId(prevSubtopic.id);
                  }
                }}
                title={prevSubtopic ? `Previous: ${prevSubtopic.title}` : 'First subtopic'}
              >
                ◀ Prev
              </button>
              <span className="stepper-counter">
                {currentSubtopicIndex + 1} / {currentSection.subtopics.length}
              </span>
              <button
                type="button"
                className="stepper-btn"
                disabled={!nextSubtopic}
                onClick={() => {
                  if (nextSubtopic) {
                    setSelectedSubtopicId(nextSubtopic.id);
                  }
                }}
                title={nextSubtopic ? `Next: ${nextSubtopic.title}` : 'Last subtopic'}
              >
                Next ▶
              </button>
            </div>
          </div>

          {/* Section Divider */}
          <div className="sidebar-section-divider">
            <span>ALL 7 SYLLABUS SECTIONS</span>
          </div>

          <div className="sidebar-subjects-list">
            {filteredSections.map((sec) => {
              const isSelected = sec.id === currentSection.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  className={`subject-nav-item ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectSection(sec.id)}
                >
                  <div className="subject-item-top">
                    <span className="section-num-pill">Sec {sec.sectionNumber}</span>
                    <span className={`tier-badge ${sec.tier === 'Tier S' ? 'tier-s' : sec.tier === 'Tier A' ? 'tier-a' : 'tier-b'}`}>
                      {sec.tier}
                    </span>
                  </div>
                  <div className="subject-item-title">{sec.title}</div>
                  <div className="subject-item-footer">
                    <span className="subtopic-count-tag">
                      {sec.subtopics.length} subtopics
                    </span>
                    <span className="section-code-tag">{sec.code}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="sidebar-footer">
            <div className="syllabus-source-note">
              Source: <code>DA_GATE2027_Syllabus.pdf</code>
            </div>
          </div>
        </aside>

        {/* MAIN BAR & CONTENT VIEW */}
        <main className="docs-main-viewport">
          {/* MAIN BAR: Breadcrumb Trail & Quick Nav (Dropdown now in sidebar!) */}
          <div className="docs-main-bar">
            <div className="main-bar-breadcrumb">
              <span className="crumb-root">GATE DA 2027</span>
              <span className="crumb-sep">/</span>
              <span
                className="crumb-subject"
                style={{
                  color: currentTheme === 'all-black' ? '#ffffff' : currentSection.color.accent,
                }}
              >
                Section {currentSection.sectionNumber}: {currentSection.title}
              </span>
              <span className="crumb-sep">/</span>
              <span className="crumb-subtopic">{currentSubtopic.title}</span>
            </div>

            <div className="main-bar-quick-nav">
              <button
                type="button"
                className="main-bar-nav-btn"
                disabled={!prevSubtopic}
                onClick={() => prevSubtopic && setSelectedSubtopicId(prevSubtopic.id)}
                title={prevSubtopic ? `Previous: ${prevSubtopic.title}` : 'First subtopic'}
              >
                ◀ Prev Topic
              </button>
              <span className="main-bar-step-pill">
                Topic {currentSubtopicIndex + 1} of {currentSection.subtopics.length}
              </span>
              <button
                type="button"
                className="main-bar-nav-btn"
                disabled={!nextSubtopic}
                onClick={() => nextSubtopic && setSelectedSubtopicId(nextSubtopic.id)}
                title={nextSubtopic ? `Next: ${nextSubtopic.title}` : 'Last subtopic'}
              >
                Next Topic ▶
              </button>
            </div>
          </div>

          {/* MAIN CONTENT CANVAS: Clean & Ready for Step-by-Step Info */}
          <div className="docs-canvas-container">
            {/* Topic Spotlight Header */}
            <div className="subtopic-header-card">
              <div className="subtopic-meta-row">
                <span
                  className="subject-badge"
                  style={{
                    background: currentTheme === 'all-black' ? 'var(--bg-surface-elevated)' : currentSection.color.bg,
                    color: currentTheme === 'all-black' ? '#ffffff' : currentSection.color.text,
                    border: `1.5px solid var(--border-black)`,
                  }}
                >
                  Section {currentSection.sectionNumber} • {currentSection.title}
                </span>

                <span className={`tier-badge ${currentSection.tier === 'Tier S' ? 'tier-s' : currentSection.tier === 'Tier A' ? 'tier-a' : 'tier-b'}`}>
                  {currentSection.tier}
                </span>

                <span className="topic-order-badge">
                  Subtopic {currentSubtopicIndex + 1} of {currentSection.subtopics.length}
                </span>

                <span className="status-badge-ready">
                  ⚡ Ready for Learning
                </span>
              </div>

              <h1 className="subtopic-main-title">{currentSubtopic.title}</h1>

              {/* Official Syllabus Scope Snippet */}
              <div className="official-scope-callout">
                <div className="scope-tag">Official IIT Madras Syllabus Scope</div>
                <p className="scope-text">{currentSection.officialDescription}</p>
              </div>
            </div>

            {/* Empty Canvas Workspace (User requested: "don't put any thing there rn i will learn stuff and ask you to put info there step by step") */}
            <div className="empty-workspace-card">
              <div className="empty-workspace-banner">
                <div className="empty-icon-wrap">
                  <span className="empty-icon">📖</span>
                </div>
                <div className="empty-text-wrap">
                  <h3>Study Workspace Ready</h3>
                  <p>
                    This topic space is intentionally clear. As you learn <strong>&ldquo;{currentSubtopic.title}&rdquo;</strong>,
                    you can ask to document:
                  </p>
                  <ul className="step-by-step-points">
                    <li>Core mathematical definitions, axioms & intuitive visualizations</li>
                    <li>Key formulas, derivations, shortcuts & matrix identities</li>
                    <li>Python code demonstrations (NumPy, SciPy, Scikit-learn, PyTorch)</li>
                    <li>Past GATE DA question patterns & tricky pitfalls to avoid</li>
                  </ul>
                </div>
              </div>

              {/* Interactive Personal Scratchpad for Quick Notes */}
              <div className="scratchpad-section">
                <div className="scratchpad-header">
                  <div className="scratchpad-title-row">
                    <span className="scratchpad-icon">✍️</span>
                    <h4>Personal Study Notes & Questions Scratchpad</h4>
                    {isSavingNotes && <span className="saving-indicator">[Saving...]</span>}
                  </div>
                  <span className="scratchpad-hint">Auto-saved locally for this subtopic</span>
                </div>

                <textarea
                  className="scratchpad-textarea"
                  rows={8}
                  placeholder={`Write your draft notes, doubts, or formulas here for "${currentSubtopic.title}"...\n\nExample:\n- Key formula I need to remember:\n- Question I had while watching the lecture:\n- Mistakes to watch out for:`}
                  value={userNotes[selectedSubtopicId] || ''}
                  onChange={(e) => handleNoteChange(e.target.value)}
                />
              </div>

              {/* Learning Roadmap Blueprint */}
              <div className="learning-blueprint-row">
                <div className="blueprint-step">
                  <div className="step-num">01</div>
                  <div className="step-desc">
                    <strong>Concept Study (2.5h)</strong>
                    <span>Deep dive into theory without memorizing formulas blindly</span>
                  </div>
                </div>
                <div className="blueprint-step">
                  <div className="step-num">02</div>
                  <div className="step-desc">
                    <strong>Problem Solving (2.0h)</strong>
                    <span>Solve standard workbook & textbook problems</span>
                  </div>
                </div>
                <div className="blueprint-step">
                  <div className="step-num">03</div>
                  <div className="step-desc">
                    <strong>GATE PYQs (1.5h)</strong>
                    <span>Test understanding under realistic timed conditions</span>
                  </div>
                </div>
                <div className="blueprint-step">
                  <div className="step-num">04</div>
                  <div className="step-desc">
                    <strong>Error Notebook (0.5h)</strong>
                    <span>Log any wrong questions into your Mistake Book</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
