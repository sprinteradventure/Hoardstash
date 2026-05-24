'use client'

import { useState, useRef, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Upload, X, Loader2, AlertCircle } from 'lucide-react'
import { uploadProductImage } from '@/lib/upload'
import { getSupabaseClient } from '@/lib/supabase'

const categories = [
  'Yarn & Thread',
  'Fabric & Textiles',
  'Paints & Inks',
  'Drawing & Illustration',
  'Scrapbooking',
  'Jewelry Making',
  'Woodworking',
  'Sewing & Needlecraft',
  'Paper Crafts',
  'Tools & Equipment',
  'Books & Patterns',
  'Beads & Embellishments',
  'Clay & Sculpting',
  'Printmaking',
  'Candle Making',
  'Soap Making',
]

export default function SellPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = getSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login?redirect=/sell')
          return
        }
        
        setUserId(user.id)
      } catch (err) {
        console.error('Auth check error:', err)
        setError('Please log in to create a listing')
      } finally {
        setCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [router])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !userId) return

    setUploading(true)
    setError('')

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Max size is 5MB.`)
        continue
      }

      if (!file.type.startsWith('image/')) {
        setError(`File "${file.name}" is not an image.`)
        continue
      }

      const url = await uploadProductImage(file, userId)
      if (url) {
        setImages((prev) => [...prev, url])
      } else {
        setError(`Failed to upload "${file.name}"`)
      }
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!userId) {
      setError('Please log in to create a listing')
      return
    }

    if (images.length === 0) {
      setError('Please add at least one photo')
      return
    }

    setSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      seller_id: userId,
      title: formData.get('title'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      original_price: formData.get('original_price') ? parseFloat(formData.get('original_price') as string) : null,
      condition: formData.get('condition'),
      category: formData.get('category'),
      quantity: parseInt(formData.get('quantity') as string) || 1,
      images: images,
      shipping_weight: formData.get('shipping_weight') ? parseFloat(formData.get('shipping_weight') as string) : null,
      shipping_dimensions: {
        length: parseFloat(formData.get('shipping_length') as string) || null,
        width: parseFloat(formData.get('shipping_width') as string) || null,
        height: parseFloat(formData.get('shipping_height') as string) || null,
      },
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create listing')
      }

      // Redirect to seller dashboard
      router.push('/seller/dashboard')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setSubmitting(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/seller/dashboard" className="text-purple-600 hover:text-purple-700">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">Sell Your Craft Supplies</h1>
        <p className="text-gray-600 mb-8">List your unused craft supplies on HoardStash!</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
          <div className="mb-6">
            <label className="block font-semibold mb-2">Photos * ({images.length}/8)</label>
            <div className="flex gap-3 flex-wrap">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                  <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {images.length < 8 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Add Photo</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-2">Max 5MB per image. First image will be the main photo.</p>
          </div>

          <div className="mb-6">
            <label className="block font-semibold mb-2">Title *</label>
            <input
              type="text"
              name="title"
              placeholder="What are you selling? (e.g., 'Premium Acrylic Paint Set - 24 Colors')"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              maxLength={100}
            />
          </div>

          <div className="mb-6">
            <label className="block font-semibold mb-2">Description *</label>
            <textarea
              name="description"
              placeholder="Describe your item. Include details like brand, size, color, condition, and why you're selling..."
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              maxLength={2000}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block font-semibold mb-2">Category *</label>
              <select
                name="category"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-2">Condition *</label>
              <select
                name="condition"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select condition</option>
                <option value="New">New (never used, in original packaging)</option>
                <option value="Like New">Like New (opened but unused)</option>
                <option value="Good">Good (lightly used, fully functional)</option>
                <option value="Fair">Fair (used, minor wear)</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block font-semibold mb-2">Price ($) *</label>
              <input
                type="number"
                name="price"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Original Price ($) (optional)</label>
              <input
                type="number"
                name="original_price"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block font-semibold mb-2">Quantity Available *</label>
            <input
              type="number"
              name="quantity"
              min="1"
              max="999"
              defaultValue="1"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              Shipping Details
            </h3>
            <p className="text-sm text-gray-500 mb-4">Used to calculate accurate shipping rates for buyers.</p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-medium mb-1 text-sm">Shipping Weight (ounces) *</label>
                <input
                  type="number"
                  name="shipping_weight"
                  min="0.1"
                  step="0.1"
                  placeholder="e.g. 16 (1 lb)"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Total weight including packaging</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium mb-1 text-sm">Length (inches)</label>
                <input
                  type="number"
                  name="shipping_length"
                  min="1"
                  step="0.1"
                  placeholder="12"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block font-medium mb-1 text-sm">Width (inches)</label>
                <input
                  type="number"
                  name="shipping_width"
                  min="1"
                  step="0.1"
                  placeholder="9"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block font-medium mb-1 text-sm">Height (inches)</label>
                <input
                  type="number"
                  name="shipping_height"
                  min="1"
                  step="0.1"
                  placeholder="3"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-800">
              <strong>Fees:</strong> HoardStash takes only 5% when your item sells. 
              Stripe payment processing fees (~2.9% + 30¢) also apply.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Listing...
                </>
              ) : (
                'Create Listing'
              )}
            </button>
            
            <Link
              href="/seller/dashboard"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
