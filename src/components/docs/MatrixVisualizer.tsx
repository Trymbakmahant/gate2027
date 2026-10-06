'use client';

import React, { useState, useMemo } from 'react';
import { AppThemeMode } from '@/study-modules/types';

interface MatrixVisualizerProps {
  themeMode?: AppThemeMode;
}

export default function MatrixVisualizer({ themeMode }: MatrixVisualizerProps) {
  // Preset matrices
  const PRESETS = {
    standard: [
      [2, 3],
      [1, 4],
    ],
    symmetric: [
      [3, 5],
      [5, 2],
    ],
    skewSymmetric: [
      [0, -4],
      [4, 0],
    ],
    orthogonal: [
      [0, -1],
      [1, 0],
    ],
    diagonal: [
      [4, 0],
      [0, 7],
    ],
  };

  // Matrix A (2x2)
  const [matrixA, setMatrixA] = useState<number[][]>(PRESETS.standard);
  // Matrix B (2x2)
  const [matrixB, setMatrixB] = useState<number[][]>([
    [1, 2],
    [3, 1],
  ]);

  const [activeTab, setActiveTab] = useState<'properties' | 'multiplication' | 'reversalLaw'>('properties');

  // Transpose of A
  const transposeA = useMemo(() => {
    return [
      [matrixA[0][0], matrixA[1][0]],
      [matrixA[0][1], matrixA[1][1]],
    ];
  }, [matrixA]);

  // Transpose of B
  const transposeB = useMemo(() => {
    return [
      [matrixB[0][0], matrixB[1][0]],
      [matrixB[0][1], matrixB[1][1]],
    ];
  }, [matrixB]);

  // Trace of A
  const traceA = matrixA[0][0] + matrixA[1][1];

  // Determinant of A
  const detA = matrixA[0][0] * matrixA[1][1] - matrixA[0][1] * matrixA[1][0];

  // Matrix multiplication AB
  const matrixAB = useMemo(() => {
    return [
      [
        matrixA[0][0] * matrixB[0][0] + matrixA[0][1] * matrixB[1][0],
        matrixA[0][0] * matrixB[0][1] + matrixA[0][1] * matrixB[1][1],
      ],
      [
        matrixA[1][0] * matrixB[0][0] + matrixA[1][1] * matrixB[1][0],
        matrixA[1][0] * matrixB[0][1] + matrixA[1][1] * matrixB[1][1],
      ],
    ];
  }, [matrixA, matrixB]);

  // Matrix multiplication BA
  const matrixBA = useMemo(() => {
    return [
      [
        matrixB[0][0] * matrixA[0][0] + matrixB[0][1] * matrixA[1][0],
        matrixB[0][0] * matrixA[0][1] + matrixB[0][1] * matrixA[1][1],
      ],
      [
        matrixB[1][0] * matrixA[0][0] + matrixB[1][1] * matrixA[1][0],
        matrixB[1][0] * matrixA[0][1] + matrixB[1][1] * matrixA[1][1],
      ],
    ];
  }, [matrixA, matrixB]);

  // (AB)^T
  const transposeAB = useMemo(() => {
    return [
      [matrixAB[0][0], matrixAB[1][0]],
      [matrixAB[0][1], matrixAB[1][1]],
    ];
  }, [matrixAB]);

  // B^T * A^T
  const productBtAt = useMemo(() => {
    return [
      [
        transposeB[0][0] * transposeA[0][0] + transposeB[0][1] * transposeA[1][0],
        transposeB[0][0] * transposeA[0][1] + transposeB[0][1] * transposeA[1][1],
      ],
      [
        transposeB[1][0] * transposeA[0][0] + transposeB[1][1] * transposeA[1][0],
        transposeB[1][0] * transposeA[0][1] + transposeB[1][1] * transposeA[1][1],
      ],
    ];
  }, [transposeA, transposeB]);

  // Symmetry checks
  const isSymmetric = matrixA[0][1] === matrixA[1][0];
  const isSkewSymmetric =
    matrixA[0][0] === 0 &&
    matrixA[1][1] === 0 &&
    matrixA[0][1] === -matrixA[1][0];

  // Orthogonal check: A^T * A == I
  const atA = useMemo(() => {
    return [
      [
        transposeA[0][0] * matrixA[0][0] + transposeA[0][1] * matrixA[1][0],
        transposeA[0][0] * matrixA[0][1] + transposeA[0][1] * matrixA[1][1],
      ],
      [
        transposeA[1][0] * matrixA[0][0] + transposeA[1][1] * matrixA[1][0],
        transposeA[1][0] * matrixA[0][1] + transposeA[1][1] * matrixA[1][1],
      ],
    ];
  }, [matrixA, transposeA]);

  const isOrthogonal =
    Math.abs(atA[0][0] - 1) < 1e-4 &&
    Math.abs(atA[1][1] - 1) < 1e-4 &&
    Math.abs(atA[0][1]) < 1e-4 &&
    Math.abs(atA[1][0]) < 1e-4;

  const isCommutative =
    matrixAB[0][0] === matrixBA[0][0] &&
    matrixAB[0][1] === matrixBA[0][1] &&
    matrixAB[1][0] === matrixBA[1][0] &&
    matrixAB[1][1] === matrixBA[1][1];

  const handleCellChangeA = (row: number, col: number, val: string) => {
    const num = parseFloat(val) || 0;
    const next = [...matrixA.map((r) => [...r])];
    next[row][col] = num;
    setMatrixA(next);
  };

  const handleCellChangeB = (row: number, col: number, val: string) => {
    const num = parseFloat(val) || 0;
    const next = [...matrixB.map((r) => [...r])];
    next[row][col] = num;
    setMatrixB(next);
  };

  return (
    <div className="matrix-lab-shell">
      {/* External Revision Anchor Banner */}
      <div className="matrix-gfg-banner">
        <div className="gfg-banner-left">
          <span className="gfg-pill">📖 GeeksforGeeks Revision Link</span>
          <h4>Linear Algebra & Matrices Master Notes</h4>
          <p>
            Official recommended revision guide for definitions, order, matrix types, transpose rules &amp; properties.
          </p>
        </div>
        <a
          href="https://www.geeksforgeeks.org/maths/introduction-to-matrices/"
          target="_blank"
          rel="noopener noreferrer"
          className="gfg-external-btn"
        >
          <span>Open GeeksforGeeks Guide</span>
          <span className="gfg-arrow">↗</span>
        </a>
      </div>

      {/* Lab Nav Tabs */}
      <div className="matrix-lab-nav">
        <button
          type="button"
          className={`matrix-tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          <span>📐 Matrix A &amp; Transpose Properties</span>
        </button>
        <button
          type="button"
          className={`matrix-tab-btn ${activeTab === 'multiplication' ? 'active' : ''}`}
          onClick={() => setActiveTab('multiplication')}
        >
          <span>✖️ Matrix Multiplication (AB vs BA)</span>
        </button>
        <button
          type="button"
          className={`matrix-tab-btn ${activeTab === 'reversalLaw' ? 'active' : ''}`}
          onClick={() => setActiveTab('reversalLaw')}
        >
          <span>🔄 Transpose Reversal Law: (AB)ᵀ = Bᵀ Aᵀ</span>
        </button>
      </div>

      {/* Preset selector */}
      <div className="matrix-presets-row">
        <span className="preset-label">Quick Matrix Presets:</span>
        <button
          type="button"
          className="preset-btn"
          onClick={() => setMatrixA(PRESETS.standard)}
        >
          Standard
        </button>
        <button
          type="button"
          className="preset-btn"
          onClick={() => setMatrixA(PRESETS.symmetric)}
        >
          Symmetric (Aᵀ = A)
        </button>
        <button
          type="button"
          className="preset-btn"
          onClick={() => setMatrixA(PRESETS.skewSymmetric)}
        >
          Skew-Symmetric (Aᵀ = -A)
        </button>
        <button
          type="button"
          className="preset-btn"
          onClick={() => setMatrixA(PRESETS.orthogonal)}
        >
          Orthogonal (Aᵀ A = I)
        </button>
        <button
          type="button"
          className="preset-btn"
          onClick={() => setMatrixA(PRESETS.diagonal)}
        >
          Diagonal
        </button>
      </div>

      {/* Main Interactive Grid */}
      <div className="matrix-workspace-grid">
        {/* TAB 1: PROPERTIES */}
        {activeTab === 'properties' && (
          <div className="matrix-section-split">
            {/* Input Matrix A */}
            <div className="matrix-card">
              <div className="matrix-card-header">
                <h3>Matrix A (2 × 2)</h3>
                <span className="editable-hint">Edit values directly</span>
              </div>
              <div className="matrix-grid-2x2 bracketed">
                <div className="matrix-bracket left"></div>
                <div className="matrix-inputs-container">
                  <div className="matrix-row">
                    <input
                      type="number"
                      value={matrixA[0][0]}
                      onChange={(e) => handleCellChangeA(0, 0, e.target.value)}
                      className="matrix-num-input"
                    />
                    <input
                      type="number"
                      value={matrixA[0][1]}
                      onChange={(e) => handleCellChangeA(0, 1, e.target.value)}
                      className="matrix-num-input"
                    />
                  </div>
                  <div className="matrix-row">
                    <input
                      type="number"
                      value={matrixA[1][0]}
                      onChange={(e) => handleCellChangeA(1, 0, e.target.value)}
                      className="matrix-num-input"
                    />
                    <input
                      type="number"
                      value={matrixA[1][1]}
                      onChange={(e) => handleCellChangeA(1, 1, e.target.value)}
                      className="matrix-num-input"
                    />
                  </div>
                </div>
                <div className="matrix-bracket right"></div>
              </div>

              {/* Real-time Math Invariants */}
              <div className="matrix-metrics-box">
                <div className="metric-row">
                  <span>Trace tr(A) = a₁₁ + a₂₂:</span>
                  <strong>{traceA}</strong>
                </div>
                <div className="metric-row">
                  <span>Determinant det(A) = a₁₁a₂₂ - a₁₂a₂₁:</span>
                  <strong>{detA}</strong>
                </div>
              </div>
            </div>

            {/* Computed Transpose A^T */}
            <div className="matrix-card">
              <div className="matrix-card-header">
                <h3>Transpose Aᵀ (Rows ↔ Columns)</h3>
                <span className="computed-tag">Auto-Calculated</span>
              </div>
              <div className="matrix-grid-2x2 bracketed">
                <div className="matrix-bracket left"></div>
                <div className="matrix-display-container">
                  <div className="matrix-row">
                    <span className="matrix-display-cell">{transposeA[0][0]}</span>
                    <span className="matrix-display-cell highlight">{transposeA[0][1]}</span>
                  </div>
                  <div className="matrix-row">
                    <span className="matrix-display-cell highlight">{transposeA[1][0]}</span>
                    <span className="matrix-display-cell">{transposeA[1][1]}</span>
                  </div>
                </div>
                <div className="matrix-bracket right"></div>
              </div>

              {/* GATE Classification Badges */}
              <div className="classification-chips">
                <div className={`class-chip ${isSymmetric ? 'valid' : 'invalid'}`}>
                  {isSymmetric ? '✓ Symmetric (Aᵀ = A)' : '✗ Not Symmetric (a₁₂ ≠ a₂₁)'}
                </div>
                <div className={`class-chip ${isSkewSymmetric ? 'valid' : 'invalid'}`}>
                  {isSkewSymmetric
                    ? '✓ Skew-Symmetric (Aᵀ = -A, Diag=0)'
                    : '✗ Not Skew-Symmetric'}
                </div>
                <div className={`class-chip ${isOrthogonal ? 'valid' : 'invalid'}`}>
                  {isOrthogonal ? '✓ Orthogonal (Aᵀ A = I)' : '✗ Not Orthogonal'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MULTIPLICATION */}
        {activeTab === 'multiplication' && (
          <div className="multiplication-panel">
            <div className="matrix-duo-inputs">
              {/* Matrix A */}
              <div className="matrix-card mini">
                <h4>Matrix A</h4>
                <div className="matrix-inputs-container mini">
                  <div className="matrix-row">
                    <input
                      type="number"
                      value={matrixA[0][0]}
                      onChange={(e) => handleCellChangeA(0, 0, e.target.value)}
                      className="matrix-num-input"
                    />
                    <input
                      type="number"
                      value={matrixA[0][1]}
                      onChange={(e) => handleCellChangeA(0, 1, e.target.value)}
                      className="matrix-num-input"
                    />
                  </div>
                  <div className="matrix-row">
                    <input
                      type="number"
                      value={matrixA[1][0]}
                      onChange={(e) => handleCellChangeA(1, 0, e.target.value)}
                      className="matrix-num-input"
                    />
                    <input
                      type="number"
                      value={matrixA[1][1]}
                      onChange={(e) => handleCellChangeA(1, 1, e.target.value)}
                      className="matrix-num-input"
                    />
                  </div>
                </div>
              </div>

              <div className="mult-sign">✖️</div>

              {/* Matrix B */}
              <div className="matrix-card mini">
                <h4>Matrix B</h4>
                <div className="matrix-inputs-container mini">
                  <div className="matrix-row">
                    <input
                      type="number"
                      value={matrixB[0][0]}
                      onChange={(e) => handleCellChangeB(0, 0, e.target.value)}
                      className="matrix-num-input"
                    />
                    <input
                      type="number"
                      value={matrixB[0][1]}
                      onChange={(e) => handleCellChangeB(0, 1, e.target.value)}
                      className="matrix-num-input"
                    />
                  </div>
                  <div className="matrix-row">
                    <input
                      type="number"
                      value={matrixB[1][0]}
                      onChange={(e) => handleCellChangeB(1, 0, e.target.value)}
                      className="matrix-num-input"
                    />
                    <input
                      type="number"
                      value={matrixB[1][1]}
                      onChange={(e) => handleCellChangeB(1, 1, e.target.value)}
                      className="matrix-num-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results: AB vs BA */}
            <div className="mult-results-split">
              <div className="result-matrix-box">
                <span className="res-title">Product AB:</span>
                <div className="bracketed-display">
                  <div className="matrix-bracket left"></div>
                  <div>
                    <div className="matrix-row">
                      <span className="matrix-display-cell">{matrixAB[0][0]}</span>
                      <span className="matrix-display-cell">{matrixAB[0][1]}</span>
                    </div>
                    <div className="matrix-row">
                      <span className="matrix-display-cell">{matrixAB[1][0]}</span>
                      <span className="matrix-display-cell">{matrixAB[1][1]}</span>
                    </div>
                  </div>
                  <div className="matrix-bracket right"></div>
                </div>
                <span className="mult-formula-sub">
                  Row 1 × Col 1: {matrixA[0][0]}·{matrixB[0][0]} + {matrixA[0][1]}·{matrixB[1][0]} = {matrixAB[0][0]}
                </span>
              </div>

              <div className="result-matrix-box">
                <span className="res-title">Reverse Product BA:</span>
                <div className="bracketed-display">
                  <div className="matrix-bracket left"></div>
                  <div>
                    <div className="matrix-row">
                      <span className="matrix-display-cell">{matrixBA[0][0]}</span>
                      <span className="matrix-display-cell">{matrixBA[0][1]}</span>
                    </div>
                    <div className="matrix-row">
                      <span className="matrix-display-cell">{matrixBA[1][0]}</span>
                      <span className="matrix-display-cell">{matrixBA[1][1]}</span>
                    </div>
                  </div>
                  <div className="matrix-bracket right"></div>
                </div>
                <span className="mult-formula-sub">
                  Row 1 × Col 1: {matrixB[0][0]}·{matrixA[0][0]} + {matrixB[0][1]}·{matrixA[1][0]} = {matrixBA[0][0]}
                </span>
              </div>
            </div>

            <div className={`gate-trap-alert ${isCommutative ? 'warning' : 'info'}`}>
              <strong>⚠️ Critical GATE DA Fact:</strong>
              {isCommutative ? (
                <span> In this specific case AB = BA, but in general matrix multiplication is NOT commutative!</span>
              ) : (
                <span> AB ≠ BA! Matrix multiplication is non-commutative in general. Notice however that tr(AB) = {matrixAB[0][0] + matrixAB[1][1]} = tr(BA) = {matrixBA[0][0] + matrixBA[1][1]}! The cyclic trace property always holds!</span>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: REVERSAL LAW */}
        {activeTab === 'reversalLaw' && (
          <div className="reversal-law-panel">
            <div className="law-header">
              <h3>The Transpose Reversal Law: (AB)ᵀ = Bᵀ Aᵀ</h3>
              <p>
                In GATE exams, students often make the mistake of writing (AB)ᵀ = Aᵀ Bᵀ. Verify below that (AB)ᵀ matches Bᵀ Aᵀ, not Aᵀ Bᵀ!
              </p>
            </div>

            <div className="reversal-compare-grid">
              <div className="compare-card">
                <span className="compare-tag">LHS: (AB)ᵀ</span>
                <div className="bracketed-display">
                  <div className="matrix-bracket left"></div>
                  <div>
                    <div className="matrix-row">
                      <span className="matrix-display-cell">{transposeAB[0][0]}</span>
                      <span className="matrix-display-cell">{transposeAB[0][1]}</span>
                    </div>
                    <div className="matrix-row">
                      <span className="matrix-display-cell">{transposeAB[1][0]}</span>
                      <span className="matrix-display-cell">{transposeAB[1][1]}</span>
                    </div>
                  </div>
                  <div className="matrix-bracket right"></div>
                </div>
                <span className="compare-label">Transpose of product AB</span>
              </div>

              <div className="equals-sign">=</div>

              <div className="compare-card highlight-match">
                <span className="compare-tag">RHS: Bᵀ Aᵀ</span>
                <div className="bracketed-display">
                  <div className="matrix-bracket left"></div>
                  <div>
                    <div className="matrix-row">
                      <span className="matrix-display-cell">{productBtAt[0][0]}</span>
                      <span className="matrix-display-cell">{productBtAt[0][1]}</span>
                    </div>
                    <div className="matrix-row">
                      <span className="matrix-display-cell">{productBtAt[1][0]}</span>
                      <span className="matrix-display-cell">{productBtAt[1][1]}</span>
                    </div>
                  </div>
                  <div className="matrix-bracket right"></div>
                </div>
                <span className="compare-label">Product of reversed transposes</span>
              </div>
            </div>

            <div className="proof-statement-box">
              <span className="check-icon">✓</span>
              <div>
                <strong>Law Mathematically Verified:</strong>
                <p>
                  [(AB)ᵀ]ᵢⱼ = [AB]ⱼᵢ = ∑ₖ Aⱼₖ Bₖᵢ = ∑ₖ [Bᵀ]ᵢₖ [Aᵀ]ₖⱼ = [Bᵀ Aᵀ]ᵢⱼ.
                  Always reverse the order when taking transposes or inverses of products!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
