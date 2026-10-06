/**
 * Official GATE DA 2027 Syllabus Data
 * Extracted directly from: public/DA_GATE2027_Syllabus.pdf
 * Organizing Institute: IIT Madras
 */

import { MATRICES_MASTER_NOTES_MD } from '@/study-modules/topics/linear-algebra/matrices/matricesNotes';

export interface SyllabusSubtopic {
  id: string;
  title: string;
  keyTerms?: string[];
  notes?: string; // Kept empty for step-by-step user learning
  learningResources?: LearningResource[];
}

export interface LearningResource {
  id: string;
  title: string;
  url: string;
  type: 'youtube-playlist' | 'video' | 'notes' | 'article' | 'textbook';
  author?: string;
  platform?: string;
  description?: string;
  embedVideoId?: string;
  playlistId?: string;
  tags?: string[];
}

export interface SyllabusSection {
  id: string;
  sectionNumber: number;
  title: string;
  code: string;
  tier: 'Tier S' | 'Tier A' | 'Tier B';
  color: {
    bg: string;
    text: string;
    border: string;
    accent: string;
  };
  officialDescription: string;
  subtopics: SyllabusSubtopic[];
  learningResources?: LearningResource[];
}

export const GATE_DA_SYLLABUS: SyllabusSection[] = [
  {
    id: "prob-stats",
    sectionNumber: 1,
    title: "Probability and Statistics",
    code: "MATH-PROB",
    tier: "Tier S",
    color: {
      bg: "#ffe4e6",
      text: "#9f1239",
      border: "#18181b",
      accent: "#f43f5e"
    },
    officialDescription:
      "Counting (permutation and combinations), probability axioms, Sample space, events, independent events, mutually exclusive events, marginal, conditional and joint probability, Bayes Theorem, conditional expectation and variance, mean, median, mode and standard deviation, correlation, and covariance, random variables, discrete random variables and probability mass functions, uniform, Bernoulli, binomial distribution, Continuous random variables and probability distribution function, uniform, exponential, Poisson, normal, standard normal, t-distribution, chi-squared distributions, cumulative distribution function, Conditional PDF, Central limit theorem, confidence interval, z-test, t-test, chi-squared test.",
    learningResources: [
      {
        id: "prob-stats-sachin-mittal-playlist",
        title: "Probability & Statistics for GATE DA/CS (Full Playlist)",
        url: "https://www.youtube.com/watch?v=eTEEmAo7xuU&list=PLgjejdknTfWMQ-IofDV-3jwQkoVNTOLch",
        type: "youtube-playlist",
        author: "Sachin Mittal",
        platform: "YouTube",
        description:
          "Official comprehensive lecture series covering Permutations & Combinations, Probability Axioms, Sample Spaces, Bayes Theorem, Expectation & Variance, Random Variables, PMF/PDF, Probability Distributions (Binomial, Poisson, Normal, t, Chi-squared), CLT, and Hypothesis Testing for GATE DA.",
        embedVideoId: "eTEEmAo7xuU",
        playlistId: "PLgjejdknTfWMQ-IofDV-3jwQkoVNTOLch",
        tags: ["Tier S", "Probability", "Distributions", "Bayes Theorem", "CLT", "Hypothesis Testing"]
      }
    ],
    subtopics: [
      { id: "counting-perm-comb", title: "Counting: Permutations & Combinations" },
      { id: "prob-axioms-sample-space", title: "Probability Axioms, Sample Space & Events" },
      { id: "independent-mutually-exclusive", title: "Independent & Mutually Exclusive Events" },
      { id: "marginal-conditional-joint", title: "Marginal, Conditional & Joint Probability" },
      { id: "bayes-theorem", title: "Bayes Theorem & Total Probability" },
      { id: "conditional-expectation-variance", title: "Conditional Expectation & Variance" },
      { id: "descriptive-stats", title: "Mean, Median, Mode & Standard Deviation" },
      { id: "correlation-covariance", title: "Correlation & Covariance" },
      { id: "random-variables-pmf", title: "Random Variables & Probability Mass Functions (PMF)" },
      { id: "discrete-distributions", title: "Discrete Distributions: Uniform, Bernoulli, Binomial" },
      { id: "continuous-distributions-pdf", title: "Continuous Random Variables & Probability Density Function (PDF)" },
      { id: "continuous-models", title: "Continuous Models: Uniform, Exponential, Poisson, Normal & Standard Normal" },
      { id: "sampling-distributions", title: "Sampling Distributions: t-distribution & Chi-squared Distribution" },
      { id: "cdf-conditional-pdf", title: "Cumulative Distribution Function (CDF) & Conditional PDF" },
      { id: "clt", title: "Central Limit Theorem (CLT)" },
      { id: "confidence-intervals", title: "Confidence Intervals" },
      { id: "hypothesis-testing", title: "Hypothesis Testing: z-test, t-test, chi-squared test" }
    ]
  },
  {
    id: "linear-algebra",
    sectionNumber: 2,
    title: "Linear Algebra",
    code: "MATH-LA",
    tier: "Tier S",
    color: {
      bg: "#ede9fe",
      text: "#5b21b6",
      border: "#18181b",
      accent: "#8b5cf6"
    },
    officialDescription:
      "Vector space, subspaces, linear dependence and independence of vectors, matrices, projection matrix, orthogonal matrix, idempotent matrix, partition matrix and their properties, quadratic forms, systems of linear equations and solutions; Gaussian elimination, eigenvalues and eigenvectors, determinant, rank, nullity, projections, LU decomposition, singular value decomposition.",
    learningResources: [
      {
        id: "la-sachin-mittal-playlist",
        title: "Linear Algebra for Machine Learning & GATE DA (Full Playlist)",
        url: "https://www.youtube.com/watch?v=DrCeIbpfuzE&list=PLgjejdknTfWP9cYIHjxBRRdtGcUBLmCQC",
        type: "youtube-playlist",
        author: "Sachin Mittal",
        platform: "YouTube",
        description:
          "Official recommended comprehensive video lecture course covering Vector Spaces, Subspaces, Systems of Linear Equations, Gaussian Elimination, Matrix Inverses, Eigenvalues & Eigenvectors, Projections, SVD, and Rank-Nullity Theorem for GATE DA.",
        embedVideoId: "DrCeIbpfuzE",
        playlistId: "PLgjejdknTfWP9cYIHjxBRRdtGcUBLmCQC",
        tags: ["Tier S", "Vectors", "Eigenvalues", "GATE DA", "Matrix Decompositions"]
      }
    ],
    subtopics: [
      { id: "vector-space-subspaces", title: "Vector Space & Subspaces" },
      { id: "linear-dependence-independence", title: "Linear Dependence & Independence of Vectors" },
      {
        id: "matrices",
        title: "Matrices",
        notes: MATRICES_MASTER_NOTES_MD,
        keyTerms: [
          "Matrix definition & order",
          "Types of matrices",
          "Matrix addition & scalar multiplication",
          "Matrix multiplication (compatibility)",
          "Transpose properties (AB)^T = B^T A^T",
          "Symmetric & skew-symmetric matrices",
          "Trace properties",
          "Orthogonal matrices"
        ],
        learningResources: [
          {
            id: "gfg-intro-to-matrices",
            title: "Introduction to Matrices — Complete Revision Guide",
            url: "https://www.geeksforgeeks.org/maths/introduction-to-matrices/",
            type: "article",
            author: "GeeksforGeeks",
            platform: "GeeksforGeeks",
            description:
              "Official GeeksforGeeks comprehensive revision guide covering matrix definition, order, types of matrices (Row, Column, Square, Diagonal, Scalar, Identity, Zero, Symmetric, Skew-Symmetric), matrix operations, and transpose properties for GATE DA.",
            tags: ["Revision Link", "Matrices", "Linear Algebra", "GeeksforGeeks", "Tier S"]
          },
          {
            id: "gfg-types-of-matrices",
            title: "Types of Matrices — Complete Classification",
            url: "https://www.geeksforgeeks.org/maths/types-of-matrices/",
            type: "article",
            author: "GeeksforGeeks",
            platform: "GeeksforGeeks",
            description:
              "Comprehensive breakdown of 18 matrix types: Row, Column, Rectangular, Square, Diagonal, Zero, Identity, Symmetric, Skew-Symmetric, Orthogonal, Idempotent, and Involutory matrices.",
            tags: ["Types of Matrices", "Linear Algebra", "GeeksforGeeks"]
          },
          {
            id: "gfg-solved-matrices-practice",
            title: "Solved Examples & Practice Questions on Matrices",
            url: "https://www.geeksforgeeks.org/maths/practice-questions-on-matrices/",
            type: "article",
            author: "GeeksforGeeks",
            platform: "GeeksforGeeks",
            description:
              "Step-by-step solved GATE & engineering math questions covering matrix operations, determinant evaluation, adjoint computation, inverses, and rank determination.",
            tags: ["Practice", "Solved Questions", "GeeksforGeeks"]
          }
        ]
      },
      { id: "special-matrices", title: "Special Matrices: Projection, Orthogonal, Idempotent, Partition Matrices" },
      { id: "quadratic-forms", title: "Quadratic Forms & Definiteness" },
      { id: "systems-linear-equations", title: "Systems of Linear Equations & Consistency" },
      { id: "gaussian-elimination", title: "Gaussian Elimination & Row Operations" },
      { id: "eigenvalues-eigenvectors", title: "Eigenvalues & Eigenvectors" },
      { id: "determinant-rank-nullity", title: "Determinant, Rank & Nullity (Rank-Nullity Theorem)" },
      { id: "projections", title: "Orthogonal Projections & Subspace Geometry" },
      { id: "lu-decomposition", title: "LU Decomposition" },
      { id: "svd", title: "Singular Value Decomposition (SVD)" }
    ]
  },
  {
    id: "calculus-opt",
    sectionNumber: 3,
    title: "Calculus and Optimization",
    code: "MATH-CALC",
    tier: "Tier B",
    color: {
      bg: "#fef3c7",
      text: "#92400e",
      border: "#18181b",
      accent: "#f59e0b"
    },
    officialDescription:
      "Functions of a single variable, limit, continuity and differentiability, Taylor series, maxima and minima, optimization involving a single variable.",
    subtopics: [
      { id: "functions-single-variable", title: "Functions of a Single Variable: Domain, Range & Graphs" },
      { id: "limits-continuity", title: "Limits & Continuity" },
      { id: "differentiability", title: "Differentiability & Derivatives" },
      { id: "taylor-series", title: "Taylor Series & Polynomial Approximations" },
      { id: "maxima-minima", title: "Maxima, Minima & Critical Points" },
      { id: "single-variable-opt", title: "Optimization Involving a Single Variable" }
    ]
  },
  {
    id: "programming-dsa",
    sectionNumber: 4,
    title: "Programming, Data Structures and Algorithms",
    code: "CS-DSA",
    tier: "Tier B",
    color: {
      bg: "#dcfce7",
      text: "#166534",
      border: "#18181b",
      accent: "#22c55e"
    },
    officialDescription:
      "Programming in Python, basic data structures: stacks, queues, linked lists, trees, hash tables; Search algorithms: linear search and binary search, basic sorting algorithms: selection sort, bubble sort and insertion sort; divide and conquer: mergesort, quicksort; introduction to graph theory; basic graph algorithms: traversals and shortest path.",
    subtopics: [
      { id: "python-programming", title: "Programming in Python: Syntax, Functions & Core Idioms" },
      { id: "stacks-queues", title: "Basic Data Structures: Stacks & Queues" },
      { id: "linked-lists", title: "Linked Lists: Singly & Doubly Linked" },
      { id: "trees", title: "Trees: Binary Trees, BSTs & Traversals" },
      { id: "hash-tables", title: "Hash Tables: Hashing Functions & Collision Resolution" },
      { id: "search-algorithms", title: "Search Algorithms: Linear Search & Binary Search" },
      { id: "basic-sorting", title: "Basic Sorting: Selection Sort, Bubble Sort & Insertion Sort" },
      { id: "divide-conquer", title: "Divide and Conquer: Merge Sort & Quick Sort" },
      { id: "graph-theory-intro", title: "Introduction to Graph Theory: Representations & Degrees" },
      { id: "graph-traversals", title: "Graph Traversals: BFS & DFS" },
      { id: "shortest-path", title: "Shortest Path Algorithms: Dijkstra & Breadth-First Shortest Path" }
    ]
  },
  {
    id: "dbms-warehousing",
    sectionNumber: 5,
    title: "Database Management and Warehousing",
    code: "CS-DBMS",
    tier: "Tier A",
    color: {
      bg: "#e0f2fe",
      text: "#075985",
      border: "#18181b",
      accent: "#0284c7"
    },
    officialDescription:
      "ER-model, relational model: relational algebra, tuple calculus, SQL, integrity constraints, normal form, file organization, indexing, data types, data transformation such as normalization, discretization, sampling, compression; data warehouse modelling: schema for multidimensional data models, concept hierarchies, measures: categorization and computations.",
    subtopics: [
      { id: "er-model", title: "Entity-Relationship (ER) Model & Diagrams" },
      { id: "relational-algebra-calculus", title: "Relational Model: Relational Algebra & Tuple Calculus" },
      { id: "sql", title: "SQL: DDL, DML, Joins, Aggregations & Subqueries" },
      { id: "integrity-constraints", title: "Integrity Constraints & Key Constraints" },
      { id: "normal-forms", title: "Functional Dependencies & Normal Forms (1NF, 2NF, 3NF, BCNF)" },
      { id: "file-org-indexing", title: "File Organization & Indexing: B/B+ Trees & Hash Indexing" },
      { id: "data-types-transformations", title: "Data Transformation: Normalization, Discretization, Sampling, Compression" },
      { id: "data-warehouse-modelling", title: "Data Warehouse Modelling: Star & Snowflake Schemas" },
      { id: "concept-hierarchies", title: "Concept Hierarchies & Data Roll-up / Drill-down" },
      { id: "measures-computations", title: "Measures: Categorization & Computations (OLAP Operations)" }
    ]
  },
  {
    id: "machine-learning",
    sectionNumber: 6,
    title: "Machine Learning",
    code: "AI-ML",
    tier: "Tier S",
    color: {
      bg: "#fce7f3",
      text: "#9d174d",
      border: "#18181b",
      accent: "#ec4899"
    },
    officialDescription:
      "Supervised Learning: regression and classification problems, simple linear regression, multiple linear regression, ridge regression, logistic regression, k-nearest neighbour, naive Bayes classifier, linear discriminant analysis, support vector machine, decision trees, bias-variance trade-off, cross-validation methods such as leave-one-out (LOO) cross-validation, k-folds cross-validation, multi-layer perceptron, feed-forward neural network; Unsupervised Learning: clustering algorithms, k-means/k-medoid, hierarchical clustering, top-down, bottom-up: single-linkage, multiple-linkage, dimensionality reduction, principal component analysis.",
    subtopics: [
      { id: "supervised-formulation", title: "Supervised Learning: Regression vs Classification Problems" },
      { id: "linear-regression", title: "Simple & Multiple Linear Regression" },
      { id: "ridge-regression", title: "Ridge Regression & L2 Regularization" },
      { id: "logistic-regression", title: "Logistic Regression & Sigmoid Decision Boundary" },
      { id: "knn", title: "k-Nearest Neighbours (k-NN) Classification & Regression" },
      { id: "naive-bayes", title: "Naive Bayes Classifier" },
      { id: "lda", title: "Linear Discriminant Analysis (LDA)" },
      { id: "svm", title: "Support Vector Machines (SVM): Hyperplanes & Kernels" },
      { id: "decision-trees", title: "Decision Trees: Entropy, Gini Index & Information Gain" },
      { id: "bias-variance-tradeoff", title: "Bias-Variance Trade-off" },
      { id: "cross-validation", title: "Cross-Validation Methods: LOO & k-Fold" },
      { id: "mlp-neural-networks", title: "Multi-Layer Perceptron (MLP) & Feed-Forward Neural Networks" },
      { id: "unsupervised-learning-intro", title: "Unsupervised Learning: Clustering Foundations" },
      { id: "kmeans-kmedoids", title: "k-Means & k-Medoids Clustering" },
      { id: "hierarchical-clustering", title: "Hierarchical Clustering: Single-Linkage & Multiple-Linkage" },
      { id: "dimensionality-reduction-pca", title: "Dimensionality Reduction: Principal Component Analysis (PCA)" }
    ]
  },
  {
    id: "artificial-intelligence",
    sectionNumber: 7,
    title: "Artificial Intelligence",
    code: "AI-CORE",
    tier: "Tier A",
    color: {
      bg: "#e0e7ff",
      text: "#3730a3",
      border: "#18181b",
      accent: "#6366f1"
    },
    officialDescription:
      "Search: informed, uninformed, adversarial; logic, propositional, predicate; reasoning under uncertainty topics — conditional independence representation, exact inference through variable elimination, and approximate inference through sampling.",
    subtopics: [
      { id: "uninformed-search", title: "Uninformed Search: BFS, DFS, Depth-Limited & Uniform Cost" },
      { id: "informed-search", title: "Informed (Heuristic) Search: A*, Greedy Best-First Search & Admissibility" },
      { id: "adversarial-search", title: "Adversarial Search: Minimax Algorithm & Alpha-Beta Pruning" },
      { id: "propositional-logic", title: "Propositional Logic: Syntax, Semantics, Truth Tables & Validity" },
      { id: "predicate-logic", title: "First-Order Predicate Logic: Quantifiers, Unification & Resolution" },
      { id: "bayesian-networks", title: "Reasoning under Uncertainty: Conditional Independence & Bayesian Networks" },
      { id: "exact-inference", title: "Exact Inference through Variable Elimination" },
      { id: "approximate-inference", title: "Approximate Inference through Sampling (Rejection, Likelihood, MCMC)" }
    ]
  }
];
