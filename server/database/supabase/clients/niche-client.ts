import { BaseSupabaseClient } from '../base-client'
import { Niche } from '../../../types/niche'

export class NicheClient extends BaseSupabaseClient {
  async createNiche(niche: Omit<Niche, 'id'>): Promise<Niche> {
    const { data, error } = await this.supabase
      .from('niches')
      .insert([niche])
      .select()
      .single()

    if (error) return this.handleError(error, 'createNiche')
    return data
  }

  async findNicheById(id: string): Promise<Niche | null> {
    const { data, error } = await this.supabase
      .from('niches')
      .select()
      .eq('id', id)
      .single()

    if (error) return this.handleError(error, 'findNicheById')
    return data
  }

  async findNichesByUserId(userId: string): Promise<Niche[]> {
    const { data, error } = await this.supabase
      .from('niches')
      .select()
      .eq('user_id', userId)

    if (error) return this.handleError(error, 'findNichesByUserId')
    return data
  }

  async updateNiche(id: string, niche: Partial<Niche>): Promise<Niche | null> {
    const { data, error } = await this.supabase
      .from('niches')
      .update(niche)
      .eq('id', id)
      .select()
      .single()

    if (error) return this.handleError(error, 'updateNiche')
    return data
  }

  async deleteNiche(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('niches')
      .delete()
      .eq('id', id)

    if (error) return this.handleError(error, 'deleteNiche')
    return true
  }
}