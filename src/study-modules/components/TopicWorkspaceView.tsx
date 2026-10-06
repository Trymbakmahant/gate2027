'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SyllabusSection, SyllabusSubtopic } from '@/data/syllabusData';
import { getTopicModule } from '../registry';
import { TopicWorkspaceTab, AppThemeMode } from '../types';
import TopicOverviewTab from './TopicOverviewTab';
import TopicTestQuiz from './TopicTestQuiz';
import TopicResourcesView from './TopicResourcesView';
import FormattedNotesView from './FormattedNotesView';

interface TopicWorkspaceViewProps {
  section: SyllabusSection;
  subtopic: SyllabusSubtopic;
  themeMode?: AppThemeMode;
  userNote: string;
  onSaveNote: (text: string) => void;
  isSavingNote: boolean;
}

export default function TopicWorkspaceView({
  section,
  subtopic,
  themeMode,
  userNote,
  onSaveNote,
  isSavingNote
}: TopicWorkspaceViewProps) {
  // Query module from central registry
  const module = useMemo(() => {
    return getTopicModule(subtopic.id);
  }, [subtopic.id]);

  // Learning resources from module, subtopic or section
  const learningResources = useMemo(() => {
    return module?.learningResources || subtopic.learningResources || section.learningResources || [];
  }, [module, subtopic, section]);

  // Tab state
  const [activeTab, setActiveTab] = useState<TopicWorkspaceTab>('overview');

  // Notes view mode: 'preview' (formatted markdown reading) vs 'edit' (textarea input)
  const [notesViewMode, setNotesViewMode] = useState<'preview' | 'edit'>('preview');
  const [copiedNotes, setCopiedNotes] = useState<boolean>(false);

  // When subtopic changes, set default tab
  useEffect(() => {
    if (module?.simulation) {
      setActiveTab('simulation');
    } else {
      setActiveTab('overview');
    }
  }, [subtopic.id, module]);

  // Tab definitions dynamically computed based on registered module capabilities
  const tabs = useMemo(() => {
    const list: {
      id: TopicWorkspaceTab;
      label: string;
      icon: string;
      badge?: string;
      count?: number;
    }[] = [
      { id: 'overview', label: 'Overview', icon: '📖' }
    ];

    if (learningResources.length > 0) {
      const isArticle = learningResources[0]?.type === 'article';
      list.push({
        id: 'resources',
        label: isArticle ? 'Revision Guide' : 'Video Lectures',
        icon: isArticle ? '📖' : '📺',
        badge: isArticle ? 'Article' : 'Playlist'
      });
    }

    if (module?.simulation) {
      list.push({
        id: 'simulation',
        label: module.simulation.tabLabel || 'Interactive Lab',
        icon: '🧪',
        badge: module.simulation.badge || 'Sim'
      });
    }

    if (module?.formulas) {
      list.push({
        id: 'formulas',
        label: module.formulas.tabLabel || 'Formulas',
        icon: '📐'
      });
    }

    if (module?.quiz) {
      list.push({
        id: 'quiz',
        label: module.quiz.tabLabel || 'Topic Test',
        icon: '✍️',
        count: module.quiz.questions.length
      });
    }

    list.push({
      id: 'notes',
      label: 'My Notes',
      icon: '📝',
      badge: userNote.trim() ? 'Saved' : undefined
    });

    return list;
  }, [module, learningResources, userNote]);

  return (
    <div className="topic-workspace-shell">
      {/* Dynamic Tab Navigation Bar */}
      <nav className="topic-workspace-tabs" aria-label="Topic Study Sections">
        <div className="tabs-list-wrapper">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`workspace-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
                {tab.badge && <span className="tab-badge">{tab.badge}</span>}
                {tab.count !== undefined && (
                  <span className="tab-count-pill">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status / Quick Action on right of tab bar */}
        <div className="tab-bar-status">
          {isSavingNote && <span className="tab-saving-indicator">Saving note...</span>}
          {module?.gateImportance && (
            <span className="tab-importance-pill">{module.gateImportance}</span>
          )}
        </div>
      </nav>

      {/* Main Tab Viewport */}
      <div className="topic-workspace-content">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <TopicOverviewTab
            section={section}
            subtopic={subtopic}
            module={module}
            onSelectTab={setActiveTab}
            themeMode={themeMode}
          />
        )}

        {/* TAB: VIDEO LECTURES & PLAYLIST */}
        {activeTab === 'resources' && learningResources.length > 0 && (
          <TopicResourcesView
            section={section}
            subtopic={subtopic}
            resources={learningResources}
            userNote={userNote}
            onSaveNote={onSaveNote}
            isSavingNote={isSavingNote}
            themeMode={themeMode}
          />
        )}

        {/* TAB 2: INTERACTIVE SIMULATION / LAB */}
        {activeTab === 'simulation' && module?.simulation && (
          <div className="workspace-simulation-container">
            {module.simulation.description && (
              <div className="sim-intro-callout">
                <span className="sim-intro-icon">💡</span>
                <p>{module.simulation.description}</p>
              </div>
            )}
            <module.simulation.component themeMode={themeMode || 'cream-black'} />
          </div>
        )}

        {/* TAB 3: FORMULAS SHEET */}
        {activeTab === 'formulas' && module?.formulas?.component && (
          <div className="workspace-formulas-container">
            <module.formulas.component themeMode={themeMode || 'cream-black'} />
          </div>
        )}

        {/* TAB 4: TOPIC PRACTICE TEST & QUESTIONS */}
        {activeTab === 'quiz' && module?.quiz && (
          <div className="workspace-quiz-container">
            <TopicTestQuiz
              title={module.quiz.title}
              subtopicId={subtopic.id}
              questions={module.quiz.questions}
              themeMode={themeMode}
            />
          </div>
        )}

        {/* TAB 5: PERSONAL STUDY NOTES & SCRATCHPAD */}
        {activeTab === 'notes' && (
          <div className="workspace-notes-container">
            <div className="notes-editor-card">
              <div className="notes-editor-header">
                <div className="notes-header-left">
                  <span className="notes-icon">✍️</span>
                  <div>
                    <h4>Personal Study Notes: {subtopic.title}</h4>
                    <p className="notes-subtitle">
                      Auto-saves to your browser and syncs with your GATE 2027 workspace.
                    </p>
                  </div>
                </div>

                <div className="notes-header-actions">
                  {/* View Mode Toggle */}
                  <div className="notes-mode-toggle-group">
                    <button
                      type="button"
                      className={`notes-mode-btn ${notesViewMode === 'preview' ? 'active' : ''}`}
                      onClick={() => setNotesViewMode('preview')}
                    >
                      📖 Formatted View
                    </button>
                    <button
                      type="button"
                      className={`notes-mode-btn ${notesViewMode === 'edit' ? 'active' : ''}`}
                      onClick={() => setNotesViewMode('edit')}
                    >
                      ✍️ Edit Notes
                    </button>
                  </div>

                  {/* Copy Markdown Button */}
                  <button
                    type="button"
                    className="notes-action-tool-btn"
                    onClick={() => {
                      const textToCopy = userNote || subtopic.notes || '';
                      navigator.clipboard.writeText(textToCopy);
                      setCopiedNotes(true);
                      setTimeout(() => setCopiedNotes(false), 1800);
                    }}
                    title="Copy full notes markdown"
                  >
                    {copiedNotes ? '✓ Copied' : '📋 Copy'}
                  </button>

                  {/* Load/Reset Master Notes */}
                  {subtopic.notes && (
                    <button
                      type="button"
                      className="notes-load-master-btn"
                      onClick={() => {
                        if (
                          !userNote.trim() ||
                          window.confirm('Replace your current notes with the complete Master Topic Notes?')
                        ) {
                          onSaveNote(subtopic.notes || '');
                        }
                      }}
                      title="Load curated master notes"
                    >
                      📥 {userNote.trim() ? 'Reset to Master Notes' : 'Load Master Notes'}
                    </button>
                  )}

                  {isSavingNote ? (
                    <span className="notes-saving-badge">💾 Auto-saving...</span>
                  ) : (
                    <span className="notes-saved-badge">✓ Synced</span>
                  )}

                  {userNote.trim() && (
                    <button
                      type="button"
                      className="notes-clear-btn"
                      onClick={() => {
                        if (window.confirm('Clear your notes for this topic?')) {
                          onSaveNote('');
                        }
                      }}
                    >
                      Clear Notes
                    </button>
                  )}
                </div>
              </div>

              {/* Quick load banner if note is empty and subtopic has master notes */}
              {!userNote.trim() && subtopic.notes && (
                <div className="empty-notes-master-prompt">
                  <div className="prompt-left">
                    <span className="prompt-icon">📘</span>
                    <div>
                      <strong>Master Notes Available for {subtopic.title}</strong>
                      <p>
                        Load complete revision notes with 18 matrix types, determinant expansion, adjoint/inverse formulas,
                        and Data Science ML applications.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="load-master-prompt-btn"
                    onClick={() => onSaveNote(subtopic.notes || '')}
                  >
                    📥 Load Complete Master Notes
                  </button>
                </div>
              )}

              {/* Body: Formatted View vs Edit View */}
              {notesViewMode === 'preview' ? (
                <div className="notes-preview-wrapper">
                  <FormattedNotesView markdown={userNote || subtopic.notes || ''} />
                </div>
              ) : (
                <textarea
                  className="notes-textarea"
                  rows={16}
                  placeholder={`Jot down your derivations, key formulas, questions you got wrong, or personal mnemonics for ${subtopic.title} here...`}
                  value={userNote}
                  onChange={(e) => onSaveNote(e.target.value)}
                />
              )}

              <div className="notes-footer-tips">
                <span>
                  💡 Tip: Use Markdown formatting (headings with ##, bullets with -, links with [text](url)).
                </span>
                <span>Characters: {(userNote || subtopic.notes || '').length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
