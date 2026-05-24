'use client';

import { Suspense } from 'react';
import OrderSuccessContent from './OrderSuccessContent';

/**
 * Order Success Page
 * 
 * Wraps the content in Suspense because useSearchParams() 
 * requires a Suspense boundary in Next.js App Router.
 */

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center">
        <div className="text-[#4A4035] text-lg">Loading...</div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
