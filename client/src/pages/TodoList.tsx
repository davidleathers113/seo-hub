import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { toast } from '../components/ui/use-toast'
import { Checkbox } from '../components/ui/checkbox'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Loader2, Plus, Trash2 } from 'lucide-react'

interface Todo {
  id: string
  user_id: string
  task: string
  is_complete: boolean
  inserted_at: string
}

export default function TodoList() {
  const { user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTask, setNewTask] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorText, setErrorText] = useState('')

  useEffect(() => {
    if (user) {
      fetchTodos()
    }
  }, [user])

  const fetchTodos = async () => {
    try {
      setIsLoading(true)
      setErrorText('')

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('inserted_at', { ascending: false })

      if (error) {
        throw error
      }

      setTodos(data || [])
    } catch (error) {
      console.error('Error fetching todos:', error)
      toast({
        variant: "destructive",
        title: "Error fetching todos",
        description: "Please try again later."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user) return

    if (newTask.trim().length <= 0) {
      setErrorText('Todo cannot be empty')
      return
    }

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ task: newTask.trim(), user_id: user.id }])
        .select()
        .single()

      if (error) {
        throw error
      }

      setTodos([data, ...todos])
      setNewTask('')
      toast({
        title: "Todo added",
        description: "Your todo has been added successfully."
      })
    } catch (error) {
      console.error('Error adding todo:', error)
      toast({
        variant: "destructive",
        title: "Error adding todo",
        description: "Please try again later."
      })
    }
  }

  const toggleTodo = async (id: string, is_complete: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_complete })
        .eq('id', id)

      if (error) {
        throw error
      }

      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, is_complete } : todo
      ))
    } catch (error) {
      console.error('Error updating todo:', error)
      toast({
        variant: "destructive",
        title: "Error updating todo",
        description: "Please try again later."
      })
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      setTodos(todos.filter(todo => todo.id !== id))
      toast({
        title: "Todo deleted",
        description: "Your todo has been deleted successfully."
      })
    } catch (error) {
      console.error('Error deleting todo:', error)
      toast({
        variant: "destructive",
        title: "Error deleting todo",
        description: "Please try again later."
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Todo List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todo List</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={addTodo} className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Add a new todo..."
            value={newTask}
            onChange={(e) => {
              setErrorText('')
              setNewTask(e.target.value)
            }}
            aria-label="Add new todo"
          />
          <Button type="submit" disabled={!newTask.trim()}>
            <Plus className="h-4 w-4" />
            <span className="ml-2">Add</span>
          </Button>
        </form>

        {errorText && (
          <div className="text-red-500 text-sm mb-4">{errorText}</div>
        )}

        {todos.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            You don't have any todos yet. Create one to get started.
          </p>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 group"
              >
                <Checkbox
                  checked={todo.is_complete}
                  onCheckedChange={(checked) => toggleTodo(todo.id, checked as boolean)}
                />
                <span className={`flex-1 ${todo.is_complete ? 'line-through text-muted-foreground' : ''}`}>
                  {todo.task}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}