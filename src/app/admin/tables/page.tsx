'use client'

import { useState, useCallback, memo } from 'react'
import {
  useTables,
  useCreateTable,
  useUpdateTable,
  useDeleteTable,
} from '@/hooks/use-tables'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tableSchema, type TableFormData } from '@/lib/validations/table'

type Table = {
  id: string
  number: number
  seats: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'
  _count?: {
    orders: number
  }
}

const TableCard = memo(
  ({
    table,
    onEdit,
    onDelete,
  }: {
    table: Table
    onEdit: (table: Table) => void
    onDelete: (table: Table) => void
  }) => {
    const statusColors = {
      AVAILABLE: 'default',
      OCCUPIED: 'destructive',
      RESERVED: 'secondary',
    } as const

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Table {table.number}</CardTitle>
            <Badge variant={statusColors[table.status]}>{table.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Seats: {table.seats}
            </p>
            {table._count && table._count.orders > 0 && (
              <p className="text-sm text-muted-foreground">
                Orders: {table._count.orders}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(table)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(table)}
                disabled={!!table._count?.orders}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)

TableCard.displayName = 'TableCard'

export default function TablesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [deletingTable, setDeletingTable] = useState<Table | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: tables, isLoading } = useTables(
    statusFilter === 'all' ? '' : statusFilter
  )
  const createMutation = useCreateTable()
  const updateMutation = useUpdateTable()
  const deleteMutation = useDeleteTable()

  const form = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      number: 1,
      seats: 4,
      status: 'AVAILABLE',
    },
  })

  const statusValue = useWatch({
    control: form.control,
    name: 'status',
  })

  const handleOpenDialog = useCallback(
    (table?: Table) => {
      if (table) {
        setEditingTable(table)
        form.reset({
          number: table.number,
          seats: table.seats,
          status: table.status,
        })
      } else {
        setEditingTable(null)
        form.reset({
          number: (tables?.length || 0) + 1,
          seats: 4,
          status: 'AVAILABLE',
        })
      }
      setDialogOpen(true)
    },
    [form, tables]
  )

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false)
    setEditingTable(null)
    form.reset()
  }, [form])

  const handleSubmit = form.handleSubmit(async (data: TableFormData) => {
    if (editingTable) {
      await updateMutation.mutateAsync({ id: editingTable.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
    handleCloseDialog()
  })

  const handleDelete = useCallback(async () => {
    if (deletingTable) {
      await deleteMutation.mutateAsync(deletingTable.id)
      setDeletingTable(null)
    }
  }, [deletingTable, deleteMutation])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading tables...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tables</h1>
          <p className="text-muted-foreground">
            Manage restaurant tables and seating
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Table
        </Button>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-50">
            <SelectValue placeholder="All Tables" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tables</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="OCCUPIED">Occupied</SelectItem>
            <SelectItem value="RESERVED">Reserved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tables?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-96">
            <p className="text-muted-foreground mb-4">
              No tables found. Create your first table to get started.
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Table
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables?.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onEdit={handleOpenDialog}
              onDelete={setDeletingTable}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTable ? 'Edit Table' : 'Create Table'}
            </DialogTitle>
            <DialogDescription>
              {editingTable
                ? 'Update table information below.'
                : 'Add a new table to your restaurant.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="number">Table Number</Label>
              <Input
                id="number"
                type="number"
                {...form.register('number', { valueAsNumber: true })}
                placeholder="1"
              />
              {form.formState.errors.number && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.number.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="seats">Number of Seats</Label>
              <Input
                id="seats"
                type="number"
                {...form.register('seats', { valueAsNumber: true })}
                placeholder="4"
              />
              {form.formState.errors.seats && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.seats.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={statusValue}
                onValueChange={(value) => form.setValue('status', value as 'AVAILABLE' | 'OCCUPIED' | 'RESERVED')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="OCCUPIED">Occupied</SelectItem>
                  <SelectItem value="RESERVED">Reserved</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingTable ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingTable}
        onOpenChange={() => setDeletingTable(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete Table {deletingTable?.number}. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
