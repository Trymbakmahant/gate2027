'use client';

import React, { useState } from 'react';

export interface MLFormulasStudySheetProps {
  themeMode?: 'cream-black' | 'all-black' | 'cream-white';
}

export default function MLFormulasStudySheet({ themeMode = 'cream-black' }: MLFormulasStudySheetProps) {
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const handleCopy = (formulaText: string, id: string) => {
    navigator.clipboard.writeText(formulaText);
    setCopiedFormula(id);
    setTimeout(() => setCopiedFormula(null), 1800);
  };

  return (
    <div className="formula-sheet-container">
      {/* Header Banner */}
      <div className="formula-sheet-header">
        <div className="formula-header-tag">GATE DA 2027 FORMULA &amp; DERIVATION CHEATSHEET</div>
        <h3 className="formula-sheet-title">Supervised, Unsupervised &amp; Single Linear Regression Master Sheet</h3>
        <p className="formula-sheet-sub">
          All high-yield mathematical formulations, closed-form derivations, Gauss-Markov assumptions, and GATE DA
          exam pitfalls in one structured, copyable cheat sheet.
        </p>
      </div>

      {/* SECTION 1: SUPERVISED VS. UNSUPERVISED & CLASSIFICATION VS. REGRESSION */}
      <div className="formula-card-section">
        <div className="section-badge-bar">
          <span className="sec-pill sec-pill-purple">PART 1: LEARNING PARADIGMS</span>
          <span className="sec-sub-label">Mathematical Foundations</span>
        </div>

        <div className="formula-grid-2col">
          {/* Card: Supervised vs Unsupervised */}
          <div className="formula-item-card">
            <div className="formula-item-header">
              <h4>1. Supervised Learning Formulation</h4>
              <button
                type="button"
                className="copy-formula-btn"
                onClick={() =>
                  handleCopy('D = {(x_i, y_i)}_{i=1}^n, x_i in R^d, y_i in Y. min_f E[L(y, f(x))]', 'sup-def')
                }
              >
                {copiedFormula === 'sup-def' ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>

            <div className="math-display-box">
              <code>
                &Dscr; = &#123; (x<sub>i</sub>, y<sub>i</sub>) &#125;<sub>i=1</sub><sup>n</sup>, &nbsp; x<sub>i</sub> &isin;
                &reals;<sup>d</sup>, &nbsp; y<sub>i</sub> &isin; &Yscr;
              </code>
              <div className="math-sub-desc">
                Optimization Objective: <strong>min<sub>f &isin; &Fscr;</sub> &Escr;<sub>(x,y)</sub> [ &Lscr;(y, f(x)) ]</strong>
              </div>
            </div>

            <div className="formula-notes">
              <p>
                <strong>Unsupervised Contrast:</strong> Dataset has NO labels:{' '}
                <code>&Dscr; = &#123; x<sub>i</sub> &#125;<sub>i=1</sub><sup>n</sup></code>. Finds probability density{' '}
                <code>p(x)</code> or groups data into disjoint clusters minimizing inertia:{' '}
                <code>min &sum; ||x<sub>i</sub> - &mu;<sub>c(i)</sub>||&sup2;</code>.
              </p>
            </div>
          </div>

          {/* Card: Classification vs Regression */}
          <div className="formula-item-card">
            <div className="formula-item-header">
              <h4>2. Classification vs. Regression</h4>
              <button
                type="button"
                className="copy-formula-btn"
                onClick={() =>
                  handleCopy(
                    'Regression: y in R, Loss = 1/n sum (y_i - f(x_i))^2\nClassification: y in {0, 1}, Loss = - sum [y log(p) + (1-y) log(1-p)]',
                    'class-reg'
                  )
                }
              >
                {copiedFormula === 'class-reg' ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>

            <div className="math-display-box">
              <div className="math-row">
                <span className="math-label">Regression:</span>
                <code>y &isin; &reals; &nbsp; (Continuous output space)</code>
              </div>
              <div className="math-row">
                <span className="math-label">Classification:</span>
                <code>y &isin; &#123;0, 1&#125; &nbsp; or &nbsp; &#123;C&#8321;, ..., C&#7522;&#125; (Discrete labels)</code>
              </div>
            </div>

            <div className="formula-notes">
              <p>
                <strong>Loss Comparison:</strong> Regression optimizes <strong>MSE / L2 loss</strong> (differentiable, convex) or <strong>MAE / L1 loss</strong> (robust to outliers). Classification optimizes <strong>Cross-Entropy / Log Loss</strong> or Hinge Loss.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SINGLE LINEAR REGRESSION COMPLETE FORMULATION */}
      <div className="formula-card-section">
        <div className="section-badge-bar">
          <span className="sec-pill sec-pill-emerald">PART 2: SINGLE (SIMPLE) LINEAR REGRESSION</span>
          <span className="sec-sub-label">Ordinary Least Squares (OLS) &amp; Derivations</span>
        </div>

        {/* 1. Model & Hypothesis */}
        <div className="formula-full-card">
          <div className="formula-item-header">
            <h4>1. Population Model vs. Estimated Sample Regression Equation</h4>
            <button
              type="button"
              className="copy-formula-btn"
              onClick={() => handleCopy('Population: y = beta_0 + beta_1 * x + epsilon\nEstimated: y_hat = b_0 + b_1 * x', 'model-eq')}
            >
              {copiedFormula === 'model-eq' ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>

          <div className="math-equation-row">
            <div className="equation-block">
              <span className="eq-tag">Population Model (True DGP)</span>
              <div className="eq-math">y = &beta;&#8320; + &beta;&#8321;x + &epsilon;, &emsp; &epsilon; ~ i.i.d. &Nscr;(0, &sigma;&sup2;)</div>
            </div>
            <div className="equation-block">
              <span className="eq-tag">Sample Fitted Equation</span>
              <div className="eq-math">y&#770; = &beta;&#770;&#8320; + &beta;&#770;&#8321;x &emsp; (or &nbsp; y&#770; = wx + b)</div>
            </div>
          </div>

          <div className="formula-explanation">
            <p>
              Where <strong>&beta;&#8321; (slope w)</strong> represents the marginal change in <code>y</code> for a 1-unit increase in <code>x</code>: &part;E[y|x]/&part;x = &beta;&#8321;. <strong>&beta;&#8320; (intercept b)</strong> represents the expected value of <code>y</code> when <code>x = 0</code>. Residual error is defined as <strong>e<sub>i</sub> = y<sub>i</sub> - y&#770;<sub>i</sub></strong>.
            </p>
          </div>
        </div>

        {/* 2. OLS Cost Function & Closed-Form Formulas */}
        <div className="formula-full-card">
          <div className="formula-item-header">
            <h4>2. Ordinary Least Squares (OLS) Closed-Form Formulas</h4>
            <button
              type="button"
              className="copy-formula-btn"
              onClick={() =>
                handleCopy(
                  'beta_1 = Cov(X,Y)/Var(X) = sum((x_i - x_bar)(y_i - y_bar)) / sum((x_i - x_bar)^2) = r_xy * (s_y / s_x)\nbeta_0 = y_bar - beta_1 * x_bar',
                  'ols-formulas'
                )
              }
            >
              {copiedFormula === 'ols-formulas' ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>

          {/* OLS Cost Function */}
          <div className="math-formula-banner">
            <div className="banner-kicker">OLS OBJECTIVE FUNCTION: MINIMIZE RESIDUAL SUM OF SQUARES (RSS)</div>
            <div className="big-formula">
              J(&beta;&#8320;, &beta;&#8321;) = &frac12; &sum;<sub>i=1</sub><sup>n</sup> e<sub>i</sub>&sup2; = &frac12; &sum;<sub>i=1</sub><sup>n</sup> [ y<sub>i</sub> - (&beta;&#8320; + &beta;&#8321;x<sub>i</sub>) ]&sup2;
            </div>
          </div>

          {/* Closed Form Results */}
          <div className="math-equation-row">
            <div className="equation-block featured">
              <span className="eq-tag">Optimal Slope &beta;&#770;&#8321; (w*)</span>
              <div className="eq-math highlight">
                &beta;&#770;&#8321; = [ &sum;(x<sub>i</sub> - x&#772;)(y<sub>i</sub> - y&#772;) ] / [ &sum;(x<sub>i</sub> - x&#772;)&sup2; ] = Cov(X, Y) / Var(X) = r<sub>xy</sub> &middot; (s<sub>y</sub> / s<sub>x</sub>)
              </div>
              <span className="eq-subtext">r<sub>xy</sub> = Pearson correlation coefficient, s<sub>x</sub>, s<sub>y</sub> = sample std deviations</span>
            </div>

            <div className="equation-block featured">
              <span className="eq-tag">Optimal Intercept &beta;&#770;&#8320; (b*)</span>
              <div className="eq-math highlight">
                &beta;&#770;&#8320; = y&#772; - &beta;&#770;&#8321;x&#772;
              </div>
              <span className="eq-subtext">Direct consequence: Line always passes through centroid (x&#772;, y&#772;)!</span>
            </div>
          </div>
        </div>

        {/* 3. Five Critical OLS Properties & GATE DA Exam Traps */}
        <div className="formula-full-card">
          <div className="formula-item-header">
            <h4>3. Critical Properties of the OLS Line (Direct GATE DA Questions)</h4>
          </div>

          <div className="exam-traps-grid">
            <div className="trap-card">
              <div className="trap-num">1</div>
              <div className="trap-content">
                <strong>Centroid Invariance:</strong>
                <p>The fitted regression line <strong>ALWAYS passes through the point of sample means (x&#772;, y&#772;)</strong>. Substitute x = x&#772;: y&#770; = &beta;&#8320; + &beta;&#8321;x&#772; = (y&#772; - &beta;&#8321;x&#772;) + &beta;&#8321;x&#772; = y&#772;.</p>
              </div>
            </div>

            <div className="trap-card">
              <div className="trap-num">2</div>
              <div className="trap-content">
                <strong>Sum of Residuals is ZERO:</strong>
                <p>When the model has an intercept &beta;&#8320;, <code>&sum;<sub>i=1</sub><sup>n</sup> e<sub>i</sub> = &sum; (y<sub>i</sub> - y&#770;<sub>i</sub>) &equiv; 0</code>. The mean of residuals is always exactly zero.</p>
              </div>
            </div>

            <div className="trap-card">
              <div className="trap-num">3</div>
              <div className="trap-content">
                <strong>Orthogonality of Residuals:</strong>
                <p>Residuals are completely uncorrelated with the input predictor: <code>&sum; x<sub>i</sub> e<sub>i</sub> = 0</code>, and with fitted values: <code>&sum; y&#770;<sub>i</sub> e<sub>i</sub> = 0</code>.</p>
              </div>
            </div>

            <div className="trap-card">
              <div className="trap-num">4</div>
              <div className="trap-content">
                <strong>Standardized Variables Case (z-scores):</strong>
                <p>If x and y are normalized to zero mean and unit variance, then: <strong>&beta;&#770;&#8321; = r<sub>xy</sub></strong> and <strong>&beta;&#770;&#8320; = 0</strong>.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. ANOVA Decomposition & R^2 Score */}
        <div className="formula-full-card">
          <div className="formula-item-header">
            <h4>4. Total Sum of Squares Decomposition &amp; Coefficient of Determination (R&sup2;)</h4>
            <button
              type="button"
              className="copy-formula-btn"
              onClick={() => handleCopy('SST = SSR + SSE\nR^2 = SSR / SST = 1 - (SSE / SST) = r_xy^2', 'r2-formula')}
            >
              {copiedFormula === 'r2-formula' ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>

          <div className="math-display-box">
            <div className="big-formula">
              SST = SSR + SSE &emsp;&rArr;&emsp; &sum; (y<sub>i</sub> - y&#772;)&sup2; = &sum; (y&#770;<sub>i</sub> - y&#772;)&sup2; + &sum; (y<sub>i</sub> - y&#770;<sub>i</sub>)&sup2;
            </div>
            <div className="anova-definition-row">
              <div className="anova-item">
                <strong>SST (Total Sum of Squares):</strong> Total variance in y around the mean.
              </div>
              <div className="anova-item">
                <strong>SSR (Regression Sum of Squares):</strong> Variance explained by the model line.
              </div>
              <div className="anova-item">
                <strong>SSE (Error / Residual Sum of Squares):</strong> Unexplained noise/residuals.
              </div>
            </div>
          </div>

          <div className="math-equation-row">
            <div className="equation-block featured">
              <span className="eq-tag">Coefficient of Determination R&sup2;</span>
              <div className="eq-math highlight">
                R&sup2; = (SSR / SST) = 1 &minus; (SSE / SST) = r<sub>xy</sub>&sup2;
              </div>
              <span className="eq-subtext">
                For simple linear regression, R&sup2; is <strong>exactly equal to the square of Pearson correlation</strong> r<sub>xy</sub>&sup2;! Bounds: 0 &le; R&sup2; &le; 1.
              </span>
            </div>
          </div>
        </div>

        {/* 5. Gauss-Markov Assumptions (BLUE Theorem) */}
        <div className="formula-full-card">
          <div className="formula-item-header">
            <h4>5. Gauss-Markov Theorem: Best Linear Unbiased Estimator (BLUE)</h4>
          </div>

          <p className="gm-intro">
            Under these 5 core classical linear regression assumptions, the OLS estimator &beta;&#770; has the <strong>minimum variance</strong> among all linear unbiased estimators:
          </p>

          <div className="gm-assumptions-list">
            <div className="gm-item">
              <span className="gm-badge">A1</span>
              <div>
                <strong>Linearity in Parameters:</strong> The true data generating process is linear in parameters: <code>y = &beta;&#8320; + &beta;&#8321;x + &epsilon;</code>.
              </div>
            </div>

            <div className="gm-item">
              <span className="gm-badge">A2</span>
              <div>
                <strong>Strict Exogeneity:</strong> Error term has conditional expectation of zero given X: <code>&Escr;[&epsilon; | x] = 0</code>. Implies <code>Cov(x, &epsilon;) = 0</code>.
              </div>
            </div>

            <div className="gm-item">
              <span className="gm-badge">A3</span>
              <div>
                <strong>Homoscedasticity (Constant Variance):</strong> The variance of errors is constant for all values of x: <code>Var(&epsilon; | x) = &sigma;&sup2;</code>. (Violation = Heteroscedasticity).
              </div>
            </div>

            <div className="gm-item">
              <span className="gm-badge">A4</span>
              <div>
                <strong>No Autocorrelation:</strong> Errors for distinct observations are uncorrelated: <code>Cov(&epsilon;<sub>i</sub>, &epsilon;<sub>j</sub> | X) = 0 &nbsp; &forall; i &ne; j</code>.
              </div>
            </div>

            <div className="gm-item">
              <span className="gm-badge">A5</span>
              <div>
                <strong>No Perfect Collinearity:</strong> Sample variance of x is non-zero: <code>&sum; (x<sub>i</sub> - x&#772;)&sup2; &gt; 0</code>.
              </div>
            </div>
          </div>
        </div>

        {/* 6. Gradient Descent Updates */}
        <div className="formula-full-card">
          <div className="formula-item-header">
            <h4>6. Gradient Descent Optimization Update Equations</h4>
            <button
              type="button"
              className="copy-formula-btn"
              onClick={() =>
                handleCopy(
                  'w := w - alpha * (1/n) * sum (y_hat - y) * x\nb := b - alpha * (1/n) * sum (y_hat - y)',
                  'gd-formula'
                )
              }
            >
              {copiedFormula === 'gd-formula' ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>

          <div className="math-equation-row">
            <div className="equation-block">
              <span className="eq-tag">Slope Update Rule</span>
              <div className="eq-math highlight">
                w &larr; w &minus; &alpha; (&part;J / &part;w) = w + (&alpha; / n) &sum;<sub>i=1</sub><sup>n</sup> (y<sub>i</sub> - y&#770;<sub>i</sub>) x<sub>i</sub>
              </div>
            </div>

            <div className="equation-block">
              <span className="eq-tag">Intercept Update Rule</span>
              <div className="eq-math highlight">
                b &larr; b &minus; &alpha; (&part;J / &part;b) = b + (&alpha; / n) &sum;<sub>i=1</sub><sup>n</sup> (y<sub>i</sub> - y&#770;<sub>i</sub>)
              </div>
            </div>
          </div>

          <div className="formula-explanation">
            <p>
              In batch gradient descent, the learning rate <strong>&alpha;</strong> controls the step size down the 3D parabolic bowl. If &alpha; is too large (&alpha; &gt; 2 / &lambda;<sub>max</sub>), it overshoots and diverges; if &alpha; is properly chosen, it is mathematically guaranteed to reach the OLS global minimum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
