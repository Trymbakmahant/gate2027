'use client';

import React, { useState } from 'react';
import LinearRegression3DViewer from './LinearRegression3DViewer';
import SupervisedUnsupervisedVisualizer from './SupervisedUnsupervisedVisualizer';
import MLFormulasStudySheet from './MLFormulasStudySheet';

export interface MachineLearningStudyModuleProps {
  themeMode?: 'cream-black' | 'all-black' | 'cream-white';
  initialTab?: '3d-sim' | 'paradigms' | 'formulas';
}

export default function MachineLearningStudyModule({
  themeMode = 'cream-black',
  initialTab = '3d-sim',
}: MachineLearningStudyModuleProps) {
  const [activeTab, setActiveTab] = useState<'3d-sim' | 'paradigms' | 'formulas'>(initialTab);

  return (
    <div className="ml-study-module-wrapper">
      {/* Module Spotlight Header */}
      <div className="module-top-banner">
        <div className="module-badge-row">
          <span className="module-status-pill">
            <span className="live-sparkle">✨</span>
            Learned &amp; Documented Topic
          </span>
          <span className="module-code-pill">GATE DA Section 6 • Machine Learning</span>
        </div>

        <div className="module-header-content">
          <h2 className="module-title">
            Machine Learning Core: Supervised, Unsupervised &amp; Single Linear Regression
          </h2>
          <p className="module-desc">
            Interactive visual laboratory, real-time 3D loss surface animation, paradigm visualizer, and complete
            formula sheet for fast, intuitive revision.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="module-tabs-nav" role="tablist">
          <button
            type="button"
            className={`module-tab-btn ${activeTab === '3d-sim' ? 'active' : ''}`}
            onClick={() => setActiveTab('3d-sim')}
          >
            <span className="tab-icon">🌐</span>
            <span>3D Loss Simulation &amp; Fit</span>
          </button>

          <button
            type="button"
            className={`module-tab-btn ${activeTab === 'paradigms' ? 'active' : ''}`}
            onClick={() => setActiveTab('paradigms')}
          >
            <span className="tab-icon">📊</span>
            <span>Supervised vs. Unsupervised</span>
          </button>

          <button
            type="button"
            className={`module-tab-btn ${activeTab === 'formulas' ? 'active' : ''}`}
            onClick={() => setActiveTab('formulas')}
          >
            <span className="tab-icon">📐</span>
            <span>Formulas &amp; Derivations</span>
          </button>
        </div>
      </div>

      {/* Tab Content Display */}
      <div className="module-tab-content">
        {activeTab === '3d-sim' && (
          <div className="tab-pane-fade">
            <LinearRegression3DViewer themeMode={themeMode} />
          </div>
        )}

        {activeTab === 'paradigms' && (
          <div className="tab-pane-fade">
            <SupervisedUnsupervisedVisualizer themeMode={themeMode} />
          </div>
        )}

        {activeTab === 'formulas' && (
          <div className="tab-pane-fade">
            <MLFormulasStudySheet themeMode={themeMode} />
          </div>
        )}
      </div>
    </div>
  );
}
