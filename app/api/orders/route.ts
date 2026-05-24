import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { items, shipping, total, shipping_address, buyer_id, seller_id } = await req.json()

    // Create order for the first item
    const item = items[0]
    
    const orderData = {
      buyer_id: buyer_id || '00000000-0000-0000-0000-000000000000',
      seller_id: seller_id || '00000000-0000-0000-0000-000000000000',
      product_id: item.id,
      quantity: item.quantity || 1,
      item_price: item.price,
      shipping_cost: shipping || 0,
      total_amount: total,
      status: 'pending' as const,
      shipping_address: shipping_address,
    }

    const { data: order, error } = await getSupabaseAdmin()
      .from('orders')
      .insert(orderData as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating order:', error)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    return NextResponse.json({ orderId: (order as any).id })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}