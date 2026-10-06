'use client';

import React, { useState, useMemo } from 'react';
import {
  MATRIX_TYPES,
  MATRIX_FORMULAS,
  DATA_SCIENCE_APPLICATIONS,
  MATRICES_MASTER_NOTES_MD,
  MatrixTypeItem,
  MatrixFormulaItem
} from '@/study-modules/topics/linear-algebra/matrices/matricesNotes';

export interface MatricesNotesStudySheetProps {
  themeMode?: 'cream-black' | 'all-black' | 'cream-white';
}

export default function MatricesNotesStudySheet({
  themeMode = 'cream-black'
}: MatricesNotesStudySheetProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedFullNotes, setCopiedFullNotes] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDsApp, setActiveDsApp] = useState<string>(DATA_SCIENCE_APPLICATIONS[0].id);

  const categories = ['All', 'Dimensional', 'Symmetry & Transpose', 'Algebraic & Powers', 'Triangular', 'Invertibility'];

  const filteredTypes = useMemo(() => {
    return MATRIX_TYPES.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.mathCondition.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCopyFullNotes = () => {
    navigator.clipboard.writeText(MATRICES_MASTER_NOTES_MD);
    setCopiedFullNotes(true);
    setTimeout(() => setCopiedFullNotes(false), 2200);
  };

  return (
    <div className="formula-sheet-container matrices-notes-sheet">
      {/* Top Banner */}
      <div className="formula-sheet-header">
        <div className="formula-header-tag">GATE DA 2027 • LINEAR ALGEBRA MASTER THEORY</div>
        <h3 className="formula-sheet-title">Types of Matrices, Formulas & Data Science Applications</h3>
        <p className="formula-sheet-sub">
          Comprehensive study notes covering all 18 matrix classifications, determinant cofactor expansion,
          adjoint & inverse formulas, rank theorems, and real-world machine learning vectorization.
        </p>

        <div className="matrices-sheet-action-bar">
          <button
            type="button"
            className="copy-all-notes-btn"
            onClick={handleCopyFullNotes}
            title="Copy all notes formatted as GitHub Markdown"
          >
            {copiedFullNotes ? '✓ Full Notes Copied to Clipboard!' : '📋 Copy Full Notes as Markdown'}
          </button>
          <a
            href="https://www.geeksforgeeks.org/maths/practice-questions-on-matrices/"
            target="_blank"
            rel="noopener noreferrer"
            className="gfg-practice-btn"
          >
            Practice: GFG Solved Examples ↗
          </a>
        </div>
      </div>

      {/* PART 1: CLASSIFICATION & TYPES OF MATRICES */}
      <div className="formula-card-section">
        <div className="section-badge-bar">
          <span className="sec-pill sec-pill-purple">PART 1: TYPES OF MATRICES</span>
          <span className="sec-sub-label">18 Foundational Classifications with GATE Traps</span>
        </div>

        {/* Filter Toolbar */}
        <div className="matrix-types-toolbar">
          <div className="category-pills-row">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="types-search-box">
            <input
              type="text"
              placeholder="Search matrix type (e.g. Skew-Symmetric, Idempotent)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="types-search-clear" onClick={() => setSearchQuery('')}>
                ×
              </button>
            )}
          </div>
        </div>

        {/* Matrix Types Grid */}
        <div className="formula-grid-2col matrix-types-grid">
          {filteredTypes.map((item: MatrixTypeItem) => (
            <div key={item.id} className="formula-item-card matrix-type-card">
              <div className="formula-item-header">
                <div className="matrix-type-title-wrap">
                  <span className="matrix-category-badge">{item.category}</span>
                  <h4>
                    <a
                      href={item.gfgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="matrix-gfg-link"
                      title="Read complete theory on GeeksforGeeks"
                    >
                      {item.name} ↗
                    </a>
                  </h4>
                </div>
                <button
                  type="button"
                  className="copy-formula-btn"
                  onClick={() => handleCopy(`${item.name}: ${item.mathCondition}\n${item.definition}`, item.id)}
                >
                  {copiedId === item.id ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>

              <p className="matrix-type-def">{item.definition}</p>

              <div className="math-display-box">
                <div className="math-row">
                  <span className="math-label">Condition:</span>
                  <code className="condition-code">{item.mathCondition}</code>
                </div>
                <div className="math-row">
                  <span className="math-label">Format:</span>
                  <code className="example-code">{item.latexExample}</code>
                </div>
              </div>

              {item.gateTrap && (
                <div className="formula-notes matrix-trap-callout">
                  <span className="trap-icon">⚡</span>
                  <p>
                    <strong>GATE Note:</strong> {item.gateTrap}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTypes.length === 0 && (
          <div className="no-types-found">
            <p>No matrix types found matching &quot;{searchQuery}&quot;.</p>
            <button type="button" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}>
              Reset Filters
            </button>
          </div>
        )}

        {/* Critical Theorem Callout */}
        <div className="theorem-highlight-banner">
          <div className="theorem-badge">KEY SYMMETRY DECOMPOSITION THEOREM</div>
          <p className="theorem-body">
            Every square matrix $A$ can be <strong>uniquely expressed</strong> as the sum of a symmetric matrix and a skew-symmetric matrix:
          </p>
          <div className="theorem-math">
            <code>A = ½ (A + Aᵀ) + ½ (A - Aᵀ)</code>
          </div>
          <p className="theorem-sub">
            Where <code>½ (A + Aᵀ)</code> is symmetric and <code>½ (A - Aᵀ)</code> is skew-symmetric with zero main diagonal.
          </p>
        </div>
      </div>

      {/* PART 2: DETERMINANT, MINOR, COFACTOR, ADJOINT & INVERSE */}
      <div className="formula-card-section">
        <div className="section-badge-bar">
          <span className="sec-pill sec-pill-blue">PART 2: OPERATIONAL FOUNDATIONS</span>
          <span className="sec-sub-label">Determinant, Minor, Cofactor, Adjoint &amp; Inversion</span>
        </div>

        <div className="formula-grid-2col">
          {/* Card 1: Determinants */}
          <div className="formula-item-card">
            <div className="formula-item-header">
              <h4>1. Determinant of a Matrix (|A| or det(A))</h4>
              <button
                type="button"
                className="copy-formula-btn"
                onClick={() =>
                  handleCopy(
                    '2x2: |A| = ad - bc\n3x3: |A| = a(ei-fh) - b(di-fg) + c(dh-eg)',
                    'det-def'
                  )
                }
              >
                {copiedId === 'det-def' ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
            <p className="matrix-type-def">
              A scalar value defined only for square matrices, calculated via cofactor expansion along any row or column.
            </p>
            <div className="math-display-box">
              <div className="math-row">
                <span className="math-label">2×2 Matrix:</span>
                <code>|A| = ad - bc</code>
              </div>
              <div className="math-row">
                <span className="math-label">3×3 Matrix:</span>
                <code>|A| = a(ei - fh) - b(di - fg) + c(dh - eg)</code>
              </div>
            </div>
            <div className="formula-notes">
              <p>
                <strong>Properties:</strong> det(AB) = det(A)·det(B), det(Aᵀ) = det(A), det(kA) = kⁿ·det(A) for n×n matrix.
                If any two rows are proportional or identical, det(A) = 0.
              </p>
            </div>
          </div>

          {/* Card 2: Minor & Cofactor */}
          <div className="formula-item-card">
            <div className="formula-item-header">
              <h4>2. Minor (Mᵢⱼ) and Cofactor (Cᵢⱼ)</h4>
              <button
                type="button"
                className="copy-formula-btn"
                onClick={() => handleCopy('C_ij = (-1)^(i+j) * M_ij', 'minor-cofactor')}
              >
                {copiedId === 'minor-cofactor' ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
            <p className="matrix-type-def">
              The minor Mᵢⱼ is the determinant obtained by deleting row i and column j. The cofactor attaches the alternating checkerboard sign (-1)^(i+j).
            </p>
            <div className="math-display-box">
              <div className="math-row">
                <span className="math-label">Minor:</span>
                <code>M₁₁ = det(submatrix without row 1 &amp; col 1)</code>
              </div>
              <div className="math-row">
                <span className="math-label">Cofactor:</span>
                <code>Cᵢⱼ = (-1)ⁱ⁺ʲ · Mᵢⱼ</code>
              </div>
            </div>
            <div className="formula-notes">
              <p>
                <strong>Cofactor Matrix:</strong> C = [C₁₁ C₁₂ C₁₃; C₂₁ C₂₂ C₂₃; C₃₁ C₃₂ C₃₃].
                Expansion along row i: |A| = ∑ⱼ aᵢⱼ Cᵢⱼ.
              </p>
            </div>
          </div>

          {/* Card 3: Adjoint of Matrix */}
          <div className="formula-item-card">
            <div className="formula-item-header">
              <h4>3. Adjoint of a Matrix (adj(A))</h4>
              <button
                type="button"
                className="copy-formula-btn"
                onClick={() => handleCopy('adj(A) = C^T (Transpose of Cofactor Matrix)', 'adj-def')}
              >
                {copiedId === 'adj-def' ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
            <p className="matrix-type-def">
              The adjoint is the transpose of the cofactor matrix: <strong>adj(A) = Cᵀ</strong>.
            </p>
            <div className="math-display-box">
              <div className="math-row">
                <span className="math-label">Formula:</span>
                <code>adj(A) = [Cᵢⱼ]ᵀ</code>
              </div>
              <div className="math-row">
                <span className="math-label">2×2 Shortcut:</span>
                <code>Swap diagonal elements; negate off-diagonal elements!</code>
              </div>
            </div>
            <div className="formula-notes">
              <p>
                For A = [a b; c d], adj(A) = [d -b; -c a]. Extremely fast for 2×2 GATE problems.
              </p>
            </div>
          </div>

          {/* Card 4: Inverse & Invertibility */}
          <div className="formula-item-card">
            <div className="formula-item-header">
              <h4>4. Inverse of a Matrix (A⁻¹)</h4>
              <button
                type="button"
                className="copy-formula-btn"
                onClick={() => handleCopy('A^-1 = (1 / |A|) * adj(A), where |A| != 0', 'inv-card')}
              >
                {copiedId === 'inv-card' ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
            <p className="matrix-type-def">
              The unique matrix satisfying A · A⁻¹ = A⁻¹ · A = Iₙ. Exists if and only if |A| ≠ 0 (non-singular).
            </p>
            <div className="math-display-box">
              <div className="math-row">
                <span className="math-label">Formula:</span>
                <code>A⁻¹ = adj(A) / |A| = (1 / |A|) · adj(A)</code>
              </div>
              <div className="math-row">
                <span className="math-label">Condition:</span>
                <code>|A| ≠ 0  (Non-singular)</code>
              </div>
            </div>
            <div className="formula-notes">
              <p>
                <strong>Uniqueness:</strong> Inverse is always unique. (A⁻¹)⁻¹ = A. (Aᵀ)⁻¹ = (A⁻¹)ᵀ.
              </p>
            </div>
          </div>
        </div>

        {/* Row Operations & Rank Banner */}
        <div className="row-ops-rank-card">
          <div className="row-ops-col">
            <h5>Elementary Row &amp; Column Operations</h5>
            <ul className="ops-list">
              <li>
                <strong>1. Interchanging two rows/columns:</strong> Rᵢ ↔ Rⱼ (Multiplies det by -1).
              </li>
              <li>
                <strong>2. Multiplying a row/column by scalar k ≠ 0:</strong> Rᵢ → k Rᵢ (Multiplies det by k).
              </li>
              <li>
                <strong>3. Adding a multiple of another row:</strong> Rᵢ → Rᵢ + k Rⱼ (Leaves det <strong>unchanged</strong>).
              </li>
            </ul>
          </div>
          <div className="rank-col">
            <h5>Rank of a Matrix ρ(A)</h5>
            <p>
              Maximum number of linearly independent rows or columns in A:
            </p>
            <div className="rank-chips">
              <span className="rank-chip">ρ(A) ≤ min(m, n)</span>
              <span className="rank-chip">ρ(O) = 0</span>
              <span className="rank-chip">Full Rank ⟺ |A| ≠ 0</span>
              <span className="rank-chip">Rank(A) + Nullity(A) = n</span>
            </div>
          </div>
        </div>
      </div>

      {/* PART 3: HIGH-YIELD GATE ADJOINT & INVERSE FORMULAS */}
      <div className="formula-card-section">
        <div className="section-badge-bar">
          <span className="sec-pill sec-pill-green">PART 3: HIGH-YIELD GATE FORMULAS</span>
          <span className="sec-sub-label">Direct Exam Score Multipliers (Order n Square Matrix)</span>
        </div>

        <div className="gate-formulas-table-wrap">
          <table className="gate-formulas-table">
            <thead>
              <tr>
                <th>Property / Theorem</th>
                <th>Exact Mathematical Formula</th>
                <th>GATE DA Pitfall &amp; Exam Rule</th>
                <th style={{ width: '80px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {MATRIX_FORMULAS.map((f: MatrixFormulaItem) => (
                <tr key={f.id}>
                  <td className="formula-name-cell">
                    <strong>{f.title}</strong>
                    <span className="formula-cat-tag">{f.category}</span>
                  </td>
                  <td className="formula-code-cell">
                    <code>{f.formula}</code>
                  </td>
                  <td className="formula-trap-cell">
                    <span className="trap-pill">⚡</span> {f.gateTrap}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="table-copy-btn"
                      onClick={() => handleCopy(`${f.title}: ${f.formula}`, f.id)}
                    >
                      {copiedId === f.id ? '✓' : 'Copy'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PART 4: WHY MATRICES MATTER IN DATA SCIENCE */}
      <div className="formula-card-section">
        <div className="section-badge-bar">
          <span className="sec-pill sec-pill-orange">PART 4: DATA SCIENCE APPLICATIONS</span>
          <span className="sec-sub-label">Real-World Machine Learning, Computer Vision &amp; NLP</span>
        </div>

        <div className="ds-apps-container">
          {/* App Switcher Tabs */}
          <div className="ds-apps-nav">
            {DATA_SCIENCE_APPLICATIONS.map((app) => (
              <button
                key={app.id}
                type="button"
                className={`ds-nav-btn ${activeDsApp === app.id ? 'active' : ''}`}
                onClick={() => setActiveDsApp(app.id)}
              >
                {app.title.split('.')[1] || app.title}
              </button>
            ))}
          </div>

          {/* Active App View */}
          {(() => {
            const app = DATA_SCIENCE_APPLICATIONS.find((a) => a.id === activeDsApp) || DATA_SCIENCE_APPLICATIONS[0];
            return (
              <div className="ds-app-content-card">
                <div className="ds-app-header">
                  <h4>{app.title}</h4>
                  <code className="ds-math-tag">{app.mathNotation}</code>
                </div>

                <p className="ds-app-desc">{app.description}</p>

                <div className="ds-code-box">
                  <div className="ds-code-header">
                    <span>Python / NumPy Vectorized Implementation</span>
                    <button
                      type="button"
                      className="copy-formula-btn"
                      onClick={() => handleCopy(app.exampleSnippet, `code-${app.id}`)}
                    >
                      {copiedId === `code-${app.id}` ? '✓ Copied' : '📋 Copy Code'}
                    </button>
                  </div>
                  <pre>
                    <code>{app.exampleSnippet}</code>
                  </pre>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* PART 5: SOLVED EXAMPLES & EXTERNAL PRACTICE */}
      <div className="formula-card-section">
        <div className="section-badge-bar">
          <span className="sec-pill sec-pill-purple">PART 5: SOLVED PRACTICE &amp; REVISION</span>
          <span className="sec-sub-label">Official GeeksforGeeks Topic Practice</span>
        </div>

        <div className="gfg-solved-hub-card">
          <div className="hub-card-left">
            <span className="hub-badge">PRACTICE HUB</span>
            <h4>Solved Questions on Matrices (GeeksforGeeks)</h4>
            <p>
              Reinforce your knowledge with comprehensive step-by-step solved problems covering matrix multiplication,
              determinant evaluations, inverses, adjoint calculations, and rank determination.
            </p>
          </div>
          <div className="hub-card-right">
            <a
              href="https://www.geeksforgeeks.org/maths/practice-questions-on-matrices/"
              target="_blank"
              rel="noopener noreferrer"
              className="hub-launch-btn"
            >
              Open Solved Examples ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
