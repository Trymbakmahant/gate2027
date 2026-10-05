import { QuizQuestion } from '../../../types';

export const SUPERVISED_FORMULATION_QUESTIONS: QuizQuestion[] = [
  {
    id: 'sf-q1',
    type: 'MCQ',
    marks: 1,
    difficulty: 'Easy',
    gateReference: 'Basic Formulation',
    prompt:
      'Which fundamental characteristic distinguishes Supervised Learning from Unsupervised Learning in machine learning formulation?',
    options: [
      { id: 'opt-a', text: 'The training dataset includes explicit target labels yᵢ paired with each feature vector xᵢ.' },
      { id: 'opt-b', text: 'Supervised learning never requires numerical optimization algorithms.' },
      { id: 'opt-c', text: 'Unsupervised learning only works with discrete categorical features.' },
      { id: 'opt-d', text: 'Supervised learning cannot be evaluated using an objective loss function.' }
    ],
    correctOptionIds: ['opt-a'],
    explanation:
      'In Supervised Learning, the training set consists of pairs D = {(x₁, y₁), ..., (xₙ, yₙ)} where yᵢ is the supervisor/ground-truth target. Unsupervised learning receives only unlabeled inputs D = {x₁, ..., xₙ} and seeks intrinsic structure or clustering.',
    examTrapNotice:
      'Both paradigms use optimization; the defining difference is the presence of ground-truth target supervisory signals yᵢ.'
  },
  {
    id: 'sf-q2',
    type: 'MCQ',
    marks: 1,
    difficulty: 'Easy',
    gateReference: 'Classification vs Regression',
    prompt:
      'Consider the following two machine learning tasks:\nTask 1: Predicting the price (in INR) of a used laptop based on CPU speed and RAM.\nTask 2: Predicting whether an incoming transaction is Fraudulent (1) or Legitimate (0).\nHow are these two tasks mathematically categorized?',
    options: [
      { id: 'opt-a', text: 'Task 1 is Regression (continuous target y ∈ ℝ), Task 2 is Classification (discrete categorical target y ∈ {0, 1}).' },
      { id: 'opt-b', text: 'Task 1 is Classification, Task 2 is Clustering.' },
      { id: 'opt-c', text: 'Both tasks are Regression problems.' },
      { id: 'opt-d', text: 'Task 1 is Unsupervised Learning, Task 2 is Supervised Learning.' }
    ],
    correctOptionIds: ['opt-a'],
    explanation:
      'Regression maps inputs to a continuous real-valued scalar y ∈ ℝ (price). Classification maps inputs to discrete category labels {0, 1} (fraud vs legitimate).',
    examTrapNotice:
      'Even if a classification model outputs a probability p ∈ [0, 1], the underlying ground-truth variable being predicted is categorical.'
  },
  {
    id: 'sf-q3',
    type: 'MSQ',
    marks: 2,
    difficulty: 'Medium',
    gateReference: 'Loss Functions Comparison',
    prompt:
      'Which of the following loss functions are typically used for Classification problems rather than Regression problems?',
    options: [
      { id: 'opt-a', text: 'Binary Cross-Entropy (Log Loss): -[y log(p) + (1-y) log(1-p)]' },
      { id: 'opt-b', text: 'Hinge Loss: max(0, 1 - y · f(x)) (used in Support Vector Machines)' },
      { id: 'opt-c', text: '0-1 Misclassification Loss: I(y ≠ ŷ)' },
      { id: 'opt-d', text: 'Mean Squared Error (MSE): (1/2)(y - ŷ)²' }
    ],
    correctOptionIds: ['opt-a', 'opt-b', 'opt-c'],
    explanation:
      'Cross-Entropy, Hinge Loss, and 0-1 loss penalize discrete misclassifications and probability discrepancies for categorical labels. Mean Squared Error (MSE) is the canonical loss for Regression (continuous targets), penalizing Euclidean metric residuals (y - ŷ)²',
    examTrapNotice:
      'While MSE can technically be computed on numeric indicators, it performs poorly for classification because it penalizes confident correct predictions and lacks probabilistic interpretation.'
  }
];
