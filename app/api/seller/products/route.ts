import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// Get all products for the authenticated seller
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

    const { data: products, error } = await (getSupabaseAdmin()
      .from('products') as any)
      .select('*')
      .eq('seller_id', seller_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching seller products:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Calculate stats
    const productsArray = (products as any[]) || []
    const activeListings = productsArray.filter(p => p.status === 'active').length || 0
    const soldItems = productsArray.filter(p => p.status === 'sold').length || 0
    const totalSales = productsArray
      .filter(p => p.status === 'sold')
      .reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0) || 0

    return NextResponse.json({
      products: productsArray,
      stats: {
        activeListings,
        soldItems,
        totalSales,
        totalListings: productsArray.length || 0
      }
    })
  } catch (error) {
    console.error('Fetch seller products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete a product
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const product_id = searchParams.get('product_id')
    const seller_id = searchParams.get('seller_id')

    if (!product_id || !seller_id) {
      return NextResponse.json(
        { error: 'Missing product_id or seller_id' },
        { status: 400 }
      )
    }

    // Verify ownership before deleting
    const { data: product, error: fetchError } = await (getSupabaseAdmin()
      .from('products') as any)
      .select('seller_id')
      .eq('id', product_id)
      .single()

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.seller_id !== seller_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { error } = await (getSupabaseAdmin()
      .from('products') as any)
      .update({ status: 'deleted' })
      .eq('id', product_id)

    if (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
