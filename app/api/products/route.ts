import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// Create a new product listing
export async function POST(req: NextRequest) {
  try {
    const { seller_id, title, description, price, original_price, condition, category, images, quantity = 1, shipping_weight, shipping_dimensions } = await req.json()

    // Validate required fields
    if (!seller_id || !title || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: seller_id, title, price, category' },
        { status: 400 }
      )
    }

    const productData = {
      seller_id,
      title,
      description: description || '',
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : null,
      condition: condition || 'Good',
      category,
      images: images || [],
      quantity: parseInt(quantity) || 1,
      status: 'active' as const,
      shipping_weight: shipping_weight ? parseFloat(shipping_weight) : null,
      shipping_dimensions: shipping_dimensions || null,
    }

    const { data: product, error } = await getSupabaseAdmin()
      .from('products')
      .insert(productData as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }

    return NextResponse.json({ product, success: true })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get products (with optional filters)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const seller_id = searchParams.get('seller_id')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const condition = searchParams.get('condition')
    const sort = searchParams.get('sort') || 'newest'
    const limit = parseInt(searchParams.get('limit') || '24')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = getSupabaseAdmin()
      .from('products')
      .select('*', { count: 'exact' })
      .eq('status', 'active')

    if (seller_id) {
      query = query.eq('seller_id', seller_id)
    }

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }

    if (condition && condition !== 'all') {
      query = query.eq('condition', condition)
    }

    // Sorting
    switch (sort) {
      case 'price_low':
        query = query.order('price', { ascending: true })
        break
      case 'price_high':
        query = query.order('price', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: products, error, count } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    return NextResponse.json({ 
      products: products || [],
      total: count || 0,
      offset,
      limit
    })
  } catch (error) {
    console.error('Fetch products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
