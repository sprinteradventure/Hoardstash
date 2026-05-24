import { NextRequest, NextResponse } from 'next/server'
import EasyPost from '@easypost/api'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const easypost = new EasyPost(process.env.EASYPOST_API_KEY || 'test_key')

export async function POST(req: NextRequest) {
  try {
    const { orderId, rateId } = await req.json()

    if (!orderId || !rateId) {
      return NextResponse.json({ error: 'Missing orderId or rateId' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Get order with product and seller profile details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        product:product_id(id, title, shipping_weight, shipping_dimensions),
        seller:seller_id(id, full_name, shipping_address)
      `)
      .eq('id', orderId)
      .single()

    if (!orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const orderData = order as any

    // Check if already has label
    if (orderData.tracking_number && orderData.shipping_label_url) {
      return NextResponse.json({ 
        error: 'Label already generated',
        labelUrl: orderData.shipping_label_url,
        trackingNumber: orderData.tracking_number
      }, { status: 400 })
    }

    // Build seller from address from profile
    const sellerProfile = (order as any).seller
    const sellerAddress = sellerProfile?.shipping_address
    
    if (!sellerAddress?.street1 || !sellerAddress?.zip) {
      return NextResponse.json({ 
        error: 'Seller has no shipping address. Please update your profile first.' 
      }, { status: 400 })
    }

    const fromAddress = new (easypost as any).Address({
      name: sellerProfile.full_name || 'Seller',
      street1: sellerAddress.street1,
      street2: sellerAddress.street2 || undefined,
      city: sellerAddress.city,
      state: sellerAddress.state,
      zip: sellerAddress.zip,
      country: sellerAddress.country || 'US',
      phone: sellerAddress.phone || '555-555-5555',
    })

    const toAddress = new (easypost as any).Address(orderData.shipping_address)

    // Use product shipping data if available, otherwise reasonable defaults
    const productWeight = (order as any).product?.shipping_weight || 16 // 1 lb default
    const dims = (order as any).product?.shipping_dimensions || {}
    
    const parcel = new (easypost as any).Parcel({
      weight: productWeight,
      length: dims.length || 12,
      width: dims.width || 9,
      height: dims.height || 3,
    })

    const shipment = await (easypost as any).Shipment.create({
      from_address: fromAddress,
      to_address: toAddress,
      parcel: parcel,
    })

    // Buy label with the selected rate
    const boughtShipment = await shipment.buy(rateId)

    // Update order
    await (supabase.from('orders') as any)
      .update({
        tracking_number: boughtShipment.tracking_code,
        shipping_label_url: boughtShipment.postage_label.label_url,
        shipping_carrier: boughtShipment.selected_rate.carrier,
        shipping_service: boughtShipment.selected_rate.service,
        shipping_cost: parseFloat(boughtShipment.selected_rate.rate),
        status: 'shipped',
        shipped_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    return NextResponse.json({
      success: true,
      trackingNumber: boughtShipment.tracking_code,
      labelUrl: boughtShipment.postage_label.label_url,
      carrier: boughtShipment.selected_rate.carrier,
      service: boughtShipment.selected_rate.service,
      cost: boughtShipment.selected_rate.rate,
    })
  } catch (error: any) {
    console.error('Label generation error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to generate label' 
    }, { status: 500 })
  }
}
