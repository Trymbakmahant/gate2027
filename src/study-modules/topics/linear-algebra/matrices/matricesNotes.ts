/**
 * Comprehensive Master Study Notes & Formulas for Matrices (GATE DA 2027)
 * Sourced from official IIT Madras syllabus & GeeksforGeeks Matrix Theory
 */

export interface MatrixTypeItem {
  id: string;
  name: string;
  category: 'Dimensional' | 'Symmetry & Transpose' | 'Algebraic & Powers' | 'Triangular' | 'Invertibility';
  definition: string;
  mathCondition: string;
  latexExample: string;
  gfgUrl: string;
  gateTrap?: string;
}

export interface MatrixFormulaItem {
  id: string;
  title: string;
  formula: string;
  category: 'Inverse & Adjoint' | 'Determinant' | 'Operations' | 'Rank';
  description: string;
  gateTrap: string;
}

export interface DataScienceAppItem {
  id: string;
  title: string;
  description: string;
  exampleSnippet: string;
  mathNotation: string;
  gfgReference?: string;
}

export const MATRIX_TYPES: MatrixTypeItem[] = [
  {
    id: 'row-matrix',
    name: 'Row Matrix',
    category: 'Dimensional',
    definition: 'A matrix that has only one row and one or more columns.',
    mathCondition: 'Order: 1 × n, where n ≥ 1',
    latexExample: 'A = [a₁  a₂  ⋯  aₙ]',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/row-matrix/',
    gateTrap: 'In NumPy/PyTorch, a 1D vector shape (n,) is distinct from a 2D row matrix shape (1, n).'
  },
  {
    id: 'column-matrix',
    name: 'Column Matrix',
    category: 'Dimensional',
    definition: 'A matrix that has only one column and one or more rows.',
    mathCondition: 'Order: m × 1, where m ≥ 1',
    latexExample: 'A = [a₁; a₂; ⋮; aₘ]',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/column-matrix/',
    gateTrap: 'Features vectors in machine learning are standardly represented as m × 1 column vectors.'
  },
  {
    id: 'horizontal-matrix',
    name: 'Horizontal Matrix',
    category: 'Dimensional',
    definition: 'A matrix in which the number of rows is strictly less than the number of columns.',
    mathCondition: 'm < n (More columns than rows)',
    latexExample: 'Order: 2 × 5',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/types-of-matrices/',
    gateTrap: 'For horizontal matrices, rank ρ(A) ≤ m < n, meaning columns can never be linearly independent.'
  },
  {
    id: 'vertical-matrix',
    name: 'Vertical Matrix',
    category: 'Dimensional',
    definition: 'A matrix in which the number of columns is strictly less than the number of rows.',
    mathCondition: 'm > n (More rows than columns)',
    latexExample: 'Order: 5 × 2',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/types-of-matrices/',
    gateTrap: 'Standard ML dataset layout where samples N >> features d represents a tall vertical matrix.'
  },
  {
    id: 'rectangular-matrix',
    name: 'Rectangular Matrix',
    category: 'Dimensional',
    definition: 'A matrix in which the number of rows and columns is unequal.',
    mathCondition: 'm ≠ n',
    latexExample: 'A ∈ ℝ^(m × n)',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/rectangular-matrix/',
    gateTrap: 'Determinant det(A) is UNDEFINED for rectangular matrices; only defined for square matrices.'
  },
  {
    id: 'square-matrix',
    name: 'Square Matrix',
    category: 'Dimensional',
    definition: 'A matrix in which the number of rows and columns is equal.',
    mathCondition: 'm = n (Order n × n or order n)',
    latexExample: 'A ∈ ℝ^(n × n)',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/square-matrix/',
    gateTrap: 'Eigenvalues, trace, determinant, and invertibility are strictly properties of square matrices.'
  },
  {
    id: 'diagonal-matrix',
    name: 'Diagonal Matrix',
    category: 'Triangular',
    definition: 'A square matrix in which all non-diagonal elements are zero.',
    mathCondition: 'aᵢⱼ = 0 for all i ≠ j',
    latexExample: 'diag(d₁, d₂, …, dₙ)',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/diagonal-matrix/',
    gateTrap: 'Determinant equals product of diagonal elements: det(D) = ∏ dᵢ. Eigenvalues are the diagonal entries themselves!'
  },
  {
    id: 'zero-matrix',
    name: 'Zero or Null Matrix',
    category: 'Dimensional',
    definition: 'A matrix whose all elements are zero. Denoted by O or 0.',
    mathCondition: 'aᵢⱼ = 0 for all i, j',
    latexExample: 'O_(m × n)',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/zero-matrix/',
    gateTrap: 'Rank of null matrix is identically 0: ρ(O) = 0. All eigenvalues are 0.'
  },
  {
    id: 'identity-matrix',
    name: 'Unit or Identity Matrix',
    category: 'Algebraic & Powers',
    definition: 'A diagonal matrix whose diagonal elements are all 1. Represented by I or Iₙ.',
    mathCondition: 'aᵢⱼ = 1 if i = j, else aᵢⱼ = 0',
    latexExample: 'Iₙ = diag(1, 1, …, 1)',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/identity-matrix/',
    gateTrap: 'Multiplicative identity: AI = IA = A. det(I) = 1, tr(Iₙ) = n.'
  },
  {
    id: 'symmetric-matrix',
    name: 'Symmetric Matrix',
    category: 'Symmetry & Transpose',
    definition: 'A square matrix where the transpose equals the original matrix.',
    mathCondition: 'Aᵀ = A ⟺ aᵢⱼ = aⱼᵢ',
    latexExample: 'Aᵀ = A',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/what-is-symmetric-matrix-and-skew-symmetric-matrix/',
    gateTrap: 'All eigenvalues of a real symmetric matrix are guaranteed to be REAL numbers, and eigenvectors from distinct eigenvalues are orthogonal.'
  },
  {
    id: 'skew-symmetric-matrix',
    name: 'Skew-Symmetric Matrix',
    category: 'Symmetry & Transpose',
    definition: 'A square matrix whose transpose equals its negative.',
    mathCondition: 'Aᵀ = -A ⟺ aᵢⱼ = -aⱼᵢ',
    latexExample: 'Aᵀ = -A  (with aᵢᵢ = 0)',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/what-is-symmetric-matrix-and-skew-symmetric-matrix/',
    gateTrap: 'CRITICAL: Principal diagonal elements must ALWAYS be 0 because aᵢᵢ = -aᵢᵢ ⟹ 2aᵢᵢ = 0 ⟹ aᵢᵢ = 0. Real skew-symmetric matrices have pure imaginary or zero eigenvalues.'
  },
  {
    id: 'orthogonal-matrix',
    name: 'Orthogonal Matrix',
    category: 'Symmetry & Transpose',
    definition: 'A square matrix whose transpose is equal to its inverse.',
    mathCondition: 'A Aᵀ = Aᵀ A = I ⟺ A⁻¹ = Aᵀ',
    latexExample: 'Qᵀ Q = I',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/orthogonal-matrix/',
    gateTrap: 'det(A) = ±1. Orthogonal transformations preserve vector lengths (Euclidean norm) and angles: ||Qx|| = ||x||.'
  },
  {
    id: 'idempotent-matrix',
    name: 'Idempotent Matrix',
    category: 'Algebraic & Powers',
    definition: 'A square matrix that equals itself when multiplied by itself (squared).',
    mathCondition: 'A² = A',
    latexExample: 'A² = A ⟹ Aᵏ = A for k ≥ 1',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/idempotent-matrix/',
    gateTrap: 'Eigenvalues can ONLY be 0 or 1. Projection matrices P in linear regression (H = X(XᵀX)⁻¹Xᵀ) are idempotent: H² = H.'
  },
  {
    id: 'involutory-matrix',
    name: 'Involutory Matrix',
    category: 'Algebraic & Powers',
    definition: 'A square matrix whose square is the identity matrix.',
    mathCondition: 'A² = I ⟺ A⁻¹ = A',
    latexExample: 'A² = I',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/involutory-matrix/',
    gateTrap: 'A is its own inverse! det(A) = ±1. Eigenvalues are always ±1.'
  },
  {
    id: 'upper-triangular-matrix',
    name: 'Upper Triangular Matrix',
    category: 'Triangular',
    definition: 'A square matrix in which all entries below the principal diagonal are zero.',
    mathCondition: 'aᵢⱼ = 0 for all i > j',
    latexExample: '[u₁₁ u₁₂ u₁₃; 0 u₂₂ u₂₃; 0 0 u₃₃]',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/triangular-matrix/',
    gateTrap: 'Eigenvalues are exactly the diagonal entries. det(U) = ∏ uᵢᵢ.'
  },
  {
    id: 'lower-triangular-matrix',
    name: 'Lower Triangular Matrix',
    category: 'Triangular',
    definition: 'A square matrix in which all entries above the principal diagonal are zero.',
    mathCondition: 'aᵢⱼ = 0 for all i < j',
    latexExample: '[l₁₁ 0 0; l₂₁ l₂₂ 0; l₃₁ l₃₂ l₃₃]',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/triangular-matrix/',
    gateTrap: 'LU Decomposition factorizes A = L · U into Lower and Upper triangular factors for fast O(n²) forward/backward substitution.'
  },
  {
    id: 'singular-matrix',
    name: 'Singular Matrix',
    category: 'Invertibility',
    definition: 'A square matrix whose determinant is zero.',
    mathCondition: '|A| = det(A) = 0',
    latexExample: 'det(A) = 0 ⟹ A⁻¹ does NOT exist',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/singular-matrix/',
    gateTrap: 'Singular matrices are NOT invertible. Rank ρ(A) < n. Has at least one eigenvalue λ = 0.'
  },
  {
    id: 'non-singular-matrix',
    name: 'Non-Singular Matrix',
    category: 'Invertibility',
    definition: 'A square matrix whose determinant is non-zero.',
    mathCondition: '|A| = det(A) ≠ 0',
    latexExample: 'det(A) ≠ 0 ⟹ A⁻¹ exists and is unique',
    gfgUrl: 'https://www.geeksforgeeks.org/maths/non-singular-matrix/',
    gateTrap: 'Full rank ρ(A) = n. Rows and columns are linearly independent. Trivial nullspace N(A) = {0}.'
  }
];

export const MATRIX_FORMULAS: MatrixFormulaItem[] = [
  {
    id: 'inv-def',
    title: 'Matrix Inverse Definition',
    formula: 'A⁻¹ = adj(A) / |A|',
    category: 'Inverse & Adjoint',
    description: 'Requires matrix A to be non-singular (|A| ≠ 0).',
    gateTrap: 'If |A| = 0, inverse is undefined. Never divide by determinant without verifying |A| ≠ 0.'
  },
  {
    id: 'adj-identity',
    title: 'Adjoint Identity Product',
    formula: 'A · adj(A) = adj(A) · A = |A| · Iₙ',
    category: 'Inverse & Adjoint',
    description: 'Multiplying any square matrix by its adjoint yields a scalar matrix with diagonal entries equal to |A|.',
    gateTrap: 'If A is singular (|A| = 0), then A · adj(A) = 0 (the zero matrix).'
  },
  {
    id: 'det-adj',
    title: 'Determinant of Adjoint',
    formula: '|adj(A)| = |A|^(n - 1)',
    category: 'Inverse & Adjoint',
    description: 'Where n is the order of square matrix A.',
    gateTrap: 'Classic GATE question! If n = 3 and |A| = 4, then |adj(A)| = 4^(3-1) = 4² = 16.'
  },
  {
    id: 'adj-adj-matrix',
    title: 'Double Adjoint Matrix',
    formula: 'adj(adj(A)) = |A|^(n - 2) · A',
    category: 'Inverse & Adjoint',
    description: 'The adjoint of an adjoint matrix scales original matrix A by |A|^(n-2).',
    gateTrap: 'Notice the exponent is (n - 2). For n = 2, adj(adj(A)) = |A|⁰ · A = A.'
  },
  {
    id: 'det-double-adj',
    title: 'Determinant of Double Adjoint',
    formula: '|adj(adj(A))| = |A|^((n - 1)²)',
    category: 'Inverse & Adjoint',
    description: 'Determinant of the double adjoint scales exponentially by (n - 1) squared.',
    gateTrap: 'For n = 3, exponent is (3 - 1)² = 4. So |adj(adj(A))| = |A|⁴.'
  },
  {
    id: 'adj-product',
    title: 'Adjoint of Matrix Product',
    formula: 'adj(AB) = adj(B) · adj(A)',
    category: 'Inverse & Adjoint',
    description: 'Reversal Law applies to adjoints just like transposes and inverses.',
    gateTrap: 'Order flips! adj(AB) ≠ adj(A) · adj(B) in general unless A and B commute.'
  },
  {
    id: 'adj-power',
    title: 'Adjoint of Matrix Power',
    formula: 'adj(Aᵖ) = (adj(A))ᵖ',
    category: 'Inverse & Adjoint',
    description: 'Taking the adjoint commutes with integer powers p.',
    gateTrap: 'Valid for all positive integers p.'
  },
  {
    id: 'adj-scalar',
    title: 'Adjoint of Scalar Multiplication',
    formula: 'adj(kA) = k^(n - 1) · adj(A)',
    category: 'Inverse & Adjoint',
    description: 'Multiplying matrix by scalar k scales adjoint by k^(n-1).',
    gateTrap: 'Common mistake: writing k · adj(A) or kⁿ · adj(A). The correct factor is strictly k^(n-1)!'
  },
  {
    id: 'adj-identity-zero',
    title: 'Adjoint of Identity & Zero Matrices',
    formula: 'adj(I) = I  and  adj(0) = 0',
    category: 'Inverse & Adjoint',
    description: 'The identity matrix and null matrix map to themselves under adjoint.',
    gateTrap: 'For n ≥ 2, adj(0) = 0. For n = 1, adj(0) = 1.'
  },
  {
    id: 'adj-structural-preservation',
    title: 'Structural Preservation of Adjoint',
    formula: 'Symmetric ⟹ adj(A) symmetric | Diagonal ⟹ adj(A) diagonal | Triangular ⟹ adj(A) triangular',
    category: 'Inverse & Adjoint',
    description: 'Symmetry, diagonal structure, and triangular structure are preserved by the adjoint operator.',
    gateTrap: 'If A is skew-symmetric of odd order, det(A) = 0 and adj(A) is symmetric.'
  },
  {
    id: 'singular-adj-det',
    title: 'Adjoint Determinant of Singular Matrix',
    formula: 'If |A| = 0  ⟹  |adj(A)| = 0',
    category: 'Inverse & Adjoint',
    description: 'If matrix A has no inverse, its adjoint determinant is identically zero.',
    gateTrap: 'Even though |adj(A)| = 0, the matrix adj(A) itself is NOT necessarily the zero matrix (rank can be 1).'
  },
  {
    id: 'inv-product',
    title: 'Inverse Product Reversal Law',
    formula: '(AB)⁻¹ = B⁻¹ · A⁻¹  and  (ABC)⁻¹ = C⁻¹ · B⁻¹ · A⁻¹',
    category: 'Inverse & Adjoint',
    description: 'Inverting a product reverses the sequence of individual inverses.',
    gateTrap: 'Order reversal is critical. (AB)⁻¹ ≠ A⁻¹ B⁻¹.'
  },
  {
    id: 'rank-properties',
    title: 'Rank Bounds & Properties',
    formula: 'ρ(A) ≤ min(m, n) | ρ(AB) ≤ min(ρ(A), ρ(B)) | ρ(A + B) ≤ ρ(A) + ρ(B)',
    category: 'Rank',
    description: 'Rank is the number of linearly independent rows or columns.',
    gateTrap: 'Sylvester rank inequality: ρ(AB) ≥ ρ(A) + ρ(B) - k, where A is m × k and B is k × n.'
  },
  {
    id: 'symmetric-decomp',
    title: 'Unique Symmetric & Skew-Symmetric Decomposition',
    formula: 'A = ½ (A + Aᵀ) + ½ (A - Aᵀ)',
    category: 'Operations',
    description: 'Every square matrix can be uniquely decomposed into symmetric part S and skew-symmetric part K.',
    gateTrap: 'S = ½(A + Aᵀ) is always symmetric (Sᵀ = S); K = ½(A - Aᵀ) is always skew-symmetric (Kᵀ = -K).'
  }
];

export const DATA_SCIENCE_APPLICATIONS: DataScienceAppItem[] = [
  {
    id: 'tabular-data',
    title: '1. Storing Tabular Datasets (CSV & DataFrames)',
    description:
      'Every tabular dataset is represented as a design matrix X ∈ ℝ^(N × d), where each of the N rows represents an individual sample/observation (e.g., customer record) and each of the d columns represents a specific measured feature (e.g., age, income, credit score).',
    exampleSnippet: `import numpy as np\n# N = 3 samples, d = 4 features\nX = np.array([\n    [25, 55000, 720, 1],  # Customer 1\n    [34, 82000, 680, 0],  # Customer 2\n    [45, 120000, 790, 1]  # Customer 3\n])\nprint("Design Matrix Shape:", X.shape) # (3, 4)`,
    mathNotation: 'X = [x₁ᵀ; x₂ᵀ; …; xₙᵀ] ∈ ℝ^(N × d),  y ∈ ℝ^(N × 1)'
  },
  {
    id: 'ml-linear-regression',
    title: '2. Linear Regression & Gradient Descent in ML',
    description:
      'Ordinary Least Squares (OLS) expresses multiple regression predictions compactly as ŷ = Xw. The closed-form optimal weight vector is derived directly via matrix calculus: w = (XᵀX)⁻¹ Xᵀy. Gradient updates use vectorized matrix-vector products: ∇_w J = (2/N) Xᵀ(Xw - y).',
    exampleSnippet: `# Closed-form OLS normal equations\nXT_X = X.T @ X\nw_optimal = np.linalg.inv(XT_X) @ (X.T @ y)\n\n# Vectorized predictions\ny_pred = X @ w_optimal`,
    mathNotation: 'ŵ = (Xᵀ X)⁻¹ Xᵀ y  ⟹  ŷ = X ŵ'
  },
  {
    id: 'image-processing',
    title: '3. Image Processing & Computer Vision Tensors',
    description:
      'A grayscale digital image is represented directly as an H × W 2D matrix of pixel intensities in range [0, 255]. A color RGB image is a 3D tensor of shape (H, W, 3). Convolutional filters (kernels) perform sliding matrix element-wise multiplication and summation.',
    exampleSnippet: `# Grayscale 28x28 image (e.g. MNIST digit)\nimage_matrix = np.random.randint(0, 256, size=(28, 28), dtype=np.uint8)\n\n# RGB color image tensor\nrgb_tensor = np.zeros((224, 224, 3), dtype=np.float32)\nprint("Grayscale det is undefined for non-square unless H==W")`,
    mathNotation: 'I ∈ ℝ^(H × W) (Grayscale),  I_rgb ∈ ℝ^(H × W × 3) (RGB)'
  },
  {
    id: 'nlp-embeddings',
    title: '4. NLP Word & Token Embeddings (Word2Vec / BERT)',
    description:
      'In Natural Language Processing, vocabularies of V tokens are embedded into continuous d-dimensional vector spaces. The embedding layer is an embedding matrix E ∈ ℝ^(V × d). Looking up token index i is equivalent to a one-hot vector matrix product: e_i = e_hotᵀ · E.',
    exampleSnippet: `# Vocabulary of 10,000 words into 300-dim vector space\nembedding_matrix = np.random.randn(10000, 300)\n\n# Look up embedding for token ID 42\ntoken_vector = embedding_matrix[42]  # shape (300,)`,
    mathNotation: 'E ∈ ℝ^(|V| × d),  eᵢ = E[i, :]'
  },
  {
    id: 'recommender-systems',
    title: '5. Recommender Systems & Matrix Factorization (SVD)',
    description:
      'Collaborative filtering represents user interactions as a sparse User-Item rating matrix R ∈ ℝ^(M × N). Singular Value Decomposition (SVD) decomposes R ≈ U · Σ · Vᵀ or Low-Rank Factorization R ≈ P · Qᵀ into latent preference factors, predicting missing ratings to recommend movies or products.',
    exampleSnippet: `# Low-rank matrix factorization (e.g., M users, N movies, k=20 latent factors)\n# R ≈ P @ Q.T\nP = np.random.randn(1000, 20)  # User latent traits\nQ = np.random.randn(500, 20)   # Movie latent traits\npredicted_ratings = P @ Q.T     # Shape (1000, 500)`,
    mathNotation: 'R ≈ P Qᵀ,  where P ∈ ℝ^(M × k), Q ∈ ℝ^(N × k), k ≪ min(M, N)'
  }
];

export const MATRICES_MASTER_NOTES_MD = `# 📌 Master Notes: Types of Matrices, Operations, Formulas & Data Science Applications

> **GATE DA 2027 Syllabus Reference:** Section 2 — Linear Algebra (Matrices, Matrix Operations, Types, Inverses, Adjoints, Ranks & Applications)
> **External Revision Hub:** [GeeksforGeeks Introduction to Matrices](https://www.geeksforgeeks.org/maths/introduction-to-matrices/)

---

## 1. Types of Matrices
Based on the number of rows and columns present and special mathematical characteristics, [types of matrices](https://www.geeksforgeeks.org/maths/types-of-matrices/) are classified into:

- **[Row Matrix](https://www.geeksforgeeks.org/maths/row-matrix/):** A matrix that has only one row and one or more columns (Order: $1 \\times n$).
- **[Column Matrix](https://www.geeksforgeeks.org/maths/column-matrix/):** A matrix that has only one column and one or more rows (Order: $m \\times 1$).
- **Horizontal Matrix:** A matrix in which the number of rows is less than the number of columns ($m < n$).
- **Vertical Matrix:** A matrix in which the number of columns is less than the number of rows ($m > n$).
- **[Rectangular Matrix](https://www.geeksforgeeks.org/maths/rectangular-matrix/):** A matrix in which the number of rows and columns is unequal ($m \\neq n$).
- **[Square Matrix](https://www.geeksforgeeks.org/maths/square-matrix/):** A matrix in which the number of rows and columns is the same ($m = n$). Order is $n \\times n$ (or simply order $n$).
- **[Diagonal Matrix](https://www.geeksforgeeks.org/maths/diagonal-matrix/):** A square matrix in which all non-diagonal elements are zero: $a_{ij} = 0$ for all $i \\neq j$.
- **[Zero or Null Matrix](https://www.geeksforgeeks.org/maths/zero-matrix/):** A matrix whose all elements are zero. Denoted by $O$ or $0$. Rank $\\rho(O) = 0$.
- **[Unit or Identity Matrix](https://www.geeksforgeeks.org/maths/identity-matrix/):** A diagonal matrix whose diagonal elements are all $1$. Represented by $I$ or $I_n$. $AI = IA = A$.
- **[Symmetric Matrix](https://www.geeksforgeeks.org/maths/what-is-symmetric-matrix-and-skew-symmetric-matrix/):** A square matrix is said to be symmetric if the transpose of the original matrix is equal to its original matrix:
  $$A^T = A \\iff a_{ij} = a_{ji}$$
- **[Skew-Symmetric Matrix](https://www.geeksforgeeks.org/maths/what-is-symmetric-matrix-and-skew-symmetric-matrix/):** A skew-symmetric (or antisymmetric or antimetric) matrix is a square matrix whose transpose equals its negative:
  $$A^T = -A \\iff a_{ij} = -a_{ji}$$
  > ⚠️ **Critical GATE Rule:** All principal diagonal elements of a skew-symmetric matrix must be zero, because $a_{ii} = -a_{ii} \\implies 2a_{ii} = 0 \\implies a_{ii} = 0$.
  > **Theorem:** Every square matrix can be uniquely expressed as the sum of a symmetric matrix and a skew-symmetric matrix:
  > $$A = \\frac{1}{2}(A + A^T) + \\frac{1}{2}(A - A^T)$$
- **[Orthogonal Matrix](https://www.geeksforgeeks.org/maths/orthogonal-matrix/):** A matrix is said to be orthogonal if:
  $$A A^T = A^T A = I \\iff A^{-1} = A^T$$
  Eigenvalues have unit modulus ($|\\lambda| = 1$), and $\\det(A) = \\pm 1$.
- **[Idempotent Matrix](https://www.geeksforgeeks.org/maths/idempotent-matrix/):** A matrix is said to be idempotent if:
  $$A^2 = A$$
  Eigenvalues can only be $0$ or $1$. Projection matrices in statistics and regression are idempotent.
- **[Involutory Matrix](https://www.geeksforgeeks.org/maths/involutory-matrix/):** A matrix is said to be involutory if:
  $$A^2 = I \\iff A^{-1} = A$$
- **[Upper Triangular Matrix](https://www.geeksforgeeks.org/maths/triangular-matrix/):** A square matrix in which all the elements below the main diagonal are zero ($a_{ij} = 0$ for all $i > j$).
- **[Lower Triangular Matrix](https://www.geeksforgeeks.org/maths/triangular-matrix/):** A square matrix in which all the elements above the main diagonal are zero ($a_{ij} = 0$ for all $i < j$).
- **[Singular Matrix](https://www.geeksforgeeks.org/maths/singular-matrix/):** A square matrix is singular if its determinant is zero, i.e., $|A| = 0$. Has no inverse.
- **[Non-Singular Matrix](https://www.geeksforgeeks.org/maths/non-singular-matrix/):** A square matrix is non-singular if its determinant is non-zero, i.e., $|A| \\neq 0$. Invertible with full rank.

---

## 2. Determinant of a Matrix
The [determinant of a matrix](https://www.geeksforgeeks.org/problems/determinant-of-a-matrix-1587115620/1) is a numerical value associated with a square matrix. It is defined only for square matrices and is denoted by $|A|$ or $\\det(A)$. The determinant is calculated using cofactor expansion:

### Example 1: Determinant of a 2×2 Square Matrix
Let matrix $A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$:
$$|A| = ad - bc$$

### Example 2: Determinant of a 3×3 Square Matrix
Let matrix $A = \\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}$:
$$|A| = a(-1)^{1+1} \\begin{vmatrix} e & f \\\\ h & i \\end{vmatrix} + b(-1)^{1+2} \\begin{vmatrix} d & f \\\\ g & i \\end{vmatrix} + c(-1)^{1+3} \\begin{vmatrix} d & e \\\\ g & h \\end{vmatrix}$$
$$|A| = a(ei - fh) - b(di - fg) + c(dh - eg)$$

---

## 3. Minor and Cofactor of a Matrix
- **Minor of a Matrix ($M_{ij}$):** The determinant of the submatrix obtained after deleting the $i$-th row and $j$-th column to which the element belongs.
  - Example: For element $a$ ($a_{11}$) in the 3×3 matrix above:
    $$M_{11} = \\begin{vmatrix} e & f \\\\ h & i \\end{vmatrix} = ei - fh$$
- **[Cofactor of a Matrix ($C_{ij}$)](https://www.geeksforgeeks.org/dsa/minors-and-cofactors/):** Minor multiplied by the alternating sign factor $(-1)^{i+j}$:
  $$C_{ij} = (-1)^{i+j} M_{ij}$$
  Cofactor matrix:
  $$C = \\begin{bmatrix} C_{11} & C_{12} & C_{13} \\\\ C_{21} & C_{22} & C_{23} \\\\ C_{31} & C_{32} & C_{33} \\end{bmatrix}$$

---

## 4. Adjoint of a Matrix
The [adjoint of a matrix](https://www.geeksforgeeks.org/maths/adjoint-of-matrix/) is calculated for a square matrix as the **transpose of the cofactor matrix**:
$$\\text{adj}(A) = C^T$$

For $A = \\begin{bmatrix} a_1 & b_1 & c_1 \\\\ a_2 & b_2 & c_2 \\\\ a_3 & b_3 & c_3 \\end{bmatrix}$ with cofactors $[A_i, B_i, C_i]$:
$$\\text{adj}(A) = \\begin{bmatrix} A_1 & B_1 & C_1 \\\\ A_2 & B_2 & C_2 \\\\ A_3 & B_3 & C_3 \\end{bmatrix}^T = \\begin{bmatrix} A_1 & A_2 & A_3 \\\\ B_1 & B_2 & B_3 \\\\ C_1 & C_2 & C_3 \\end{bmatrix}$$

---

## 5. Inverse of a Matrix
For a square matrix $A$ of order $n$, its [inverse of a matrix](https://www.geeksforgeeks.org/maths/inverse-of-matrix/) $A^{-1}$ satisfies:
$$A \\times A^{-1} = A^{-1} \\times A = I_n$$
Formula:
$$A^{-1} = \\frac{\\text{adj}(A)}{\\det(A)} = \\frac{1}{|A|} \\text{adj}(A)$$
*(Condition: $|A| \\neq 0$, meaning matrix $A$ must be non-singular)*.

---

## 6. Elementary Operations on Matrices
[Elementary operations on matrices](https://www.geeksforgeeks.org/maths/elementary-operations-on-matrices/) are performed to solve systems of linear equations and find matrix inverses:
1. **Interchanging two rows/columns:** $R_i \\leftrightarrow R_j$ or $C_i \\leftrightarrow C_j$ (multiplies determinant by $-1$).
2. **Multiplying a row/column by a non-zero number:** $R_i \\to k R_i$ ($k \\neq 0$) (multiplies determinant by $k$).
3. **Adding a scalar multiple of another row/column:** $R_i \\to R_i + k R_j$ (leaves determinant **unchanged**!).

---

## 7. Rank of a Matrix
The [rank of a matrix](https://www.geeksforgeeks.org/maths/rank-of-matrix/) $\\rho(A)$ is the maximum number of linearly independent rows or columns:
- $\\rho(A) \\leq \\min(m, n)$.
- A square matrix $n \\times n$ has linearly independent rows/columns iff it is non-singular ($|A| \\neq 0$).
- Zero matrix has rank $0$: $\\rho(O) = 0$.
- Rank-Nullity Theorem: $\\rho(A) + \\text{Nullity}(A) = n$ (total columns).

---

## 8. Master GATE DA Matrix Formulas (Must Memorize!)
1. $A^{-1} = \\frac{\\text{adj}(A)}{|A|}$
2. $A(\\text{adj } A) = (\\text{adj } A)A = |A|I$, where $I$ is an Identity Matrix
3. $|\\text{adj } A| = |A|^{n-1}$, where $n$ is the order of matrix $A$
4. $\\text{adj}(\\text{adj } A) = |A|^{n-2} A$, where $n$ is the order of the matrix
5. $|\\text{adj}(\\text{adj } A)| = |A|^{(n-1)^2}$
6. $\\text{adj}(AB) = (\\text{adj } B)(\\text{adj } A)$ *(Reversal Law)*
7. $\\text{adj}(A^p) = (\\text{adj } A)^p$
8. $\\text{adj}(kA) = k^{n-1}(\\text{adj } A)$, where $k$ is any real number
9. $\\text{adj}(I) = I$
10. $\\text{adj}(0) = 0$
11. If $A$ is symmetric $\\implies \\text{adj}(A)$ is also symmetric
12. If $A$ is a diagonal Matrix $\\implies \\text{adj}(A)$ is also a diagonal matrix
13. If $A$ is a triangular matrix $\\implies \\text{adj}(A)$ is also a triangular matrix
14. If $A$ is a singular matrix $\\implies |\\text{adj } A| = 0$
15. $(AB)^{-1} = B^{-1} A^{-1}$ *(Inverse Reversal Law)*

---

## 9. Why Matrices Matter in Data Science
- **Efficient Data Representation:** Tabular data (datasets in CSV files or spreadsheets) can be easily stored as 2D matrices.
- **Foundation for ML Models:** Algorithms like linear regression, neural networks, and PCA fundamentally use matrix operations.
- **Vectorized Computation:** Libraries like NumPy, TensorFlow, and PyTorch use matrix operations to speed up calculations using hardware acceleration (CPU/GPU).
- **Multivariate Data:** Datasets with multiple features per observation are naturally represented as matrices.

### Common Uses of Matrices in Data Science:
1. **Storing Datasets:** Each row is an observation (e.g., a customer), and each column is a feature (e.g., age, income).
2. **Linear Algebra in Machine Learning:**
   - Matrix multiplication in linear regression: $y = Xw$
   - Gradient calculation in optimization: $\\nabla_w J = \\frac{2}{N} X^T (Xw - y)$
   - Transformation and projection in dimensionality reduction (e.g., PCA covariance $C = \\frac{1}{N} X^T X$)
3. **Image Processing:** Images are represented as matrices (grayscale $H \\times W$) or tensors (color RGB images $H \\times W \\times 3$), where each pixel is an intensity value.
4. **Natural Language Processing (NLP):** Matrices represent word embeddings or sentence vectors (e.g., Word2Vec embedding matrix $E \\in \\mathbb{R}^{V \\times d}$).
5. **Recommender Systems:** A user-item matrix $R \\in \\mathbb{R}^{M \\times N}$ stores preferences, factorized via matrix factorization (SVD: $R \\approx U \\Sigma V^T$) for collaborative filtering.

---

## 10. Practice & Solved Examples
- ➢ **Practice:** [Solved Examples on Matrices](https://www.geeksforgeeks.org/maths/practice-questions-on-matrices/)
`;
