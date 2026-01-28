'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateInvoiceItemsAction } from './items-actions'

type Item = {
  id: string
  name: string
  description?: string
  quantity: number
  unit_price: number
  unit_label?: string
}

export function EditInvoiceItemsDialog({
  invoiceId,
  currency,
  initialItems,
  disabled,
}: {
  invoiceId: string
  currency: string
  initialItems: Array<{
    id?: string
    name: string
    description?: string | null
    quantity: number
    unit_price: number
    unit_label?: string | null
    service_id?: string | null
    type?: string | null
  }>
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [items, setItems] = useState<Item[]>(
    (initialItems?.length ? initialItems : []).map((it, idx) => ({
      id: it.id || `row-${idx}-${Date.now()}`,
      name: it.name || '',
      description: it.description || '',
      quantity: Number(it.quantity) || 1,
      unit_price: Number(it.unit_price) || 0,
      unit_label: it.unit_label || 'unit',
    }))
  )

  const total = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0),
    [items]
  )

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        unit_label: 'unit',
      },
    ])
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const update = (id: string, patch: Partial<Item>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  const handleSave = async () => {
    if (items.length === 0) {
      toast.error('Add at least one item.')
      return
    }
    if (items.some((i) => !i.name || i.quantity <= 0 || i.unit_price < 0)) {
      toast.error('Please fill item name, quantity, and unit price.')
      return
    }

    setIsSaving(true)
    const result = await updateInvoiceItemsAction(
      invoiceId,
      items.map((i) => ({
        name: i.name,
        description: i.description || null,
        quantity: Number(i.quantity) || 0,
        unit_price: Number(i.unit_price) || 0,
        unit_label: i.unit_label || null,
        type: 'item',
      }))
    )
    setIsSaving(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success('Invoice items updated')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit items
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit invoice items</DialogTitle>
          <DialogDescription>Update line items and totals.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Items</Label>
            <Button type="button" size="sm" variant="outline" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add item
            </Button>
          </div>

          <ScrollArea className="max-h-[360px] pr-2">
            <div className="border rounded-lg divide-y">
              {items.map((it) => (
                <div key={it.id} className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 grid gap-2 md:grid-cols-2">
                      <Input
                        placeholder="Name"
                        value={it.name}
                        onChange={(e) => update(it.id, { name: e.target.value })}
                      />
                      <Input
                        placeholder="Description (optional)"
                        value={it.description || ''}
                        onChange={(e) => update(it.id, { description: e.target.value })}
                      />
                    </div>
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeItem(it.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Qty"
                      value={it.quantity}
                      onChange={(e) => update(it.id, { quantity: Number(e.target.value) || 0 })}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={`Unit price (${currency})`}
                      value={it.unit_price}
                      onChange={(e) => update(it.id, { unit_price: Number(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="text-xs text-muted-foreground flex justify-end">
                    Line total: {currency} {(Number(it.quantity) * Number(it.unit_price)).toFixed(2)}
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">No items yet.</div>
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-end pt-2 border-t">
            <div className="text-base font-semibold">
              Total: {currency} {total.toFixed(2)}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

