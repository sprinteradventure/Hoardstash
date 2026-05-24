'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Search, SlidersHorizontal, ChevronDown, X, Package } from 'lucide-react'

interface Product {
  id: string
  title: string
  price: number
  original_price: number | null
  condition: string
  category: string
  images: string[]
  seller_id: string
  created_at: string
}

const conditions = ['New', 'Like New', 'Good', 'Fair']

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
  'Party Supplies',
  'Costumes',
]

export default function BrowseClient() {
  const urlParams = useSearchParams()
  const initialCategory = urlParams.get('category') || 'all'

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const limit = 24

  // Filters
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [condition, setCondition] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('newest')

  // UI state
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState('')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'all') params.set('category', category)
      if (search) params.set('search', search)
      if (condition !== 'all') params.set('condition', condition)
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)
      params.set('sort', sort)
      params.set('limit', String(limit))
      params.set('offset', String(offset))

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products || [])
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [category, search, condition, minPrice, maxPrice, sort, offset])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = () => {
    setSearch(searchInput)
    setOffset(0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const clearFilters = () => {
    setSearch('')
    setSearchInput('')
    setCategory('all')
    setCondition('all')
    setMinPrice('')
    setMaxPrice('')
    setSort('newest')
    setOffset(0)
  }

  const activeFilterCount = [
    category !== 'all',
    condition !== 'all',
    minPrice !== '',
    maxPrice !== '',
    search !== '',
  ].filter(Boolean).length

  const hasFilters = activeFilterCount > 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-[#F8F6F4]">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#4A4035] mb-2">
            {category !== 'all' ? category : 'Browse All Items'}
          </h1>
          <p className="text-[#6B5D4D]">
            {loading ? 'Loading...' : `${total} item${total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Search + Controls Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B5D4D]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search yarn, paints, tools..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8E4E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A8B6E] text-[#4A4035]"
            />
          </div>

          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-[#7A8B6E] text-white font-semibold rounded-xl hover:bg-[#6B7A60] transition-colors"
          >
            Search
          </button>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 border rounded-xl font-medium flex items-center gap-2 transition-colors ${
              showFilters || hasFilters
                ? 'border-[#7A8B6E] text-[#7A8B6E] bg-[#7A8B6E]/10'
                : 'border-[#E8E4E0] text-[#6B5D4D] bg-white hover:bg-[#F5F0E8]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-[#7A8B6E] text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setOffset(0) }}
              className="appearance-none px-4 py-3 pr-10 bg-white border border-[#E8E4E0] rounded-xl text-[#4A4035] font-medium focus:outline-none focus:ring-2 focus:ring-[#7A8B6E] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5D4D] pointer-events-none" />
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-[#E8E4E0] p-6 mb-6">
            <div className="grid md:grid-cols-4 gap-6">
              {/* Category */}
              <div>
                <label className="block font-semibold text-[#4A4035] mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setOffset(0) }}
                  className="w-full px-3 py-2 border border-[#E8E4E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8B6E] text-[#4A4035]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block font-semibold text-[#4A4035] mb-2">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => { setCondition(e.target.value); setOffset(0) }}
                  className="w-full px-3 py-2 border border-[#E8E4E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8B6E] text-[#4A4035]"
                >
                  <option value="all">Any Condition</option>
                  {conditions.map((cond) => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block font-semibold text-[#4A4035] mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setOffset(0) }}
                    placeholder="Min"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-[#E8E4E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8B6E] text-[#4A4035]"
                  />
                  <span className="text-[#6B5D4D]">—</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setOffset(0) }}
                    placeholder="Max"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-[#E8E4E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8B6E] text-[#4A4035]"
                  />
                </div>
              </div>

              {/* Clear */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  disabled={!hasFilters}
                  className="w-full px-4 py-2 border border-[#E8E4E0] text-[#6B5D4D] rounded-lg hover:bg-[#F5F0E8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Tags */}
        {hasFilters && !showFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#7A8B6E]/10 text-[#7A8B6E] rounded-full text-sm">
                Search: "{search}"
                <button onClick={() => { setSearch(''); setSearchInput(''); setOffset(0) }} className="hover:text-[#4A4035]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#7A8B6E]/10 text-[#7A8B6E] rounded-full text-sm">
                {category}
                <button onClick={() => { setCategory('all'); setOffset(0) }} className="hover:text-[#4A4035]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {condition !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#7A8B6E]/10 text-[#7A8B6E] rounded-full text-sm">
                {condition}
                <button onClick={() => { setCondition('all'); setOffset(0) }} className="hover:text-[#4A4035]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#7A8B6E]/10 text-[#7A8B6E] rounded-full text-sm">
                {minPrice ? `$${minPrice}` : '$0'} — {maxPrice ? `$${maxPrice}` : '∞'}
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); setOffset(0) }} className="hover:text-[#4A4035]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[#E8E4E0] animate-pulse">
                <div className="h-48 bg-[#EDE6D8]" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-[#EDE6D8] rounded w-3/4" />
                  <div className="h-4 bg-[#EDE6D8] rounded w-1/2" />
                  <div className="h-6 bg-[#EDE6D8] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#F5F0E8] rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-[#C4B5A5]" />
            </div>
            <h3 className="text-xl font-bold text-[#4A4035] mb-2">No items found</h3>
            <p className="text-[#6B5D4D] mb-6">Try adjusting your search or filters.</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-[#7A8B6E] text-white rounded-xl hover:bg-[#6B7A60] transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#E8E4E0] hover:shadow-lg transition-all duration-300"
                >
                  {/* Image */}
                  <div className="h-48 bg-[#F5F0E8] overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#C4B5A5]">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-[#7A8B6E] font-medium mb-1">{product.category}</p>
                    <h3 className="font-semibold text-[#4A4035] group-hover:text-[#7A8B6E] transition-colors line-clamp-2 min-h-[2.5rem]">
                      {product.title}
                    </h3>

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-lg font-bold text-[#4A4035]">{formatPrice(product.price)}</span>
                      {product.original_price && (
                        <span className="text-sm text-[#C4B5A5] line-through">
                          {formatPrice(product.original_price)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.condition === 'New' ? 'bg-green-100 text-green-700' :
                        product.condition === 'Like New' ? 'bg-blue-100 text-blue-700' :
                        product.condition === 'Good' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {product.condition}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {total > limit && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="px-4 py-2 border border-[#E8E4E0] rounded-lg text-[#4A4035] hover:bg-[#F5F0E8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <span className="text-sm text-[#6B5D4D]">
                  Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}
                </span>

                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= total}
                  className="px-4 py-2 border border-[#E8E4E0] rounded-lg text-[#4A4035] hover:bg-[#F5F0E8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
