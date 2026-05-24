import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// Get orders for the authenticated seller
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const seller_id = searchParams.get('seller_id')

    if (!seller_id) {
      return NextResponse.json(
        { error: 'Missing seller_id parameter' },
        { status: 400 }
      )
    }

    const { data: orders, error } = await getSupabaseAdmin()
      .from('orders')
      .select(`
        *,
        product:product_id(id, title, images, shipping_weight, shipping_dimensions),
        buyer:buyer_id(id, full_name, email)
      `)
      .eq('seller_id', seller_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching seller orders:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error('Fetch seller orders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
