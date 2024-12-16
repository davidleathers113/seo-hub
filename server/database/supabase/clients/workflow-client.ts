import { BaseSupabaseClient } from '../base-client'
import { IWorkflowClient } from '../../interfaces/workflow'
import { Niche, Pillar, Article, Research, Outline } from '../../types'

export class WorkflowClient extends BaseSupabaseClient implements IWorkflowClient {
  async createWorkflowForNiche(nicheId: string, userId: string): Promise<void> {
    const { error } = await this.supabase.rpc('create_workflow_for_niche', {
      p_niche_id: nicheId,
      p_user_id: userId
    })

    if (error) return this.handleError(error, 'createWorkflowForNiche')
  }

  async getWorkflowStatus(nicheId: string): Promise<{
    niche: Niche;
    pillars: Pillar[];
    articles: Article[];
    research: Research[];
    outlines: Outline[];
  }> {
    const { data: niche, error: nicheError } = await this.supabase
      .from('niches')
      .select()
      .eq('id', nicheId)
      .single()

    if (nicheError) return this.handleError(nicheError, 'getWorkflowStatus - niche')

    const { data: pillars, error: pillarsError } = await this.supabase
      .from('pillars')
      .select()
      .eq('niche_id', nicheId)

    if (pillarsError) return this.handleError(pillarsError, 'getWorkflowStatus - pillars')

    const { data: articles, error: articlesError } = await this.supabase
      .from('articles')
      .select(`
        *,
        pillar:pillars(id)
      `)
      .in('pillar_id', pillars.map(p => p.id))

    if (articlesError) return this.handleError(articlesError, 'getWorkflowStatus - articles')

    const { data: research, error: researchError } = await this.supabase
      .from('research')
      .select(`
        *,
        article:articles(id)
      `)
      .in('article_id', articles.map(a => a.id))

    if (researchError) return this.handleError(researchError, 'getWorkflowStatus - research')

    const { data: outlines, error: outlinesError } = await this.supabase
      .from('outlines')
      .select(`
        *,
        article:articles(id)
      `)
      .in('article_id', articles.map(a => a.id))

    if (outlinesError) return this.handleError(outlinesError, 'getWorkflowStatus - outlines')

    return {
      niche,
      pillars,
      articles,
      research,
      outlines
    }
  }

  async updateWorkflowStatus(
    nicheId: string,
    status: string,
    progress: number
  ): Promise<void> {
    const { error } = await this.supabase
      .from('niches')
      .update({ status, progress })
      .eq('id', nicheId)

    if (error) return this.handleError(error, 'updateWorkflowStatus')
  }

  async getWorkflowProgress(nicheId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
  }> {
    const { data, error } = await this.supabase.rpc('get_workflow_progress', {
      p_niche_id: nicheId
    })

    if (error) return this.handleError(error, 'getWorkflowProgress')

    return {
      total: data.total,
      completed: data.completed,
      inProgress: data.in_progress
    }
  }

  async getWorkflowTimeline(nicheId: string): Promise<{
    createdAt: string;
    lastUpdated: string;
    estimatedCompletion: string;
  }> {
    const { data, error } = await this.supabase
      .from('niches')
      .select('created_at, updated_at, estimated_completion')
      .eq('id', nicheId)
      .single()

    if (error) return this.handleError(error, 'getWorkflowTimeline')

    return {
      createdAt: data.created_at,
      lastUpdated: data.updated_at,
      estimatedCompletion: data.estimated_completion
    }
  }
}