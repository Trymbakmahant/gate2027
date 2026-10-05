import { TopicModule } from '../../../types';
import LinearRegression3DViewer from '@/components/docs/LinearRegression3DViewer';
import MLFormulasStudySheet from '@/components/docs/MLFormulasStudySheet';
import { LINEAR_REGRESSION_QUESTIONS } from './questions';

export const linearRegressionModule: TopicModule = {
  subtopicId: 'linear-regression',
  title: 'Simple & Multiple Linear Regression',
  sectionId: 'machine-learning',
  summary:
    'Ordinary Least Squares (OLS) closed-form estimation, MSE convex parabolic loss bowl J(w,b), Gauss-Markov theorem (BLUE), ANOVA SST=SSR+SSE decomposition, and Gradient Descent optimization.',
  keyTakeaways: [
    'OLS line always passes through sample centroid (x̄, ȳ) with zero sum of residuals ∑ eᵢ = 0.',
    'Closed-form slope β̂₁ = Cov(X, Y) / Var(X) = r_xy · (s_y / s_x) and intercept β̂₀ = ȳ - β̂₁x̄.',
    'For simple regression, R² is identically equal to the square of Pearson correlation r_xy².',
    'Gauss-Markov BLUE guarantees minimum variance without requiring normality of errors.',
    'Gradient descent updates: w ← w - α(∂J/∂w) guaranteed to reach global minimum on convex surface.'
  ],
  gateImportance: 'Critical (Direct Marks)',
  simulation: {
    title: '3D Loss Surface J(w, b) & Dynamic Fit',
    tabLabel: '🧪 3D Simulation & Fit',
    badge: '3D Interactive',
    component: LinearRegression3DViewer,
    description:
      'Explore the convex parabolic error bowl in 3D. Rotate the camera, drag slope/intercept sliders, watch residual error bars update in real time, and animate gradient descent ball roll.'
  },
  formulas: {
    title: 'OLS Closed-Form & Gauss-Markov Formula Sheet',
    tabLabel: '📐 Master Formulas',
    component: MLFormulasStudySheet
  },
  quiz: {
    title: 'Linear Regression GATE Practice Test',
    tabLabel: '✍️ Topic Test',
    questions: LINEAR_REGRESSION_QUESTIONS,
    passingScore: 70
  }
};
