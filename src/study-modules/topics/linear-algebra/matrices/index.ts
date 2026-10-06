import { TopicModule } from '../../../types';
import MatrixVisualizer from '@/components/docs/MatrixVisualizer';
import MatricesNotesStudySheet from '@/components/docs/MatricesNotesStudySheet';
import { MATRICES_QUESTIONS } from './questions';

export const matricesModule: TopicModule = {
  subtopicId: 'matrices',
  title: 'Matrices & Matrix Operations',
  sectionId: 'linear-algebra',
  summary:
    'Comprehensive study of matrices: definitions, dimensions & order (m × n), types of matrices (Row, Column, Square, Diagonal, Scalar, Identity, Zero, Symmetric, Skew-Symmetric, Orthogonal, Idempotent, Involutory, Nilpotent), algebraic operations, transpose properties ((AB)ᵀ = Bᵀ Aᵀ), and trace theorems.',
  keyTakeaways: [
    'Matrix Order: An m × n matrix has m rows and n columns. Two matrices can be added/subtracted if and only if their dimensions match identically.',
    'Multiplication Rule: The product AB exists iff columns of A = rows of B. If A is m × k and B is k × n, then AB is m × n. Matrix multiplication is associative but NOT commutative (AB ≠ BA in general).',
    'Transpose Reversal Law: (Aᵀ)ᵀ = A, (A + B)ᵀ = Aᵀ + Bᵀ, (cA)ᵀ = cAᵀ, and crucially (AB)ᵀ = Bᵀ Aᵀ and (ABC)ᵀ = Cᵀ Bᵀ Aᵀ.',
    'Symmetric vs Skew-Symmetric: Symmetric if Aᵀ = A; Skew-Symmetric if Aᵀ = -A. The principal diagonal entries of any real skew-symmetric matrix must always be zero.',
    'Trace Invariants: tr(A) = sum of main diagonal entries = sum of all eigenvalues ∑ λᵢ. Cyclic property: tr(AB) = tr(BA).',
    'Orthogonal Matrix: Qᵀ Q = Q Qᵀ = I ⇒ Q⁻¹ = Qᵀ, det(Q) = ±1. Preserves lengths and angles.'
  ],
  gateImportance: 'Critical (Direct Marks)',
  learningResources: [
    {
      id: 'gfg-intro-to-matrices',
      title: 'Introduction to Matrices — Complete Revision Guide',
      url: 'https://www.geeksforgeeks.org/maths/introduction-to-matrices/',
      type: 'article',
      author: 'GeeksforGeeks',
      platform: 'GeeksforGeeks',
      description:
        'Official GeeksforGeeks comprehensive revision article covering matrix representation, order of matrix, types of matrices, matrix addition & scalar multiplication, multiplication rules, transpose, and GATE-relevant properties.',
      tags: ['Revision Link', 'Matrices', 'Linear Algebra', 'GeeksforGeeks', 'Tier S']
    },
    {
      id: 'gfg-types-of-matrices',
      title: 'Types of Matrices — Complete Classification',
      url: 'https://www.geeksforgeeks.org/maths/types-of-matrices/',
      type: 'article',
      author: 'GeeksforGeeks',
      platform: 'GeeksforGeeks',
      description:
        'Comprehensive breakdown of 18 matrix types: Row, Column, Rectangular, Square, Diagonal, Zero, Identity, Symmetric, Skew-Symmetric, Orthogonal, Idempotent, and Involutory matrices.',
      tags: ['Types of Matrices', 'Linear Algebra', 'GeeksforGeeks']
    },
    {
      id: 'gfg-solved-matrices-practice',
      title: 'Solved Examples & Practice Questions on Matrices',
      url: 'https://www.geeksforgeeks.org/maths/practice-questions-on-matrices/',
      type: 'article',
      author: 'GeeksforGeeks',
      platform: 'GeeksforGeeks',
      description:
        'Step-by-step solved GATE & engineering math questions covering matrix operations, determinant evaluation, adjoint computation, inverses, and rank determination.',
      tags: ['Practice', 'Solved Questions', 'GeeksforGeeks']
    },
    {
      id: 'la-sachin-mittal-playlist',
      title: 'Linear Algebra for Machine Learning & GATE DA (Full Playlist)',
      url: 'https://www.youtube.com/watch?v=DrCeIbpfuzE&list=PLgjejdknTfWP9cYIHjxBRRdtGcUBLmCQC',
      type: 'youtube-playlist',
      author: 'Sachin Mittal',
      platform: 'YouTube',
      description:
        'Official comprehensive video lecture series covering Vector Spaces, Matrices, Systems of Equations, Gaussian Elimination, Eigenvalues & SVD for GATE DA.',
      embedVideoId: 'DrCeIbpfuzE',
      playlistId: 'PLgjejdknTfWP9cYIHjxBRRdtGcUBLmCQC',
      tags: ['Tier S', 'Linear Algebra', 'Matrices']
    }
  ],
  simulation: {
    title: 'Interactive Matrix Laboratory & Transpose Explorer',
    tabLabel: '🧪 Interactive Lab',
    badge: 'Interactive Lab',
    component: MatrixVisualizer,
    description:
      'Edit matrix cells dynamically, observe transpose transformations, test commutativity AB vs BA, and numerically verify the transpose reversal law (AB)ᵀ = Bᵀ Aᵀ.'
  },
  formulas: {
    title: 'Matrices Master Theory, Types & Formulas Sheet',
    tabLabel: '📐 Master Notes & Formulas',
    component: MatricesNotesStudySheet
  },
  quiz: {
    title: 'Matrices & Matrix Operations GATE Practice Test',
    tabLabel: '✍️ Topic Test',
    questions: MATRICES_QUESTIONS,
    passingScore: 75
  }
};
