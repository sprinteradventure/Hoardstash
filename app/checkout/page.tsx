'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { Truck, Shield, Package, Clock, MapPin } from 'lucide-react'

const mockCart = [
  { id: '1', title: 'Bernat Blanket Yarn - 6 Skeins', price: 45, quantity: 1, weight: 32, length: 12, width: 10, height: 6 },
]

interface ShippingRate {
  id: string
  carrier: string
  service: string
  rate: number
  currency: string
  deliveryDays: number | null
  deliveryDate: string | null
}

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [calculatingShipping, setCalculatingShipping] = useState(false)
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null)
  const [shipping, setShipping] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })

  const subtotal = mockCart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shippingCost = selectedRate?.rate || 0
  const total = subtotal + shippingCost

  // Calculate shipping rates when address is complete
  useEffect(() => {
    if (shipping.zip.length === 5) {
      calculateShipping()
    }
  }, [shipping.zip])

  const calculateShipping = async () => {
    setCalculatingShipping(true)
    try {
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toAddress: {
            name: shipping.fullName,
            street1: shipping.address,
            city: shipping.city,
            state: shipping.state,
            zip: shipping.zip,
            country: 'US',
          },
          fromAddress: {
            zip: '12345', // Default seller location - will come from seller profile
            country: 'US',
          },
          parcel: {
            weight: mockCart.reduce((sum, item) => sum + (item.weight || 16), 0),
            length: Math.max(...mockCart.map(i => i.length || 12)),
            width: Math.max(...mockCart.map(i => i.width || 9)),
            height: mockCart.reduce((sum, item) => sum + (item.height || 3), 0),
          },
        }),
      })

      const data = await response.json()
      if (data.rates) {
        setShippingRates(data.rates)
        // Auto-select cheapest option
        if (data.rates.length > 0 && !selectedRate) {
          setSelectedRate(data.rates[0])
        }
      }
    } catch (error) {
      console.error('Shipping calculation error:', error)
    } finally {
      setCalculatingShipping(false)
    }
  }

  const handleCheckout = async () => {
    if (!selectedRate) {
      alert('Please select a shipping option')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: mockCart,
          shipping: selectedRate.rate,
          shippingAddress: {
            name: shipping.fullName,
            street1: shipping.address,
            city: shipping.city,
            state: shipping.state,
            zip: shipping.zip,
            country: 'US',
          },
          selectedRateId: selectedRate.id,
        }),
      })
      
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error: ' + (data.error || 'Unknown error'))
        setLoading(false)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const isFormValid = shipping.fullName && shipping.address && shipping.city && shipping.state && shipping.zip.length === 5 && selectedRate

  const formatDelivery = (rate: ShippingRate) => {
    if (rate.deliveryDays) {
      return `${rate.deliveryDays} business day${rate.deliveryDays > 1 ? 's' : ''}`
    }
    if (rate.deliveryDate) {
      return new Date(rate.deliveryDate).toLocaleDateString()
    }
    return 'Standard delivery'
  }

  return (
    <div className="min-h-screen bg-[#F8F6F4]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#4A4035] mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E8E4E0]">
              <h2 className="text-xl font-bold mb-4 text-[#4A4035] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#7A8B6E]" /> Shipping Address
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1 text-[#4A4035]">Full Name *</label>
                  <input
                    type="text"
                    value={shipping.fullName}
                    onChange={(e) => setShipping({...shipping, fullName: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E8E4E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8B6E]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1 text-[#4A4035]">Street Address *</label>
                  <input
                    type="text"
                    value={shipping.address}
                    onChange={(e) => setShipping({...shipping, address: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E8E4E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8B6E]"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-medium mb-1 text-[#4A4035]">City *</label>
                    <input
                      type="text"
                      value={shipping.city}
                      onChange={(e) => setShipping({...shipping, city: e.target.value})}
                      className="w-full px-4 py-2 border border-[#E8E4E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8B6E]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-[#4A4035]">State *</label>
                    <input
                      type="text"
                      value={shipping.state}
                      onChange={(e) => setShipping({...shipping, state: e.target.value})}
                      className="w-full px-4 py-2 border border-[#E8E4E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8B6E]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-[#4A4035]">ZIP *</label>
                    <input
                      type="text"
                      value={shipping.zip}
                      onChange={(e) => setShipping({...shipping, zip: e.target.value})}
                      className="w-full px-4 py-2 border border-[#E8E4E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8B6E]"
                      maxLength={5}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Options */}
            {shippingRates.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E8E4E0]">
                <h2 className="text-xl font-bold mb-4 text-[#4A4035] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#7A8B6E]" /> Choose Shipping
                </h2>
                
                <div className="space-y-3">
                  {shippingRates.map((rate) => (
                    <button
                      key={rate.id}
                      onClick={() => setSelectedRate(rate)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedRate?.id === rate.id
                          ? 'border-[#7A8B6E] bg-[#7A8B6E]/5'
                          : 'border-[#E8E4E0] hover:border-[#7A8B6E]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedRate?.id === rate.id
                              ? 'border-[#7A8B6E] bg-[#7A8B6E]'
                              : 'border-[#E8E4E0]'
                          }`}>
                            {selectedRate?.id === rate.id && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-[#4A4035]">
                              {rate.carrier} {rate.service}
                            </p>
                            <p className="text-sm text-[#6B5D4D] flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {formatDelivery(rate)}
                            </p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-[#4A4035]">
                          ${rate.rate.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {calculatingShipping && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E8E4E0] text-center">
                <div className="animate-spin w-6 h-6 border-2 border-[#7A8B6E] border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-[#6B5D4D]">Calculating shipping rates...</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E8E4E0] h-fit">
            <h2 className="text-xl font-bold mb-4 text-[#4A4035]">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              {mockCart.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[#F8F6F4] rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-[#7A8B6E]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#4A4035]">{item.title}</p>
                      <p className="text-sm text-[#6B5D4D]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium text-[#4A4035]">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-[#E8E4E0] pt-4 space-y-2">
              <div className="flex justify-between text-[#6B5D4D]">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-[#6B5D4D]">
                <span>Shipping</span>
                <span>{selectedRate ? `$${shippingCost.toFixed(2)}` : 'Enter ZIP code'}</span>
              </div>
              
              <div className="flex justify-between text-xl font-bold pt-2 text-[#4A4035]">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={!isFormValid || loading}
              className="w-full mt-6 py-3 bg-[#7A8B6E] text-white font-bold rounded-full hover:bg-[#6B7A60] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {loading ? 'Processing...' : 'Pay with Stripe'}
            </button>

            <div className="mt-4 flex items-center gap-2 text-sm text-[#6B5D4D]">
              <Shield className="w-5 h-5 text-[#7A8B6E]" />
              <span>Secure payment by Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
