import { Suspense } from 'react'
import Navigation from '@/components/Navigation'
import BrowseClient from './BrowseClient'

function BrowseFallback() {
  return (
    <div className="min-h-screen bg-[#F8F6F4]">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-8 bg-[#EDE6D8] rounded w-48 mb-4 animate-pulse" />
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
      </div>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowseFallback />}>
      <BrowseClient />
    </Suspense>
  )
}
