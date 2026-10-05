'use client';

import React from 'react';
import { SyllabusSection, SyllabusSubtopic } from '@/data/syllabusData';
import { TopicModule, TopicWorkspaceTab, AppThemeMode } from '../types';

interface TopicOverviewTabProps {
  section: SyllabusSection;
  subtopic: SyllabusSubtopic;
  module?: TopicModule;
  onSelectTab: (tab: TopicWorkspaceTab) => void;
  themeMode?: AppThemeMode;
}

export default function TopicOverviewTab({
  section,
  subtopic,
  module,
  onSelectTab,
  themeMode
}: TopicOverviewTabProps) {
  const learningResources = module?.learningResources || section.learningResources || [];

  return (
    <div className="topic-overview-container">
      {/* Hero Overview Banner */}
      <div className="topic-hero-banner">
        <div className="hero-top-row">
          <span className="hero-section-tag">
            Section {section.sectionNumber}: {section.title}
          </span>
          <span className="hero-tier-tag">{section.tier} Weightage</span>
          {module?.gateImportance && (
            <span className="hero-importance-tag">{module.gateImportance}</span>
          )}
        </div>

        <h2 className="hero-title">{subtopic.title}</h2>

        <p className="hero-summary">
          {module?.summary ||
            `Official GATE Data Science and Artificial Intelligence syllabus topic under ${section.title}. Focus on rigorous mathematical definitions, analytical properties, and numerical problem solving.`}
        </p>

        {/* Quick Action Launchers */}
        <div className="hero-action-buttons">
          {learningResources.length > 0 && (
            <button
              type="button"
              className="hero-action-btn video"
              onClick={() => onSelectTab('resources')}
            >
              <span>▶</span>
              <span>Watch Video Playlist</span>
            </button>
          )}

          {module?.simulation && (
            <button
              type="button"
              className="hero-action-btn primary"
              onClick={() => onSelectTab('simulation')}
            >
              <span>🧪</span>
              <span>Launch {module.simulation.badge || 'Interactive Lab'}</span>
            </button>
          )}

          {module?.formulas && (
            <button
              type="button"
              className="hero-action-btn"
              onClick={() => onSelectTab('formulas')}
            >
              <span>📐</span>
              <span>View Master Formulas</span>
            </button>
          )}

          {module?.quiz && (
            <button
              type="button"
              className="hero-action-btn accent"
              onClick={() => onSelectTab('quiz')}
            >
              <span>✍️</span>
              <span>Practice Test ({module.quiz.questions.length} Questions)</span>
            </button>
          )}

          <button
            type="button"
            className="hero-action-btn notes"
            onClick={() => onSelectTab('notes')}
          >
            <span>📝</span>
            <span>My Personal Notes</span>
          </button>
        </div>
      </div>

      {/* Featured Learning Material & Video Playlist Card */}
      {learningResources.length > 0 && (
        <div className="learning-material-card">
          <div className="learning-material-content">
            <div className="mat-badge-row">
              <span className="yt-badge">▶ YouTube Learning Material</span>
              <span className="mat-curated-badge">Recommended Video Course</span>
            </div>
            <h3 className="mat-title">{learningResources[0].title}</h3>
            {learningResources[0].author && (
              <div className="mat-author">
                Instructor: <strong>{learningResources[0].author}</strong> • Platform: <strong>{learningResources[0].platform || 'YouTube'}</strong>
              </div>
            )}
            <p className="mat-desc">{learningResources[0].description}</p>
          </div>

          <div className="learning-material-actions">
            <button
              type="button"
              className="mat-play-btn"
              onClick={() => onSelectTab('resources')}
            >
              <span>▶ Watch Inside App Theater</span>
            </button>
            <a
              href={learningResources[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="mat-yt-link-btn"
            >
              <span>Open on YouTube ↗</span>
            </a>
          </div>
        </div>
      )}

      {/* Two Column Layout: Key Takeaways & Syllabus Scope */}
      <div className="topic-details-grid">
        {/* Key Takeaways */}
        <div className="details-card">
          <div className="details-card-header">
            <span className="card-icon">🎯</span>
            <h3>Core Concepts &amp; Key Takeaways</h3>
          </div>
          {module?.keyTakeaways && module.keyTakeaways.length > 0 ? (
            <ul className="takeaways-list">
              {module.keyTakeaways.map((item, idx) => (
                <li key={idx} className="takeaway-item">
                  <span className="bullet-num">{idx + 1}</span>
                  <span className="takeaway-text">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-takeaway-state">
              <p>Key takeaways and study checklist for this subtopic:</p>
              <ul className="generic-study-list">
                <li>Understand theoretical foundations and mathematical proofs.</li>
                <li>Practice numerical calculation shortcuts for 1-mark and 2-mark GATE questions.</li>
                <li>Log edge cases and common conceptual traps in your personal notes.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Official Syllabus Scope */}
        <div className="details-card">
          <div className="details-card-header">
            <span className="card-icon">📜</span>
            <h3>Official IIT Madras Syllabus Scope</h3>
          </div>
          <div className="syllabus-scope-box">
            <p className="scope-quote">"{section.officialDescription}"</p>
            <div className="scope-meta">
              <span>Section Code: <code>{section.code}</code></span>
              <span>Target: GATE DA 2027</span>
            </div>
          </div>

          <div className="preparation-tip-box">
            <strong>💡 High-Yield GATE DA Strategy:</strong>
            <p>
              Consistently test yourself with the interactive <strong>Topic Test</strong> and verify equations using the <strong>3D Simulation</strong> to build strong geometric intuition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
