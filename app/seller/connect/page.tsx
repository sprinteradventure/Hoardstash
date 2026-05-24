'use client';

import { Suspense } from 'react';
import ConnectDashboard from './ConnectDashboard';

/**
 * Seller Connect Dashboard Page
 * 
 * Wraps the content in Suspense because useSearchParams() 
 * requires a Suspense boundary in Next.js App Router.
 */

export default function ConnectDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center">
        <div className="text-[#4A4035] text-lg">Loading...</div>
      </div>
    }>
      <ConnectDashboard />
    </Suspense>
  );
}
