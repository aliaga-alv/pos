import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type Table = {
  id: string
  number: number
  seats: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'
  createdAt: string
  updatedAt: string
  _count?: {
    orders: number
  }
}

type CreateTableData = {
  number: number
  seats: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'
}

type UpdateTableData = CreateTableData

export function useTables(status?: string) {
  return useQuery({
    queryKey: ['tables', status],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status) {
        params.set('status', status)
      }
      const url = `/api/tables${params.toString() ? `?${params}` : ''}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch tables')
      const data = await res.json()
      return data.tables as Table[]
    },
  })
}

export function useTable(id: string) {
  return useQuery({
    queryKey: ['table', id],
    queryFn: async () => {
      const res = await fetch(`/api/tables/${id}`)
      if (!res.ok) throw new Error('Failed to fetch table')
      return res.json() as Promise<Table>
    },
    enabled: !!id,
  })
}

export function useCreateTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTableData) => {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create table')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Table created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTableData }) => {
      const res = await fetch(`/api/tables/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update table')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      queryClient.invalidateQueries({ queryKey: ['table', variables.id] })
      toast.success('Table updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tables/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete table')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Table deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
