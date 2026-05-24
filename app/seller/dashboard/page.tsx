'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { 
  Loader2, Package, DollarSign, TrendingUp, Plus, Trash2, Eye, 
  Truck, ClipboardCheck, Printer, Download, CheckCircle 
} from 'lucide-react'

interface Product {
  id: string
  title: string
  price: number
  images: string[]
  status: string
  created_at: string
  quantity: number
}

interface Order {
  id: string
  buyer_id: string
  product_id: string
  quantity: number
  item_price: number
  shipping_cost: number
  total_amount: number
  status: string
  shipping_address: any
  tracking_number: string | null
  shipping_label_url: string | null
  shipping_carrier: string | null
  shipping_service: string | null
  created_at: string
  product?: { id: string; title: string; images: string[]; shipping_weight: number | null; shipping_dimensions: any }
  buyer?: { id: string; full_name: string | null; email: string | null }
}

interface Stats {
  activeListings: number
  soldItems: number
  totalSales: number
  totalListings: number
}

export default function SellerDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats>({
    activeListings: 0,
    soldItems: 0,
    totalSales: 0,
    totalListings: 0
  })
  const [stripeConnected, setStripeConnected] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [connectLoading, setConnectLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'listings' | 'orders'>('listings')
  
  // Label generation state
  const [generatingLabelFor, setGeneratingLabelFor] = useState<string | null>(null)
  const [shippingRates, setShippingRates] = useState<any[]>([])
  const [selectedRate, setSelectedRate] = useState<any>(null)
  const [labelStep, setLabelStep] = useState<'rates' | 'confirm' | 'done' | null>(null)
  const [labelResult, setLabelResult] = useState<any>(null)

  useEffect(() => {
    async function init() {
      try {
        const supabase = getSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login?redirect=/seller/dashboard')
          return
        }

        setUserId(user.id)

        // Check Stripe connection status
        const { data: profile } = await supabase
          .from('profiles')
          .select('stripe_account_id')
          .eq('id', user.id)
          .single()

        setStripeConnected(!!(profile as any)?.stripe_account_id)

        // Fetch seller's products
        await fetchProducts(user.id)
        
        // Fetch seller's orders
        if (userId) await fetchOrders(userId)
      } catch (error) {
        console.error('Init error:', error)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [router])

  const fetchProducts = async (sellerId: string) => {
    try {
      const response = await fetch(`/api/seller/products?seller_id=${sellerId}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchOrders = async (sellerId: string) => {
    try {
      const response = await fetch(`/api/seller/orders?seller_id=${sellerId}`)
      const data = await response.json()

      if (response.ok) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const connectStripe = async () => {
    if (!userId) return
    
    setConnectLoading(true)
    
    try {
      const response = await fetch('/api/seller/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to create Stripe account. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong')
    } finally {
      setConnectLoading(false)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!userId) return
    
    if (!confirm('Are you sure you want to delete this listing?')) return

    setDeletingId(productId)
    
    try {
      const response = await fetch(`/api/seller/products?product_id=${productId}&seller_id=${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId))
        setStats(prev => ({
          ...prev,
          activeListings: Math.max(0, prev.activeListings - 1),
          totalListings: Math.max(0, prev.totalListings - 1)
        }))
      } else {
        alert('Failed to delete listing')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Something went wrong')
    } finally {
      setDeletingId(null)
    }
  }

  // Shipping label flow
  const startLabelFlow = async (order: Order) => {
    if (!userId) return
    
    setGeneratingLabelFor(order.id)
    setLabelStep('rates')
    setShippingRates([])
    setSelectedRate(null)
    setLabelResult(null)

    try {
      // Check if seller has shipping address
      const supabase = getSupabaseClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('shipping_address')
        .eq('id', userId)
        .single()

      const sellerAddress = (profile as any)?.shipping_address
      if (!sellerAddress?.street1 || !sellerAddress?.zip) {
        alert('Please set your shipping return address in your profile first.')
        setLabelStep(null)
        setGeneratingLabelFor(null)
        return
      }

      // Get shipping rates
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAddress: {
            name: sellerAddress.name || 'Seller',
            street1: sellerAddress.street1,
            street2: sellerAddress.street2 || undefined,
            city: sellerAddress.city,
            state: sellerAddress.state,
            zip: sellerAddress.zip,
            country: sellerAddress.country || 'US',
            phone: sellerAddress.phone || '555-555-5555',
          },
          toAddress: order.shipping_address,
          parcel: {
            weight: order.product?.shipping_weight || 16,
            length: order.product?.shipping_dimensions?.length || 12,
            width: order.product?.shipping_dimensions?.width || 9,
            height: order.product?.shipping_dimensions?.height || 3,
          },
        }),
      })

      const data = await response.json()
      if (data.rates && data.rates.length > 0) {
        setShippingRates(data.rates)
        setSelectedRate(data.rates[0])
      } else {
        alert('No shipping rates available for this address. Please check the shipping address.')
        setLabelStep(null)
        setGeneratingLabelFor(null)
      }
    } catch (error) {
      console.error('Error getting rates:', error)
      alert('Failed to get shipping rates')
      setLabelStep(null)
      setGeneratingLabelFor(null)
    }
  }

  const generateLabel = async (orderId: string) => {
    if (!selectedRate) return
    
    try {
      const response = await fetch('/api/shipping/label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          rateId: selectedRate.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setLabelResult(data)
        setLabelStep('done')
        // Refresh orders
        if (userId) await fetchOrders(userId)
      } else {
        alert(data.error || 'Failed to generate label')
        setLabelStep('rates')
      }
    } catch (error) {
      console.error('Label generation error:', error)
      alert('Something went wrong')
      setLabelStep('rates')
    }
  }

  const cancelLabelFlow = () => {
    setGeneratingLabelFor(null)
    setLabelStep(null)
    setShippingRates([])
    setSelectedRate(null)
    setLabelResult(null)
  }

  const formatAddress = (addr: any) => {
    if (!addr) return 'N/A'
    const parts = [addr.street1, addr.city, addr.state, addr.zip].filter(Boolean)
    return parts.join(', ')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>

        {!stripeConnected ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Connect Your Stripe Account</h2>
            
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              To start selling on HoardStash, you need to connect a Stripe account. 
              This allows you to receive payments directly from buyers.
            </p>

            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">Get paid instantly</p>
                  <p className="text-sm text-gray-500">Money goes directly to your bank account</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">Keep 95% of sales</p>
                  <p className="text-sm text-gray-500">We only take 5% commission</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">Secure payments</p>
                  <p className="text-sm text-gray-500">Powered by Stripe's industry-leading security</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">No monthly fees</p>
                  <p className="text-sm text-gray-500">Only pay when you sell</p>
                </div>
              </div>
            </div>

            <button
              onClick={connectStripe}
              disabled={connectLoading}
              className="px-8 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {connectLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect with Stripe'
              )}
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm font-medium">Total Sales</span>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold">${stats.totalSales.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm font-medium">Active Listings</span>
                  <Package className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold">{stats.activeListings}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm font-medium">Items Sold</span>
                  <DollarSign className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold">{stats.soldItems}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm font-medium">Orders to Ship</span>
                  <Truck className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-3xl font-bold">
                  {orders.filter(o => o.status === 'pending' || o.status === 'paid').length}
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('listings')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'listings' 
                    ? 'bg-white text-purple-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Your Listings
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'orders' 
                    ? 'bg-white text-purple-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Orders ({orders.length})
              </button>
            </div>

            {activeTab === 'listings' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Your Listings</h2>
                    <p className="text-gray-500">Manage your active and past listings</p>
                  </div>
                  <Link
                    href="/sell"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Item
                  </Link>
                </div>

                {products.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-gray-500 mb-4">No listings yet. Start selling today!</p>
                    <Link
                      href="/sell"
                      className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Create Your First Listing
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y">
                    {products.map((product) => (
                      <div key={product.id} className="p-6 flex items-center gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{product.title}</h3>
                          <p className="text-purple-600 font-bold">${product.price.toFixed(2)}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className={`
                              px-2 py-0.5 rounded-full text-xs
                              ${product.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                              ${product.status === 'sold' ? 'bg-blue-100 text-blue-700' : ''}
                              ${product.status === 'reserved' ? 'bg-yellow-100 text-yellow-700' : ''}
                            `}>
                              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                            </span>
                            <span>• Qty: {product.quantity}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/product/${product.id}`}
                            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                            title="View listing"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          
                          {product.status !== 'deleted' && (
                            <button
                              onClick={() => deleteProduct(product.id)}
                              disabled={deletingId === product.id}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete listing"
                            >
                              {deletingId === product.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold">Your Orders</h2>
                  <p className="text-gray-500">Manage sales and generate shipping labels</p>
                </div>

                {orders.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ClipboardCheck className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-gray-500 mb-4">No orders yet. Sales will appear here!</p>
                    <Link
                      href="/sell"
                      className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Create a Listing
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y">
                    {orders.map((order) => (
                      <div key={order.id} className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {order.product?.images?.[0] ? (
                              <img
                                src={order.product.images[0]}
                                alt={order.product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package className="w-8 h-8" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold truncate">
                                {order.product?.title || 'Unknown Product'}
                              </h3>
                              <span className={`
                                px-2 py-0.5 rounded-full text-xs font-medium
                                ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                                ${order.status === 'paid' ? 'bg-blue-100 text-blue-700' : ''}
                                ${order.status === 'shipped' ? 'bg-purple-100 text-purple-700' : ''}
                                ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : ''}
                                ${order.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                              `}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>

                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Buyer:</span> {order.buyer?.full_name || 'Anonymous'} • 
                              <span className="font-medium"> Order #</span>{order.id.slice(0, 8)}
                            </div>

                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Ship to:</span> {formatAddress(order.shipping_address)}
                            </div>

                            <div className="flex items-center gap-4 text-sm mb-3">
                              <span><span className="font-medium">Item:</span> ${order.item_price?.toFixed(2)}</span>
                              <span><span className="font-medium">Shipping:</span> ${order.shipping_cost?.toFixed(2) || '—'}</span>
                              <span className="font-bold text-purple-700">Total: ${order.total_amount?.toFixed(2)}</span>
                            </div>

                            {/* Order Actions */}
                            <div className="flex items-center gap-2">
                              {(order.status === 'pending' || order.status === 'paid') && (
                                <button
                                  onClick={() => startLabelFlow(order)}
                                  disabled={generatingLabelFor === order.id}
                                  className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                  {generatingLabelFor === order.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Getting Rates...
                                    </>
                                  ) : (
                                    <>
                                      <Truck className="w-4 h-4" />
                                      Ship This Order
                                    </>
                                  )}
                                </button>
                              )}

                              {order.status === 'shipped' && (
                                <>
                                  <span className="flex items-center gap-1 text-sm text-purple-700">
                                    <CheckCircle className="w-4 h-4" />
                                    {order.shipping_carrier} — {order.tracking_number}
                                  </span>
                                  {order.shipping_label_url && (
                                    <a
                                      href={order.shipping_label_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1.5 border border-purple-200 text-purple-700 text-sm rounded-lg hover:bg-purple-50 flex items-center gap-1"
                                    >
                                      <Printer className="w-3.5 h-3.5" />
                                      Print Label
                                    </a>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Label Generation Modal */}
                        {generatingLabelFor === order.id && labelStep === 'rates' && (
                          <div className="mt-4 bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <h4 className="font-bold mb-4 flex items-center gap-2">
                              <Truck className="w-5 h-5 text-purple-600" />
                              Select Shipping Option
                            </h4>
                            
                            <div className="space-y-3 mb-4">
                              {shippingRates.map((rate) => (
                                <button
                                  key={rate.id}
                                  onClick={() => setSelectedRate(rate)}
                                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                    selectedRate?.id === rate.id
                                      ? 'border-purple-500 bg-purple-50'
                                      : 'border-gray-200 hover:border-purple-300 bg-white'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-semibold">{rate.carrier} — {rate.service}</p>
                                      <p className="text-sm text-gray-500">
                                        {rate.deliveryDays ? `${rate.deliveryDays} business days` : 'Standard delivery'}
                                      </p>
                                    </div>
                                    <p className="text-xl font-bold text-purple-700">${rate.rate.toFixed(2)}</p>
                                  </div>
                                </button>
                              ))}
                            </div>

                            <div className="flex gap-3">
                              <button
                                onClick={() => generateLabel(order.id)}
                                disabled={!selectedRate}
                                className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Buy Label — ${selectedRate?.rate.toFixed(2)}
                              </button>
                              <button
                                onClick={cancelLabelFlow}
                                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {generatingLabelFor === order.id && labelStep === 'done' && labelResult && (
                          <div className="mt-4 bg-green-50 rounded-xl p-6 border border-green-200">
                            <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              Label Generated Successfully!
                            </h4>
                            
                            <div className="space-y-2 text-sm mb-4">
                              <p><span className="font-medium">Carrier:</span> {labelResult.carrier} — {labelResult.service}</p>
                              <p><span className="font-medium">Tracking:</span> {labelResult.trackingNumber}</p>
                              <p><span className="font-medium">Cost:</span> ${parseFloat(labelResult.cost).toFixed(2)}</p>
                            </div>

                            <div className="flex gap-3">
                              <a
                                href={labelResult.labelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                              >
                                <Printer className="w-4 h-4" />
                                Print Shipping Label
                              </a>
                              <button
                                onClick={cancelLabelFlow}
                                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
