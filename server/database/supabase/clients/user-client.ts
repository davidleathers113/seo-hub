import { BaseSupabaseClient } from '../base-client'
import { User } from '../../../types/user'

export class UserClient extends BaseSupabaseClient {
  async findUsers(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select()

    if (error) return this.handleError(error, 'findUsers')
    return data
  }

  async findUserById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select()
      .eq('id', id)
      .single()

    if (error) return this.handleError(error, 'findUserById')
    return data
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select()
      .eq('email', email)
      .single()

    if (error) return this.handleError(error, 'findUserByEmail')
    return data
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert([user])
      .select()
      .single()

    if (error) return this.handleError(error, 'createUser')
    return data
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .update(user)
      .eq('id', id)
      .select()
      .single()

    if (error) return this.handleError(error, 'updateUser')
    return data
  }

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) return this.handleError(error, 'deleteUser')
    return true
  }
}