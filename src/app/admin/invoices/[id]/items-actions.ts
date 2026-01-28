'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type UpsertItem = {
  id?: string
  type?: string
  name: string
  description?: string | null
  service_id?: string | null
  quantity: number
  unit_label?: string | null
  unit_price: number
}

export async function updateInvoiceItemsAction(invoiceId: string, items: UpsertItem[]) {
  const supabase = await createClient()

  if (!invoiceId) return { error: 'Missing invoiceId' }
  if (!items || items.length === 0) return { error: 'At least one item is required' }

  // 1) Replace items (simple + deterministic)
  const { error: deleteError } = await supabase
    .from('invoice_items')
    .delete()
    .eq('invoice_id', invoiceId)
  if (deleteError) return { error: deleteError.message }

  const normalized = items.map((it, idx) => {
    const quantity = Number(it.quantity) || 0
    const unitPrice = Number(it.unit_price) || 0
    const subtotal = quantity * unitPrice
    return {
      invoice_id: invoiceId,
      position: idx + 1,
      type: it.type || (it.service_id ? 'service' : 'item'),
      name: it.name || 'Item',
      description: it.description || null,
      service_id: it.service_id || null,
      quantity,
      unit_label: it.unit_label || null,
      unit_price: unitPrice,
      discount_percent: null,
      tax_rate_percent: null,
      line_subtotal: subtotal,
      line_discount_amount: null,
      line_tax_amount: 0,
      line_total: subtotal,
    }
  })

  const { error: insertError } = await supabase.from('invoice_items').insert(normalized)
  if (insertError) return { error: insertError.message }

  // 2) Sync invoice totals from items (no tax/discount for now)
  const total = normalized.reduce((sum, it) => sum + (Number(it.line_total) || 0), 0)
  const { error: invError } = await supabase
    .from('invoices')
    .update({
      amount: total,
      net_amount: total,
      gross_amount: total,
    })
    .eq('id', invoiceId)
  if (invError) return { error: invError.message }

  revalidatePath(`/admin/invoices/${invoiceId}`)
  revalidatePath('/admin/invoices')
  return { success: true }
}

