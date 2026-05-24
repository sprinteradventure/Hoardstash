'use client';

import { useState } from 'react';

/**
 * Storefront Client Component
 * 
 * Interactive parts of the storefront page.
 * Handles purchase flow and UI interactions.
 */

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  priceId: string;
  images?: string[];
}

interface StorefrontClientProps {
  accountId: string;
  storeName: string;
  products: Product[];
}

export default function StorefrontClient({
  accountId,
  storeName,
  products,
}: StorefrontClientProps) {
  return (
    <div className="min-h-screen bg-[#F8F6F4]">
      {/* Store Header */}
      <header className="bg-white border-b border-[#E8E4E0]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#4A4035]">{storeName}</h1>
              <p className="text-sm text-[#6B5D4D] mt-1">Powered by HoardStash</p>
            </div>
            <a
              href="/"
              className="text-[#7A8B6E] hover:text-[#6B7A60] font-medium"
            >
              ← Back to HoardStash
            </a>
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-bold text-[#4A4035] mb-2">No Products Yet</h2>
            <p className="text-[#6B5D4D]">This seller hasn't added any products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                accountId={accountId}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8E4E0] mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-[#6B5D4D] text-sm">
          <p>Secure payments powered by Stripe</p>
          <p className="mt-1">© {new Date().getFullYear()} HoardStash</p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Product Card Component
 * 
 * Displays a single product with purchase button.
 */
function ProductCard({ product, accountId }: { product: Product; accountId: string }) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/connect/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          items: [
            {
              priceId: product.priceId,
              quantity: 1,
            },
          ],
          subtotal: product.price * 1, // Total in cents
          applicationFeePercent: 5, // HoardStash takes 5%
          successUrl: `${window.location.origin}/order/success`,
          cancelUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      alert('Error: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E8E4E0] overflow-hidden hover:shadow-md transition-shadow">
      {/* Product Image Placeholder */}
      <div className="h-48 bg-[#F8F6F4] flex items-center justify-center">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">🎨</div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="font-bold text-[#4A4035] text-lg mb-2">{product.name}</h3>
        
        {product.description && (
          <p className="text-[#6B5D4D] text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-2xl font-bold text-[#4A4035]">
              ${(product.price / 100).toFixed(2)}
            </span>
            <span className="text-sm text-[#6B5D4D] uppercase ml-1">
              {product.currency}
            </span>
          </div>

          <button
            onClick={handlePurchase}
            disabled={loading}
            className="px-6 py-2 bg-[#7A8B6E] text-white font-bold rounded-full hover:bg-[#6B7A60] disabled:opacity-50 transition-colors shadow-lg"
          >
            {loading ? 'Loading...' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
