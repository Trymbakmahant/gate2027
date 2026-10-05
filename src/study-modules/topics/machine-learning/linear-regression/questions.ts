import { QuizQuestion } from '../../../types';

export const LINEAR_REGRESSION_QUESTIONS: QuizQuestion[] = [
  {
    id: 'lr-q1',
    type: 'MCQ',
    marks: 1,
    difficulty: 'Easy',
    gateReference: 'GATE DA 2024 Pattern',
    prompt:
      'In a simple linear regression model y = β₀ + β₁x + ε fitted by Ordinary Least Squares (OLS) with an intercept term, which of the following statements is ALWAYS guaranteed to be true?',
    options: [
      { id: 'opt-a', text: 'The fitted regression line always passes through the sample centroid (x̄, ȳ).' },
      { id: 'opt-b', text: 'The sum of residuals ∑ eᵢ is strictly positive if the slope β₁ > 0.' },
      { id: 'opt-c', text: 'The residuals are positively correlated with the predictor x.' },
      { id: 'opt-d', text: 'The regression line always passes through the origin (0, 0).' }
    ],
    correctOptionIds: ['opt-a'],
    explanation:
      'The OLS estimator for the intercept is β̂₀ = ȳ - β̂₁x̄. Rearranging yields ȳ = β̂₀ + β̂₁x̄, which mathematically proves that the point of sample means (x̄, ȳ) always lies on the fitted regression line.',
    examTrapNotice:
      'GATE Trap: Many students confuse the sample centroid (x̄, ȳ) with the origin (0, 0). The line ONLY passes through (0, 0) if β̂₀ = 0 (regression through origin, where ∑ eᵢ is NOT guaranteed to be zero!).'
  },
  {
    id: 'lr-q2',
    type: 'NAT',
    marks: 2,
    difficulty: 'Medium',
    gateReference: 'Standard IIT Madras Numerical',
    prompt:
      'A dataset of 10 observations has sample mean x̄ = 4.0, sample mean ȳ = 18.0, sample variance Var(X) = 5.0, and sample covariance Cov(X, Y) = 15.0. Compute the optimal OLS intercept value (β̂₀).',
    subPrompt: 'Round your answer to the nearest integer.',
    correctNumericValue: 6,
    numericTolerance: 0.1,
    explanation:
      'Step 1: Compute slope β̂₁ = Cov(X, Y) / Var(X) = 15.0 / 5.0 = 3.0.\nStep 2: Compute intercept β̂₀ = ȳ - β̂₁x̄ = 18.0 - (3.0 × 4.0) = 18.0 - 12.0 = 6.0.',
    examTrapNotice:
      'GATE Trap: Do not divide Cov(X, Y) by Var(Y)! The slope of Y on X uses Var(X) in the denominator: β̂₁ = Cov(X, Y) / Var(X).'
  },
  {
    id: 'lr-q3',
    type: 'MSQ',
    marks: 2,
    difficulty: 'Hard',
    gateReference: 'GATE DA Gauss-Markov BLUE Question',
    prompt:
      'Which of the following assumptions are REQUIRED for the Gauss-Markov Theorem to guarantee that OLS estimators are BLUE (Best Linear Unbiased Estimators)?',
    options: [
      { id: 'opt-a', text: 'Zero Conditional Mean (Strict Exogeneity): E[ε | X] = 0' },
      { id: 'opt-b', text: 'Homoscedasticity: Var(εᵢ | X) = σ² (constant variance across all i)' },
      { id: 'opt-c', text: 'No Autocorrelation: Cov(εᵢ, εⱼ | X) = 0 for all i ≠ j' },
      { id: 'opt-d', text: 'The error terms εᵢ must follow a Normal Distribution εᵢ ~ N(0, σ²)' }
    ],
    correctOptionIds: ['opt-a', 'opt-b', 'opt-c'],
    explanation:
      'The Gauss-Markov theorem states that under (1) Linearity in parameters, (2) Strict Exogeneity E[ε|X]=0, (3) Homoscedasticity Var(ε|X)=σ²I, and (4) No perfect collinearity, the OLS estimator is BLUE (Best Linear Unbiased Estimator). Normality of errors is NOT required for BLUE! Normality is only needed for hypothesis tests (t-tests, F-tests, and confidence intervals).',
    examTrapNotice:
      'GATE Trap: Option D is the classic trap! Normality is NEVER needed for Gauss-Markov BLUE property. Only the first two moments (mean 0 and constant variance σ²) are required.'
  },
  {
    id: 'lr-q4',
    type: 'NAT',
    marks: 1,
    difficulty: 'Easy',
    gateReference: 'Pearson Correlation & R² Relation',
    prompt:
      'For a simple linear regression with one predictor variable, the Pearson correlation coefficient between the feature X and target Y is r_xy = -0.80. What is the Coefficient of Determination (R²)?',
    subPrompt: 'Enter your answer up to two decimal places.',
    correctNumericValue: 0.64,
    numericTolerance: 0.01,
    explanation:
      'In simple linear regression (single predictor), the coefficient of determination R² is identically equal to the square of Pearson correlation coefficient: R² = (r_xy)² = (-0.80)² = 0.64 (or 64% of total variance explained).',
    examTrapNotice:
      'Notice that even when r_xy is negative (downward sloping line), R² is strictly non-negative: (-0.80)² = +0.64.'
  },
  {
    id: 'lr-q5',
    type: 'MCQ',
    marks: 2,
    difficulty: 'Medium',
    gateReference: 'Loss Surface & Convexity',
    prompt:
      'Consider the MSE loss function J(w, b) = (1/2n) ∑ (yᵢ - (wxᵢ + b))² for simple linear regression. What can be definitively stated regarding its Hessian matrix ∇²J and critical points?',
    options: [
      { id: 'opt-a', text: 'J(w, b) is strictly convex everywhere (positive semi-definite Hessian), meaning any local minimum is a global minimum.' },
      { id: 'opt-b', text: 'J(w, b) has multiple local minima due to non-linearity in the parameters.' },
      { id: 'opt-c', text: 'Gradient descent can get trapped in non-optimal saddle points because J is non-convex.' },
      { id: 'opt-d', text: 'The Hessian matrix of J depends on the parameter values (w, b).' }
    ],
    correctOptionIds: ['opt-a'],
    explanation:
      'The MSE loss for linear regression is a quadratic form in parameters w and b. Its Hessian matrix is (1/n) [ ∑xᵢ²  ∑xᵢ ; ∑xᵢ  n ], which is independent of (w, b) and positive semi-definite (positive definite if Var(X) > 0). Hence, the loss bowl is strictly convex with a unique global minimum and zero sub-optimal local minima.',
    examTrapNotice:
      'The 3D loss surface shown in the simulation is a convex parabolic bowl: gradient descent with proper learning rate is guaranteed to converge to the analytical OLS solution!'
  }
];
