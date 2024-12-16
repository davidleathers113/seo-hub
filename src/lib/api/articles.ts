import { Database } from '@/types/database';

type Article = Database['public']['Tables']['articles']['Row'];
type ArticleInsert = Database['public']['Tables']['articles']['Insert'];
type ArticleUpdate = Database['public']['Tables']['articles']['Update'];
type Outline = Database['public']['Tables']['outlines']['Row'];
type OutlineInsert = Database['public']['Tables']['outlines']['Insert'];
type OutlineUpdate = Database['public']['Tables']['outlines']['Update'];

// Article functions
export async function getArticles() {
  const response = await fetch('/api/articles', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch articles: ${response.statusText}`);
  }

  return response.json() as Promise<Article[]>;
}

export async function getArticleById(id: string) {
  const response = await fetch(`/api/articles/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch article: ${response.statusText}`);
  }

  return response.json() as Promise<Article>;
}

export async function createArticle(article: ArticleInsert) {
  const response = await fetch('/api/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(article),
  });

  if (!response.ok) {
    throw new Error(`Failed to create article: ${response.statusText}`);
  }

  return response.json() as Promise<Article>;
}

export async function updateArticle(id: string, article: ArticleUpdate) {
  const response = await fetch(`/api/articles/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(article),
  });

  if (!response.ok) {
    throw new Error(`Failed to update article: ${response.statusText}`);
  }

  return response.json() as Promise<Article>;
}

export async function deleteArticle(id: string) {
  const response = await fetch(`/api/articles/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete article: ${response.statusText}`);
  }

  return response.json();
}

// Outline functions
export async function getOutline(articleId: string) {
  const response = await fetch(`/api/articles/${articleId}/outline`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch outline: ${response.statusText}`);
  }

  return response.json() as Promise<Outline>;
}

export async function createOutline(articleId: string, outline: OutlineInsert) {
  const response = await fetch(`/api/articles/${articleId}/outline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(outline),
  });

  if (!response.ok) {
    throw new Error(`Failed to create outline: ${response.statusText}`);
  }

  return response.json() as Promise<Outline>;
}

export async function updateOutline(articleId: string, outline: OutlineUpdate) {
  const response = await fetch(`/api/articles/${articleId}/outline`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(outline),
  });

  if (!response.ok) {
    throw new Error(`Failed to update outline: ${response.statusText}`);
  }

  return response.json() as Promise<Outline>;
}

export async function generateOutline(articleId: string) {
  const response = await fetch(`/api/articles/${articleId}/outline/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to generate outline: ${response.statusText}`);
  }

  return response.json() as Promise<Outline>;
}