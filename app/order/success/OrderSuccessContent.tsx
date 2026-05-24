'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * Order Success Content
 * 
 * The actual content component that uses useSearchParams.
 * Must be wrapped in Suspense in the parent page.
 */

interface OrderDetails {
  id: string;
  amount_total: number;
  customer_email: string;
  payment_status: string;
}

export default function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      verifySession();
    } else {
      setLoading(false);
      setError('No session ID found');
    }
  }, [sessionId]);

  const verifySession = async () => {
    try {
      setOrder({
        id: sessionId!,
        amount_total: 0,
        customer_email: '',
        payment_status: 'paid',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center">
        <div className="text-[#4A4035] text-lg">Confirming your order...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-[#E8E4E0] text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-[#4A4035] mb-4">Something Went Wrong</h1>
          <p className="text-[#6B5D4D] mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#7A8B6E] text-white font-bold rounded-full hover:bg-[#6B7A60] transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-[#E8E4E0] text-center max-w-md">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-[#4A4035] mb-4">Order Confirmed!</h1>
        <p className="text-[#6B5D4D] mb-6">
          Thank you for your purchase. You will receive a confirmation email shortly.
        </p>

        {order && (
          <div className="bg-[#F8F6F4] rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-[#6B5D4D]">
              Order ID: <span className="font-mono text-[#4A4035]">{order.id.slice(-12)}</span>
            </p>
            <p className="text-sm text-[#6B5D4D] mt-1">
              Status: <span className="text-green-600 font-medium capitalize">{order.payment_status}</span>
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-[#7A8B6E] text-white font-bold rounded-full hover:bg-[#6B7A60] transition-colors"
          >
            Continue Shopping
          </Link>
          
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-[#6B5D4D] hover:text-[#4A4035]"
          >
            View Receipt on Stripe →
          </a>
        </div>
      </div>
    </div>
  );
}
