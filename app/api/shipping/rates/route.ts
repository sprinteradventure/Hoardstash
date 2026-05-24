import { NextRequest, NextResponse } from 'next/server'
import EasyPost from '@easypost/api'

const easypost = new EasyPost(process.env.EASYPOST_API_KEY || 'test_key')

export async function POST(req: NextRequest) {
  try {
    const { fromAddress, toAddress, parcel } = await req.json()

    // Validate required fields
    if (!toAddress?.zip) {
      return NextResponse.json({ error: 'Destination ZIP code required' }, { status: 400 })
    }

    if (!parcel?.weight) {
      return NextResponse.json({ error: 'Package weight required' }, { status: 400 })
    }

    // Create EasyPost objects
    const from = new (easypost as any).Address(fromAddress)
    const to = new (easypost as any).Address(toAddress)
    const pkg = new (easypost as any).Parcel(parcel)

    // Create shipment and get rates
    const shipment = await (easypost as any).Shipment.create({
      from_address: from,
      to_address: to,
      parcel: pkg,
    })

    // Filter and format rates
    const rates = shipment.rates
      .filter((rate: any) => {
        // Prioritize USPS for domestic, filter out expensive options
        const service = rate.service.toLowerCase()
        const carrier = rate.carrier.toLowerCase()
        
        // Include: USPS Priority, First Class, Ground Advantage, UPS Ground, FedEx Ground
        const includedServices = [
          'ground', 'priority', 'first', 'standard', 'parcel_select',
          'ground_advantage', 'media_mail'
        ]
        
        return includedServices.some(s => service.includes(s)) ||
               carrier === 'usps' || carrier === 'ups' || carrier === 'fedex'
      })
      .slice(0, 5) // Top 5 options
      .map((rate: any) => ({
        id: rate.id,
        carrier: rate.carrier,
        service: rate.service,
        rate: parseFloat(rate.rate),
        currency: rate.currency,
        deliveryDays: rate.delivery_days,
        deliveryDate: rate.delivery_date,
      }))
      .sort((a: any, b: any) => a.rate - b.rate)

    return NextResponse.json({ 
      rates,
      shipmentId: shipment.id 
    })
  } catch (error: any) {
    console.error('EasyPost rates error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to get shipping rates' 
    }, { status: 500 })
  }
}
