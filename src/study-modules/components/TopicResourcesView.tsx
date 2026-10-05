'use client';

import React, { useState } from 'react';
import { SyllabusSection, SyllabusSubtopic, LearningResource } from '@/data/syllabusData';
import { AppThemeMode } from '../types';

interface TopicResourcesViewProps {
  section: SyllabusSection;
  subtopic: SyllabusSubtopic;
  resources: LearningResource[];
  userNote: string;
  onSaveNote: (text: string) => void;
  isSavingNote: boolean;
  themeMode?: AppThemeMode;
}

export default function TopicResourcesView({
  section,
  subtopic,
  resources,
  userNote,
  onSaveNote,
  isSavingNote,
  themeMode
}: TopicResourcesViewProps) {
  const [selectedResourceId, setSelectedResourceId] = useState<string>(
    resources[0]?.id || ''
  );
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(true);

  const activeResource =
    resources.find((r) => r.id === selectedResourceId) || resources[0];

  if (!resources || resources.length === 0) {
    return (
      <div className="empty-quiz-card">
        <div className="empty-quiz-icon">📺</div>
        <h3>No Video Lectures Configured Yet</h3>
        <p>Curated learning materials and video lectures for this section are being updated.</p>
      </div>
    );
  }

  // Generate embed URL for YouTube playlist or video
  const getEmbedUrl = (res: LearningResource) => {
    if (res.playlistId) {
      const videoPart = res.embedVideoId ? `${res.embedVideoId}?` : '?';
      return `https://www.youtube-nocookie.com/embed/${videoPart}list=${res.playlistId}&rel=0`;
    }
    if (res.embedVideoId) {
      return `https://www.youtube-nocookie.com/embed/${res.embedVideoId}?rel=0`;
    }
    return res.url;
  };

  return (
    <div className="topic-resources-container">
      {/* Header Banner */}
      <div className="resources-header-card">
        <div className="resources-header-left">
          <div className="resources-badge-row">
            <span className="yt-badge">▶ YouTube Learning Material</span>
            <span className="res-section-badge">Section {section.sectionNumber}: {section.title}</span>
            {activeResource.author && (
              <span className="res-author-badge">Instructor: {activeResource.author}</span>
            )}
          </div>
          <h2 className="resources-title">{activeResource.title}</h2>
          <p className="resources-desc">{activeResource.description}</p>
        </div>

        <div className="resources-header-actions">
          <a
            href={activeResource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="open-yt-btn"
          >
            <span>Open on YouTube</span>
            <span>↗</span>
          </a>
          <button
            type="button"
            className="toggle-notes-btn"
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
          >
            {showNotesDrawer ? 'Hide Scratchpad ▲' : 'Show Scratchpad 📝'}
          </button>
        </div>
      </div>

      {/* Main Theater & Notes Workspace */}
      <div className={`resources-theater-grid ${showNotesDrawer ? 'with-notes' : 'full-width'}`}>
        {/* Video Player Box */}
        <div className="video-player-card">
          <div className="video-iframe-wrap">
            <iframe
              src={getEmbedUrl(activeResource)}
              title={activeResource.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="video-iframe"
            />
          </div>

          <div className="video-player-footer">
            <div className="playlist-meta">
              <span className="meta-item">
                <strong>Platform:</strong> {activeResource.platform || 'YouTube'}
              </span>
              {activeResource.playlistId && (
                <span className="meta-item">
                  <strong>Type:</strong> Full Series Playlist
                </span>
              )}
              <span className="meta-item">
                <strong>Current Subtopic:</strong> {subtopic.title}
              </span>
            </div>

            {activeResource.tags && (
              <div className="resource-tags-row">
                {activeResource.tags.map((tag, idx) => (
                  <span key={idx} className="resource-tag-pill">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side-by-side Note Taking Scratchpad */}
        {showNotesDrawer && (
          <div className="side-notes-card">
            <div className="side-notes-header">
              <div className="side-notes-title">
                <span>✍️</span>
                <h4>Lecture Study Notes</h4>
              </div>
              {isSavingNote ? (
                <span className="notes-saving-badge">💾 Saving...</span>
              ) : (
                <span className="notes-saved-badge">✓ Auto-saved</span>
              )}
            </div>

            <textarea
              className="side-notes-textarea"
              rows={14}
              placeholder={`Take notes while watching the video lecture for "${subtopic.title}"...\n\n- Key definitions & notation:\n- Steps for Gaussian Elimination / Eigenvalues:\n- Important theorems & exam tricks:`}
              value={userNote}
              onChange={(e) => onSaveNote(e.target.value)}
            />

            <div className="side-notes-footer">
              <span>{userNote.length} characters</span>
              <a
                href={activeResource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="yt-direct-link"
              >
                Watch full playlist on YouTube ↗
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Playlist Curriculum Guide */}
      <div className="curriculum-guide-card">
        <div className="curriculum-header">
          <span className="guide-icon">📑</span>
          <h3>Linear Algebra GATE DA Study Syllabus Checklist</h3>
        </div>
        <div className="curriculum-subtopics-grid">
          {section.subtopics.map((st, idx) => (
            <div
              key={st.id}
              className={`curriculum-step-box ${st.id === subtopic.id ? 'current' : ''}`}
            >
              <div className="curriculum-step-top">
                <span className="step-num">{String(idx + 1).padStart(2, '0')}</span>
                {st.id === subtopic.id && <span className="current-dot">Active</span>}
              </div>
              <div className="curriculum-step-title">{st.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
