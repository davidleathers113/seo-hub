import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

export interface EdgeFunctionResponse {
  status: number
  body: any
}

export interface EdgeFunctionContext {
  env: {
    OPENROUTER_API_KEY: string
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
  }
}

export type EdgeFunction = (req: Request, ctx: EdgeFunctionContext) => Promise<Response>

export interface RequestWithBody<T> extends Request {
  json(): Promise<T>;
}

export interface ErrorResponse {
  error: string;
}

export interface SuccessResponse<T> {
  data: T;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface OutlineRequestBody {
  articleId: string;
  title: string;
  description: string;
  keywords: string[];
}

export interface SubpillarsRequestBody {
  pillarId: string;
  title: string;
  description: string;
  niche: string;
}

export interface KeywordResearchRequestBody {
  query: string;
  niche: string;
}

export interface CompetitorAnalysisRequestBody {
  url: string;
  niche: string;
}

export interface ContentSuggestionsRequestBody {
  niche: string;
  keywords: string[];
  competitors: string[];
}