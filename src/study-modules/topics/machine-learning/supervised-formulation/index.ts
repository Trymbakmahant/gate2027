import { TopicModule } from '../../../types';
import SupervisedUnsupervisedVisualizer from '@/components/docs/SupervisedUnsupervisedVisualizer';
import MLFormulasStudySheet from '@/components/docs/MLFormulasStudySheet';
import { SUPERVISED_FORMULATION_QUESTIONS } from './questions';

export const supervisedFormulationModule: TopicModule = {
  subtopicId: 'supervised-formulation',
  title: 'Supervised Learning: Regression vs Classification Problems',
  sectionId: 'machine-learning',
  summary:
    'Core foundations of machine learning paradigms: Supervised learning with ground-truth targets vs. Unsupervised pattern discovery, and continuous Regression vs. discrete Classification objectives and loss metrics.',
  keyTakeaways: [
    'Supervised Learning has dataset D = {(xᵢ, yᵢ)} with supervisory labels yᵢ.',
    'Unsupervised Learning has dataset D = {xᵢ} without labels; goal is clustering or manifold learning.',
    'Regression predicts continuous targets y ∈ ℝ and minimizes MSE/RSS.',
    'Classification predicts discrete classes y ∈ {0, 1, ..., K-1} and minimizes cross-entropy/hinge loss.'
  ],
  gateImportance: 'High',
  simulation: {
    title: 'Paradigms Comparison Visualizer',
    tabLabel: '🧪 Visual Paradigms Lab',
    badge: 'Interactive',
    component: SupervisedUnsupervisedVisualizer,
    description:
      'Interact with continuous line fitting, discrete decision boundary hyperplane rotation, and k-means clustering centroid assignments.'
  },
  formulas: {
    title: 'Formulations & Loss Functions',
    tabLabel: '📐 Master Formulas',
    component: MLFormulasStudySheet
  },
  quiz: {
    title: 'Supervised vs Unsupervised Practice Test',
    tabLabel: '✍️ Topic Test',
    questions: SUPERVISED_FORMULATION_QUESTIONS,
    passingScore: 66
  }
};
