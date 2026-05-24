'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

/**
 * Connect Dashboard Component
 * 
 * The actual dashboard content that uses useSearchParams.
 * Must be wrapped in Suspense in the parent page.
 */

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AccountStatus {
  accountId: string;
  status: {
    onboardingComplete: boolean;
    canProcessPayments: boolean;
    isPending: boolean;
    needsAttention: boolean;
  };
  capabilities: {
    cardPayments: string;
  };
  requirements: {
    status: string;
    currentlyDue: string[];
  };
}

interface UserProfile {
  id: string;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  full_name: string | null;
  email: string | null;
}

export default function ConnectDashboard() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
  });

  // Check for onboarding return params
  const onboardingComplete = searchParams.get('onboarding') === 'complete';
  const onboardingRefresh = searchParams.get('onboarding') === 'refresh';
  const urlAccountId = searchParams.get('accountId');

  // Get auth user and profile on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch account status when we have a profile
  useEffect(() => {
    if (profile?.stripe_account_id) {
      fetchAccountStatus(profile.stripe_account_id);
    } else {
      setLoading(false);
    }
  }, [profile]);

  const checkAuth = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        setError('Please sign in to access the seller dashboard');
        setLoading(false);
        return;
      }

      setUser(authUser);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      }

      setProfile(profileData || {
        id: authUser.id,
        stripe_account_id: null,
        stripe_onboarding_complete: false,
        full_name: authUser.user_metadata?.full_name || null,
        email: authUser.email,
      });
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const createAccount = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/connect/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          businessName: profile?.full_name || user.email?.split('@')[0],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(updatedProfile);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchAccountStatus = async (accountId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/connect/account-status?accountId=${accountId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch account status');
      }

      setAccountStatus(data);

      if (profile && data.status.onboardingComplete !== profile.stripe_onboarding_complete) {
        await supabase
          .from('profiles')
          .update({ stripe_onboarding_complete: data.status.onboardingComplete })
          .eq('id', profile.id);
      }

      if (data.status.canProcessPayments) {
        fetchProducts(accountId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createOnboardingLink = async () => {
    if (!profile?.stripe_account_id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/connect/onboarding-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: profile.stripe_account_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create onboarding link');
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.stripe_account_id) {
      setError('No Stripe account connected');
      return;
    }

    if (!accountStatus?.status.canProcessPayments) {
      setError('Cannot create products until onboarding is complete');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/connect/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: profile.stripe_account_id,
          name: productForm.name,
          description: productForm.description,
          price: Math.round(parseFloat(productForm.price) * 100),
          currency: 'usd',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      setProductForm({ name: '', description: '', price: '' });
      fetchProducts(profile.stripe_account_id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (accountId: string) => {
    try {
      const response = await fetch(`/api/connect/products?accountId=${accountId}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center">
        <div className="text-[#4A4035] text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-[#E8E4E0] text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#4A4035] mb-4">Seller Dashboard</h1>
          <p className="text-[#6B5D4D] mb-6">Please sign in to manage your seller account.</p>
          <a
            href="/auth/signin"
            className="inline-block px-6 py-3 bg-[#7A8B6E] text-white font-bold rounded-full hover:bg-[#6B7A60] transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (!profile?.stripe_account_id) {
    return (
      <div className="min-h-screen bg-[#F8F6F4]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-[#4A4035] mb-8">Start Selling on HoardStash</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-800 rounded-xl p-4 mb-6">
              ❌ Error: {error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm p-8 border border-[#E8E4E0] text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-xl font-bold text-[#4A4035] mb-2">Set Up Your Seller Account</h2>
            <p className="text-[#6B5D4D] mb-6 max-w-md mx-auto">
              Connect with Stripe to start selling your craft supplies. 
              You'll receive payouts directly to your bank account.
            </p>
            <ul className="text-left text-[#6B5D4D] mb-6 max-w-sm mx-auto space-y-2">
              <li>✓ Free to set up — only 5% fee per sale</li>
              <li>✓ Get paid directly to your bank account</li>
              <li>✓ Secure payments powered by Stripe</li>
            </ul>
            <button
              onClick={createAccount}
              disabled={loading}
              className="px-8 py-3 bg-[#7A8B6E] text-white font-bold rounded-full hover:bg-[#6B7A60] disabled:opacity-50 transition-colors shadow-lg"
            >
              {loading ? 'Creating Account...' : 'Start Selling'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F4]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#4A4035] mb-8">
          Seller Dashboard
        </h1>

        {onboardingComplete && (
          <div className="bg-green-100 border border-green-400 text-green-800 rounded-xl p-4 mb-6">
            ✅ Onboarding completed! Your account is being verified.
          </div>
        )}

        {onboardingRefresh && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-xl p-4 mb-6">
            ⏳ Onboarding session expired. Please try again.
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-800 rounded-xl p-4 mb-6">
            ❌ Error: {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E8E4E0] mb-8">
          <h2 className="text-xl font-bold text-[#4A4035] mb-4">
            Account Status
          </h2>

          {accountStatus ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#6B5D4D]">Account ID</span>
                <code className="text-sm bg-[#F8F6F4] px-2 py-1 rounded text-[#4A4035]">
                  {accountStatus.accountId}
                </code>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6B5D4D]">Onboarding Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  accountStatus.status.onboardingComplete
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {accountStatus.status.onboardingComplete ? 'Complete' : 'Incomplete'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6B5D4D]">Payment Processing</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  accountStatus.status.canProcessPayments
                    ? 'bg-green-100 text-green-800'
                    : accountStatus.status.isPending
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {accountStatus.status.canProcessPayments
                    ? 'Active'
                    : accountStatus.status.isPending
                    ? 'Pending'
                    : 'Not Ready'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6B5D4D]">Card Payments</span>
                <span className="text-[#4A4035] capitalize">
                  {accountStatus.capabilities.cardPayments}
                </span>
              </div>

              {!accountStatus.status.onboardingComplete && (
                <div className="mt-6 pt-6 border-t border-[#E8E4E0]">
                  <button
                    onClick={createOnboardingLink}
                    disabled={loading}
                    className="w-full py-3 bg-[#7A8B6E] text-white font-bold rounded-full hover:bg-[#6B7A60] disabled:opacity-50 transition-colors shadow-lg"
                  >
                    {loading ? 'Creating Link...' : 'Complete Onboarding'}
                  </button>
                  <p className="text-sm text-[#6B5D4D] mt-2 text-center">
                    Click to finish setting up your payment account
                  </p>
                </div>
              )}

              {accountStatus.status.canProcessPayments && (
                <div className="mt-6 pt-6 border-t border-[#E8E4E0]">
                  <div className="bg-[#F8F6F4] rounded-xl p-4">
                    <p className="text-sm text-[#6B5D4D] mb-2">Your Store URL:</p>
                    <code className="text-sm text-[#4A4035] break-all block">
                      {typeof window !== 'undefined' 
                        ? `${window.location.origin}/store/${profile.stripe_account_id}`
                        : `/store/${profile.stripe_account_id}`}
                    </code>
                    <p className="text-xs text-[#9A8B7A] mt-2">
                      Share this link with your customers
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-[#6B5D4D]">Loading account status...</div>
          )}
        </div>

        {accountStatus?.status.canProcessPayments && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E8E4E0] mb-8">
            <h2 className="text-xl font-bold text-[#4A4035] mb-4">
              Create Product
            </h2>

            <form onSubmit={createProduct} className="space-y-4">
              <div>
                <label className="block font-medium text-[#4A4035] mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E4E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8B6E]"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-[#4A4035] mb-1">
                  Description
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E4E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8B6E]"
                  rows={3}
                />
              </div>

              <div>
                <label className="block font-medium text-[#4A4035] mb-1">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E4E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8B6E]"
                  placeholder="10.00"
                  required
                />
                <p className="text-sm text-[#6B5D4D] mt-1">
                  Platform fee: 5% will be deducted from each sale
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#7A8B6E] text-white font-bold rounded-full hover:bg-[#6B7A60] disabled:opacity-50 transition-colors shadow-lg"
              >
                {loading ? 'Creating...' : 'Create Product'}
              </button>
            </form>
          </div>
        )}

        {accountStatus?.status.canProcessPayments && products.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E8E4E0]">
            <h2 className="text-xl font-bold text-[#4A4035] mb-4">
              Your Products ({products.length})
            </h2>

            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-[#F8F6F4] rounded-xl"
                >
                  <div>
                    <h3 className="font-medium text-[#4A4035]">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-[#6B5D4D]">{product.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#4A4035]">
                      ${(product.price / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-[#6B5D4D] uppercase">{product.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
