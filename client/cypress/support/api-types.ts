export interface BaseResponse<T> {
  data: T;
  error?: string;
  details?: string;
}

export type AuthData = {
  token: string;
  user: {
    _id: string;
    email: string;
  };
};

export type NicheData = {
  _id: string;
  name: string;
  createdBy: string;
  status: 'pending' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
};

export type PillarData = {
  _id: string;
  title: string;
  niche: string;
  createdBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
};

export type SubpillarData = {
  _id: string;
  title: string;
  description?: string;
  pillar: string;
  createdBy: string;
  status: 'research' | 'outline' | 'draft' | 'complete';
  progress: number;
  createdAt: string;
  updatedAt: string;
};

export type ResearchData = {
  _id: string;
  content: string;
  source: string;
  subpillar: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type OutlineData = {
  _id: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  subpillar: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ContentPointsData = {
  _id: string;
  points: Array<{
    title: string;
    content: string;
    keywords: string[];
  }>;
  subpillar: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ArticleData = {
  _id: string;
  title: string;
  content: string;
  subpillar: string;
  createdBy: string;
  status: 'draft' | 'review' | 'published';
  seoScore: number;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = BaseResponse<AuthData>;
export type NicheResponse = BaseResponse<NicheData>;
export type PillarResponse = BaseResponse<PillarData[]>;
export type SubpillarResponse = BaseResponse<SubpillarData[]>;
export type ResearchResponse = BaseResponse<ResearchData>;
export type OutlineResponse = BaseResponse<OutlineData>;
export type ContentPointsResponse = BaseResponse<ContentPointsData>;
export type ArticleResponse = BaseResponse<ArticleData>;