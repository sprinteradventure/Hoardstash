'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Trash, Plus, Minus, Truck, Shield } from 'lucide-react'

const mockCart = [
  {
    id: 1,
    title: 'Bernat Blanket Yarn - 6 Skeins, Soft White',
    price: 45.00,
    image: '🧶',
    seller: 'YarnQueen',
    quantity: 1,
  },
  {
    id: 2,
    title: 'Cricut Maker 3 + 20 Mats Bundle',
    price: 299.00,
    image: '✂️',
    seller: 'CraftStudio',
    quantity: 1,
  },
]

export default function CartPage() {
  const [cart, setCart] = useState(mockCart)

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) }
      }
      return item
    }))
  }

  const removeItem = (id: number) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = cart.length > 0 ? 8.50 : 0
  const total = subtotal + shipping

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Find some amazing craft supplies!</p>
            <Link
              href="/browse"
              className="inline-block px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                {cart.map((item, idx) => (
                  <div key={item.id} className={`p-6 ${idx !== cart.length - 1 ? 'border-b' : ''}`}>
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                        {item.image}
                      </div>
                      
                      <div className="flex-1">
                        <Link href={`/product/${item.id}`} className="font-semibold hover:text-purple-600">
                          {item.title}
                        </Link>
                        
                        <p className="text-sm text-gray-500 mt-1">Sold by {item.seller}</p>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-3 py-1 hover:bg-gray-100"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="px-3 py-1 hover:bg-gray-100"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                            
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                            >
                              <Trash className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/browse" className="inline-block mt-4 text-purple-600 hover:underline">
                ← Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full py-3 bg-purple-600 text-white text-center font-bold rounded-lg hover:bg-purple-700"
                >
                  Proceed to Checkout
                </Link>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-5 h-5" />
                    <span>Free shipping on orders over $75</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-5 h-5" />
                    <span>Purchase Protection included</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}