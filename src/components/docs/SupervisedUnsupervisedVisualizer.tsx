'use client';

import React, { useState, useEffect, useRef } from 'react';

type LearningMode = 'supervised-regression' | 'supervised-classification' | 'unsupervised-clustering';

export interface SupervisedUnsupervisedVisualizerProps {
  themeMode?: 'cream-black' | 'all-black' | 'cream-white';
}

export default function SupervisedUnsupervisedVisualizer({
  themeMode = 'cream-black',
}: SupervisedUnsupervisedVisualizerProps) {
  const [mode, setMode] = useState<LearningMode>('supervised-regression');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State for interactive features
  const [boundaryAngle, setBoundaryAngle] = useState<number>(45); // For classification
  const [clusterK, setClusterK] = useState<number>(3); // For unsupervised
  const [clusterStep, setClusterStep] = useState<number>(0);

  // Static datasets
  const regressionPoints = [
    { x: 1, y: 1.8 },
    { x: 2, y: 2.2 },
    { x: 3, y: 3.5 },
    { x: 4, y: 4.1 },
    { x: 5, y: 4.8 },
    { x: 6, y: 6.2 },
    { x: 7, y: 6.9 },
    { x: 8, y: 7.6 },
  ];

  const classificationPoints = [
    // Class 0 (Blue)
    { x: 1.5, y: 5.5, label: 0 },
    { x: 2.0, y: 6.2, label: 0 },
    { x: 2.8, y: 4.8, label: 0 },
    { x: 3.2, y: 6.8, label: 0 },
    { x: 3.8, y: 5.2, label: 0 },
    { x: 4.2, y: 6.5, label: 0 },
    // Class 1 (Rose)
    { x: 4.5, y: 2.5, label: 1 },
    { x: 5.2, y: 3.8, label: 1 },
    { x: 5.8, y: 2.2, label: 1 },
    { x: 6.5, y: 3.5, label: 1 },
    { x: 7.0, y: 1.8, label: 1 },
    { x: 7.8, y: 3.0, label: 1 },
  ];

  const unlabelledPoints = [
    { x: 2, y: 6 },
    { x: 2.5, y: 6.5 },
    { x: 3, y: 5.5 },
    { x: 2.8, y: 4.8 },
    { x: 6, y: 6.5 },
    { x: 6.8, y: 7 },
    { x: 7.2, y: 5.8 },
    { x: 6.2, y: 5.2 },
    { x: 4.5, y: 2 },
    { x: 5, y: 2.5 },
    { x: 5.8, y: 1.8 },
    { x: 4.2, y: 2.8 },
  ];

  // Draw on Canvas based on selected mode
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = themeMode === 'all-black' ? '#09090b' : '#faf7f2';
    ctx.fillRect(0, 0, width, height);

    // Helpers
    const toScreenX = (x: number) => (x / 9) * (width - 60) + 35;
    const toScreenY = (y: number) => height - 30 - (y / 9) * (height - 60);

    // Grid lines
    ctx.strokeStyle = themeMode === 'all-black' ? '#27272f' : '#e5dfd3';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(toScreenX(i), 15);
      ctx.lineTo(toScreenX(i), height - 25);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(30, toScreenY(i));
      ctx.lineTo(width - 25, toScreenY(i));
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = themeMode === 'all-black' ? '#52525b' : '#a1a1aa';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, height - 25);
    ctx.lineTo(width - 20, height - 25);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(35, 15);
    ctx.lineTo(35, height - 20);
    ctx.stroke();

    // MODE 1: Supervised Regression
    if (mode === 'supervised-regression') {
      // Best fit line
      const slope = 0.85;
      const intercept = 0.8;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(toScreenX(0.5), toScreenY(0.5 * slope + intercept));
      ctx.lineTo(toScreenX(8.5), toScreenY(8.5 * slope + intercept));
      ctx.stroke();

      // Residuals
      ctx.strokeStyle = themeMode === 'all-black' ? '#f43f5e' : '#e11d48';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      for (const p of regressionPoints) {
        const predY = p.x * slope + intercept;
        ctx.beginPath();
        ctx.moveTo(toScreenX(p.x), toScreenY(p.y));
        ctx.lineTo(toScreenX(p.x), toScreenY(predY));
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Data Points
      for (const p of regressionPoints) {
        ctx.fillStyle = themeMode === 'all-black' ? '#ffffff' : '#18181b';
        ctx.beginPath();
        ctx.arc(toScreenX(p.x), toScreenY(p.y), 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // MODE 2: Supervised Classification
    if (mode === 'supervised-classification') {
      // Linear Decision Boundary Line (Hyperplane)
      const rad = (boundaryAngle * Math.PI) / 180;
      const cx = 4.2;
      const cy = 4.5;
      const len = 4.5;

      const x1 = cx - Math.cos(rad) * len;
      const y1 = cy - Math.sin(rad) * len;
      const x2 = cx + Math.cos(rad) * len;
      const y2 = cy + Math.sin(rad) * len;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(toScreenX(x1), toScreenY(y1));
      ctx.lineTo(toScreenX(x2), toScreenY(y2));
      ctx.stroke();

      // Semi-transparent decision regions
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.beginPath();
      ctx.moveTo(toScreenX(x1), toScreenY(y1));
      ctx.lineTo(toScreenX(x2), toScreenY(y2));
      ctx.lineTo(toScreenX(9), toScreenY(9));
      ctx.lineTo(toScreenX(0), toScreenY(9));
      ctx.closePath();
      ctx.fill();

      // Points with Class Colors
      for (const p of classificationPoints) {
        ctx.fillStyle = p.label === 0 ? '#38bdf8' : '#f43f5e';
        ctx.beginPath();
        ctx.arc(toScreenX(p.x), toScreenY(p.y), 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = themeMode === 'all-black' ? '#ffffff' : '#18181b';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // MODE 3: Unsupervised Clustering (K-Means)
    if (mode === 'unsupervised-clustering') {
      const clusterColors = ['#10b981', '#f59e0b', '#8b5cf6'];
      const centroids = [
        { x: 2.6, y: 5.7 }, // Cluster 1
        { x: 6.5, y: 6.1 }, // Cluster 2
        { x: 4.8, y: 2.3 }, // Cluster 3
      ];

      // Draw Cluster Envelopes / Ellipses
      centroids.forEach((c, idx) => {
        ctx.strokeStyle = clusterColors[idx];
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.ellipse(toScreenX(c.x), toScreenY(c.y), 50, 40, 0, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Draw Unlabelled points grouped by proximity
      unlabelledPoints.forEach((p, idx) => {
        let assignedCluster = idx < 4 ? 0 : idx < 8 ? 1 : 2;
        ctx.fillStyle = clusterColors[assignedCluster];
        ctx.beginPath();
        ctx.arc(toScreenX(p.x), toScreenY(p.y), 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = themeMode === 'all-black' ? '#ffffff' : '#18181b';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Draw Centroids
      centroids.forEach((c, idx) => {
        const cx = toScreenX(c.x);
        const cy = toScreenY(c.y);

        // Star / Cross marker
        ctx.fillStyle = clusterColors[idx];
        ctx.beginPath();
        ctx.arc(cx, cy, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = themeMode === 'all-black' ? '#ffffff' : '#18181b';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillText(`&mu;${idx + 1}`, cx - 6, cy + 3);
      });
    }
  }, [mode, boundaryAngle, themeMode]);

  return (
    <div className="paradigm-visualizer-card">
      <div className="paradigm-header">
        <div className="paradigm-title-block">
          <span className="paradigm-badge">Machine Learning Taxonomy</span>
          <h3 className="paradigm-title">Supervised vs. Unsupervised &amp; Classification vs. Regression</h3>
          <p className="paradigm-subtitle">
            Switch between paradigms below to visualize how labels guide supervised algorithms (continuous fit vs.
            separating hyperplane) and how unsupervised algorithms discover natural clusters without any target
            ground truth.
          </p>
        </div>

        {/* Paradigm Buttons */}
        <div className="paradigm-tabs">
          <button
            type="button"
            className={`paradigm-btn ${mode === 'supervised-regression' ? 'active' : ''}`}
            onClick={() => setMode('supervised-regression')}
          >
            <span className="paradigm-icon">📈</span>
            Supervised: Regression
          </button>
          <button
            type="button"
            className={`paradigm-btn ${mode === 'supervised-classification' ? 'active' : ''}`}
            onClick={() => setMode('supervised-classification')}
          >
            <span className="paradigm-icon">🎯</span>
            Supervised: Classification
          </button>
          <button
            type="button"
            className={`paradigm-btn ${mode === 'unsupervised-clustering' ? 'active' : ''}`}
            onClick={() => setMode('unsupervised-clustering')}
          >
            <span className="paradigm-icon">🔍</span>
            Unsupervised: Clustering (k-Means)
          </button>
        </div>
      </div>

      <div className="paradigm-body-grid">
        {/* Canvas Area */}
        <div className="paradigm-canvas-container">
          <canvas ref={canvasRef} width={460} height={320} className="paradigm-canvas" />

          {/* Interactive slider for classification boundary angle */}
          {mode === 'supervised-classification' && (
            <div className="boundary-slider-wrap">
              <span className="slider-label">Rotate Decision Hyperplane:</span>
              <input
                type="range"
                min="10"
                max="80"
                value={boundaryAngle}
                onChange={(e) => setBoundaryAngle(parseInt(e.target.value))}
                className="sim-slider-input"
              />
              <code>{boundaryAngle}&deg;</code>
            </div>
          )}
        </div>

        {/* Detailed Comparative Breakdown */}
        <div className="paradigm-explanation-panel">
          {mode === 'supervised-regression' && (
            <div className="paradigm-detail-card">
              <div className="detail-tag tag-regression">SUPERVISED REGRESSION</div>
              <h4>Predicting Continuous Quantities (y &isin; &reals;)</h4>
              <p>
                <strong>Goal:</strong> Learn a mapping <code>f: &Chi; &rarr; &reals;</code> that outputs continuous real
                numbers.
              </p>
              <ul className="paradigm-points">
                <li>
                  <strong>Target Output:</strong> Continuous interval (e.g. predicting GATE DA score 0–100, house
                  prices, CPU run-time).
                </li>
                <li>
                  <strong>Loss Function:</strong> Mean Squared Error <code>MSE = (1/n)&sum;(y_i - y&#770;_i)&sup2;</code> or
                  Mean Absolute Error (MAE).
                </li>
                <li>
                  <strong>Evaluation:</strong> R&sup2; Score, Root Mean Squared Error (RMSE), Mean Absolute Percentage
                  Error (MAPE).
                </li>
                <li>
                  <strong>GATE Example:</strong> Given hours of study (x), predict exam marks (y).
                </li>
              </ul>
            </div>
          )}

          {mode === 'supervised-classification' && (
            <div className="paradigm-detail-card">
              <div className="detail-tag tag-classification">SUPERVISED CLASSIFICATION</div>
              <h4>Predicting Discrete Class Categories (y &isin; &#123;C&#8321;, C&#8322;, ...&#125;)</h4>
              <p>
                <strong>Goal:</strong> Learn a decision boundary hyperplane <code>w&#7510;x + b = 0</code> separating
                discrete classes.
              </p>
              <ul className="paradigm-points">
                <li>
                  <strong>Target Output:</strong> Categorical labels (e.g. Qualified vs Not Qualified &#123;0, 1&#125;,
                  Spam vs Ham, Multi-class digit 0–9).
                </li>
                <li>
                  <strong>Loss Function:</strong> Binary Cross-Entropy / Log Loss{' '}
                  <code>L = -[y log(&sigma;) + (1-y) log(1-&sigma;)]</code>.
                </li>
                <li>
                  <strong>Evaluation:</strong> Accuracy, Precision, Recall, F1-Score, Confusion Matrix, ROC-AUC.
                </li>
                <li>
                  <strong>GATE Example:</strong> Given Mock test score and accuracy, predict whether the student
                  qualifies for IIT Madras DA (Yes / No).
                </li>
              </ul>
            </div>
          )}

          {mode === 'unsupervised-clustering' && (
            <div className="paradigm-detail-card">
              <div className="detail-tag tag-clustering">UNSUPERVISED LEARNING</div>
              <h4>Discovering Inherent Data Structure (No Labels y)</h4>
              <p>
                <strong>Goal:</strong> Discover natural groupings, manifold geometry, or probability density from
                unlabelled data <code>&#123;x_i&#125;</code>.
              </p>
              <ul className="paradigm-points">
                <li>
                  <strong>No Target Label:</strong> The dataset has only features <code>X</code>; there are no ground
                  truth answers <code>y</code> provided.
                </li>
                <li>
                  <strong>Objective:</strong> Minimize within-cluster variance (Inertia):{' '}
                  <code>J = &sum; &sum; ||x_i - &mu;_k||&sup2;</code>.
                </li>
                <li>
                  <strong>Algorithms in GATE DA:</strong> k-Means, k-Medoids, Hierarchical Clustering (Single/Multiple
                  linkage), PCA.
                </li>
                <li>
                  <strong>GATE Example:</strong> Grouping 10,000 GATE applicants into distinct skill profiles based on
                  answering speed and topic confidence without prior labels.
                </li>
              </ul>
            </div>
          )}

          {/* Quick Comparison Matrix Table */}
          <div className="mini-comparison-table-wrap">
            <table className="mini-comparison-table">
              <thead>
                <tr>
                  <th>Criteria</th>
                  <th>Supervised</th>
                  <th>Unsupervised</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Data Input</strong></td>
                  <td>Features + Labels &#123;(x<sub>i</sub>, y<sub>i</sub>)&#125;</td>
                  <td>Features Only &#123;x<sub>i</sub>&#125;</td>
                </tr>
                <tr>
                  <td><strong>Feedback Loop</strong></td>
                  <td>Direct error comparison (y - y&#770;)</td>
                  <td>No explicit error signal (Density / Distance)</td>
                </tr>
                <tr>
                  <td><strong>Core Tasks</strong></td>
                  <td>Regression &amp; Classification</td>
                  <td>Clustering &amp; Dimensionality Reduction</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
