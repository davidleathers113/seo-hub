export interface SEOMetrics {
  readabilityScore: number;
  keywordDensity: number;
  contentLength: number;
  headingStructure: HeadingAnalysis;
  metaTagsQuality: MetaTagsAnalysis;
  internalLinks: number;
  externalLinks: number;
  imageOptimization: ImageAnalysis;
}

export interface HeadingAnalysis {
  h1Count: number;
  h2Count: number;
  h3Count: number;
  structure: 'good' | 'needs_improvement' | 'poor';
  suggestions: string[];
}

export interface MetaTagsAnalysis {
  title: {
    length: number;
    hasKeyword: boolean;
    score: number;
  };
  description: {
    length: number;
    hasKeyword: boolean;
    score: number;
  };
}

export interface ImageAnalysis {
  count: number;
  withAlt: number;
  optimized: number;
  score: number;
}

export interface SEOValidationResult {
  overallScore: number;
  metrics: SEOMetrics;
  recommendations: string[];
  criticalIssues: string[];
  improvements: string[];
}