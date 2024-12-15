import { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseClient, User, Niche, Pillar, Subpillar, Article, Research, Outline, Session, PaginationOptions, NicheFilters, PillarFilters, SubpillarFilters, ArticleFilters } from '../interfaces';
import { logger } from '../../utils/log';

const log = logger('supabase-client');

export class SupabaseDBClient implements DatabaseClient {
  constructor(private supabase: SupabaseClient) {}

  async connect(): Promise<void> {
    // Connection is handled by the Supabase client
  }

  async disconnect(): Promise<void> {
    // Cleanup handled by Supabase client
  }

  async healthCheck(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.from('users').select('count').single();
      return !error;
    } catch {
      return false;
    }
  }

  async ping(): Promise<boolean> {
    return this.healthCheck();
  }

  // User operations
  async findUsers(): Promise<User[]> {
    const { data, error } = await this.supabase.from('users').select('*');
    if (error) throw error;
    return data;
  }

  async findUserById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error) return null;
    return data;
  }

  async findUserByToken(token: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('token', token)
      .single();
    if (error) return null;
    return data;
  }

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const { data: user, error } = await this.supabase
      .from('users')
      .insert([{ ...data, createdAt: new Date(), updatedAt: new Date() }])
      .select()
      .single();
    if (error) throw error;
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const { data: user, error } = await this.supabase
      .from('users')
      .update({ ...data, updatedAt: new Date() })
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await this.supabase.from('users').delete().eq('id', id);
    return !error;
  }

  // Niche operations
  async createNiche(data: Omit<Niche, 'id' | 'createdAt' | 'updatedAt'>): Promise<Niche> {
    const { data: niche, error } = await this.supabase
      .from('niches')
      .insert([{ ...data, createdAt: new Date(), updatedAt: new Date() }])
      .select()
      .single();
    if (error) throw error;
    return niche;
  }

  async findNicheById(id: string): Promise<Niche | null> {
    const { data, error } = await this.supabase
      .from('niches')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }

  async findNichesByUserId(userId: string): Promise<Niche[]> {
    const { data, error } = await this.supabase
      .from('niches')
      .select('*')
      .eq('userId', userId);
    if (error) throw error;
    return data;
  }

  async updateNiche(id: string, data: Partial<Niche>): Promise<Niche | null> {
    const { data: niche, error } = await this.supabase
      .from('niches')
      .update({ ...data, updatedAt: new Date() })
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return niche;
  }

  async deleteNiche(id: string): Promise<boolean> {
    const { error } = await this.supabase.from('niches').delete().eq('id', id);
    return !error;
  }

  async findNiches(filters: NicheFilters, options?: PaginationOptions): Promise<Niche[]> {
    let query = this.supabase.from('niches').select('*');

    if (filters.userId) {
      query = query.eq('userId', filters.userId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (options?.sortBy) {
      query = query.order(options.sortBy, {
        ascending: options.sortOrder === 'asc'
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.page && options?.limit) {
      query = query.range(
        (options.page - 1) * options.limit,
        options.page * options.limit - 1
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Pillar operations
  async createPillar(data: Omit<Pillar, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pillar> {
    const { data: pillar, error } = await this.supabase
      .from('pillars')
      .insert([{ ...data, createdAt: new Date(), updatedAt: new Date() }])
      .select()
      .single();
    if (error) throw error;
    return pillar;
  }

  async findPillarById(id: string): Promise<Pillar | null> {
    const { data, error } = await this.supabase
      .from('pillars')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }

  async findPillarsByNicheId(nicheId: string): Promise<Pillar[]> {
    const { data, error } = await this.supabase
      .from('pillars')
      .select('*')
      .eq('nicheId', nicheId);
    if (error) throw error;
    return data;
  }

  async updatePillar(id: string, data: Partial<Pillar>): Promise<Pillar | null> {
    const { data: pillar, error } = await this.supabase
      .from('pillars')
      .update({ ...data, updatedAt: new Date() })
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return pillar;
  }

  async deletePillar(id: string): Promise<boolean> {
    const { error } = await this.supabase.from('pillars').delete().eq('id', id);
    return !error;
  }

  async findPillars(filters: PillarFilters, options?: PaginationOptions): Promise<Pillar[]> {
    let query = this.supabase.from('pillars').select('*');

    if (filters.nicheId) {
      query = query.eq('nicheId', filters.nicheId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.createdById) {
      query = query.eq('createdById', filters.createdById);
    }

    if (options?.sortBy) {
      query = query.order(options.sortBy, {
        ascending: options.sortOrder === 'asc'
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Subpillar operations
  async createSubpillar(data: Omit<Subpillar, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subpillar> {
    const { data: subpillar, error } = await this.supabase
      .from('subpillars')
      .insert([{ ...data, createdAt: new Date(), updatedAt: new Date() }])
      .select()
      .single();
    if (error) throw error;
    return subpillar;
  }

  async findSubpillarById(id: string): Promise<Subpillar | null> {
    const { data, error } = await this.supabase
      .from('subpillars')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }

  async findSubpillarsByPillarId(pillarId: string): Promise<Subpillar[]> {
    const { data, error } = await this.supabase
      .from('subpillars')
      .select('*')
      .eq('pillarId', pillarId);
    if (error) throw error;
    return data;
  }

  async updateSubpillar(id: string, data: Partial<Subpillar>): Promise<Subpillar | null> {
    const { data: subpillar, error } = await this.supabase
      .from('subpillars')
      .update({ ...data, updatedAt: new Date() })
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return subpillar;
  }

  async deleteSubpillar(id: string): Promise<boolean> {
    const { error } = await this.supabase.from('subpillars').delete().eq('id', id);
    return !error;
  }

  async findSubpillars(filters: SubpillarFilters, options?: PaginationOptions): Promise<Subpillar[]> {
    let query = this.supabase.from('subpillars').select('*');

    if (filters.pillarId) {
      query = query.eq('pillarId', filters.pillarId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.createdById) {
      query = query.eq('createdById', filters.createdById);
    }

    if (options?.sortBy) {
      query = query.order(options.sortBy, {
        ascending: options.sortOrder === 'asc'
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Article operations
  async createArticle(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> {
    const { data: article, error } = await this.supabase
      .from('articles')
      .insert([{ ...data, createdAt: new Date(), updatedAt: new Date() }])
      .select()
      .single();
    if (error) throw error;
    return article;
  }

  async findArticleById(id: string): Promise<Article | null> {
    const { data, error } = await this.supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }

  async findArticlesBySubpillarId(subpillarId: string): Promise<Article[]> {
    const { data, error } = await this.supabase
      .from('articles')
      .select('*')
      .eq('subpillarId', subpillarId);
    if (error) throw error;
    return data;
  }

  async updateArticle(id: string, data: Partial<Article>): Promise<Article | null> {
    const { data: article, error } = await this.supabase
      .from('articles')
      .update({ ...data, updatedAt: new Date() })
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return article;
  }

  async deleteArticle(id: string): Promise<boolean> {
    const { error } = await this.supabase.from('articles').delete().eq('id', id);
    return !error;
  }

  async findArticles(filters: ArticleFilters, options?: PaginationOptions): Promise<Article[]> {
    let query = this.supabase.from('articles').select('*');

    if (filters.subpillarId) {
      query = query.eq('subpillarId', filters.subpillarId);
    }
    if (filters.authorId) {
      query = query.eq('authorId', filters.authorId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (options?.sortBy) {
      query = query.order(options.sortBy, {
        ascending: options.sortOrder === 'asc'
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Research operations
  async createResearch(data: Omit<Research, 'id' | 'createdAt' | 'updatedAt'>): Promise<Research> {
    const { data: research, error } = await this.supabase
      .from('research')
      .insert([{ ...data, createdAt: new Date(), updatedAt: new Date() }])
      .select()
      .single();
    if (error) throw error;
    return research;
  }

  async findResearchById(id: string): Promise<Research | null> {
    const { data, error } = await this.supabase
      .from('research')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }

  async findResearchBySubpillarId(subpillarId: string): Promise<Research[]> {
    const { data, error } = await this.supabase
      .from('research')
      .select('*')
      .eq('subpillarId', subpillarId);
    if (error) throw error;
    return data;
  }

  async updateResearch(id: string, data: Partial<Research>): Promise<Research | null> {
    const { data: research, error } = await this.supabase
      .from('research')
      .update({ ...data, updatedAt: new Date() })
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return research;
  }

  async deleteResearch(id: string): Promise<boolean> {
    const { error } = await this.supabase.from('research').delete().eq('id', id);
    return !error;
  }

  // Outline operations
  async createOutline(data: Omit<Outline, 'id' | 'createdAt' | 'updatedAt'>): Promise<Outline> {
    const { data: outline, error } = await this.supabase
      .from('outlines')
      .insert([{ ...data, createdAt: new Date(), updatedAt: new Date() }])
      .select()
      .single();
    if (error) throw error;
    return outline;
  }

  async findOutlineById(id: string): Promise<Outline | null> {
    const { data, error } = await this.supabase
      .from('outlines')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }

  async findOutlineBySubpillarId(subpillarId: string): Promise<Outline | null> {
    const { data, error } = await this.supabase
      .from('outlines')
      .select('*')
      .eq('subpillarId', subpillarId)
      .single();
    if (error) return null;
    return data;
  }

  async updateOutline(id: string, data: Partial<Outline>): Promise<Outline | null> {
    const { data: outline, error } = await this.supabase
      .from('outlines')
      .update({ ...data, updatedAt: new Date() })
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return outline;
  }

  async deleteOutline(id: string): Promise<boolean> {
    const { error } = await this.supabase.from('outlines').delete().eq('id', id);
    return !error;
  }

  // Session operations
  async createSession(data: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> {
    const { data: session, error } = await this.supabase
      .from('sessions')
      .insert([{ ...data, createdAt: new Date(), updatedAt: new Date() }])
      .select()
      .single();
    if (error) throw error;
    return session;
  }

  async findSessionById(id: string): Promise<Session | null> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }

  async findSessionByToken(token: string): Promise<Session | null> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('token', token)
      .single();
    if (error) return null;
    return data;
  }

  async findSessionsByUserId(userId: string): Promise<Session[]> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('userId', userId);
    if (error) throw error;
    return data;
  }

  async updateSession(id: string, data: Partial<Session>): Promise<Session | null> {
    const { data: session, error } = await this.supabase
      .from('sessions')
      .update({ ...data, updatedAt: new Date() })
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return session;
  }

  async deleteSession(id: string): Promise<boolean> {
    const { error } = await this.supabase.from('sessions').delete().eq('id', id);
    return !error;
  }

  async deleteExpiredSessions(): Promise<number> {
    const { error, count } = await this.supabase
      .from('sessions')
      .delete()
      .lt('expiresAt', new Date());
    if (error) throw error;
    return count ?? 0;
  }

  async deleteUserSessions(userId: string): Promise<number> {
    const { error, count } = await this.supabase
      .from('sessions')
      .delete()
      .eq('userId', userId);
    if (error) throw error;
    return count ?? 0;
  }

  async cleanupSessions(): Promise<void> {
    await this.deleteExpiredSessions();
  }
}
