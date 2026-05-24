'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Heart, Share2, MessageCircle, Truck, Shield, Star } from 'lucide-react'

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)

  // Mock product data
  const product = {
    id: params.id,
    title: 'Bernat Blanket Yarn - 6 Skeins, Soft White',
    price: 45.00,
    originalPrice: 78.00,
    condition: 'Like New',
    description: 'I bought these for a project that never happened. All 6 skeins are unused and in original packaging. Perfect for blankets, scarves, or any cozy project. Each skein is 300g/10.5oz.',
    category: 'Yarn & Thread',
    images: ['🧶', '📦', '🏷️'],
    seller: {
      name: 'YarnQueen',
      avatar: '👩',
      rating: 4.9,
      reviews: 127,
      location: 'Portland, OR',
      joined: '2025',
    },
    details: {
      brand: 'Bernat',
      color: 'Soft White',
      material: '100% Polyester',
      weight: '300g per skein',
      quantity: '6 skeins',
    },
    shipping: {
      cost: 8.50,
      methods: ['USPS Priority', 'UPS Ground'],
      estimatedDelivery: '3-5 business days',
    },
  }

  const relatedProducts = [
    { id: 2, title: 'Crochet Hook Set - Premium', price: 25.00, image: '🪝' },
    { id: 3, title: 'Knitting Needles - Bamboo', price: 18.00, image: '🧶' },
    { id: 4, title: 'Yarn Storage Bag', price: 22.00, image: '🎒' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-purple-600">Home</Link>
          {' > '}
          <Link href="/browse" className="hover:text-purple-600">Browse</Link>
          {' > '}
          <Link href="/category/yarn" className="hover:text-purple-600">{product.category}</Link>
          {' > '}
          <span>{product.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="bg-white rounded-lg h-96 flex items-center justify-center text-8xl mb-4">
              {product.images[selectedImage]}
            </div>
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 bg-white rounded-lg flex items-center justify-center text-2xl border-2 ${
                    selectedImage === idx ? 'border-purple-600' : 'border-transparent'
                  }`}
                >
                  {img}
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{product.category}</p>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.title}</h1>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Share2 className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                Save ${(product.originalPrice - product.price).toFixed(2)}
              </span>
            </div>

            <p className="text-sm text-gray-600 mt-2">Condition: <span className="font-medium">{product.condition}</span></p>

            <div className="border-t my-6"></div>

            <p className="text-gray-700">{product.description}</p>

            <div className="border-t my-6"></div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">
                Add to Cart
              </button>
              
              <button className="w-full py-3 border-2 border-purple-600 text-purple-600 font-bold rounded-lg hover:bg-purple-50">
                Buy Now
              </button>
            </div>

            {/* Shipping */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Shipping</span>
              </div>
              <p className="text-sm text-gray-600">${product.shipping.cost} - {product.shipping.estimatedDelivery}</p>
            </div>

            {/* Protection */}
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-5 h-5" />
              <span>Purchase Protection Guarantee</span>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="mt-8 bg-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl">
                {product.seller.avatar}
              </div>
              
              <div>
                <Link href={`/seller/${product.seller.name}`} className="font-bold text-lg hover:text-purple-600">
                  {product.seller.name}
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{product.seller.rating} ({product.seller.reviews} reviews)</span>
                </div>
                <p className="text-sm text-gray-500">{product.seller.location} • Member since {product.seller.joined}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link
                href={`/seller/${product.seller.name}`}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                View Shop
              </Link>
              
              <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Message
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-8 bg-white rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Item Details</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(product.details).map(([key, value]) => (
              <div key={key}>
                <span className="text-gray-500 capitalize">{key}: </span>
                <span className="font-medium">{value as string}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">You May Also Like</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map(item => (
              <Link key={item.id} href={`/product/${item.id}`} className="bg-white rounded-lg p-4 hover:shadow-md">
                <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center text-4xl mb-3">
                  {item.image}
                </div>
                <h3 className="font-medium line-clamp-1">{item.title}</h3>
                <p className="font-bold">${item.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}