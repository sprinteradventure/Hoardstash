import { notFound } from 'next/navigation';
import StorefrontClient from './StorefrontClient';

/**
 * Storefront Page (Server Component)
 * 
 * This is a public-facing page where customers can view and purchase
 * products from a specific connected account (seller).
 * 
 * URL: /store/[accountId]
 * 
 * IMPORTANT: Using accountId in the URL for demonstration purposes only.
 * In production, use a slug, username, or custom domain instead.
 * Example: /store/craft-supplies-co instead of /store/acct_123...
 */

interface StorefrontPageProps {
  params: Promise<{
    accountId: string;
  }>;
}

async function fetchProducts(accountId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/connect/products?accountId=${accountId}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return null;
  }
}

async function fetchAccountStatus(accountId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/connect/account-status?accountId=${accountId}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching account status:', error);
    return null;
  }
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { accountId } = await params;

  // Validate accountId format
  if (!accountId.startsWith('acct_')) {
    notFound();
  }

  // Fetch account status and products in parallel
  const [accountData, productsData] = await Promise.all([
    fetchAccountStatus(accountId),
    fetchProducts(accountId),
  ]);

  // If account doesn't exist or can't process payments, show error
  if (!accountData || !accountData.status.canProcessPayments) {
    return (
      <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-[#E8E4E0] text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#4A4035] mb-4">Store Not Available</h1>
          <p className="text-[#6B5D4D]">
            This store is not currently accepting orders.
          </p>
        </div>
      </div>
    );
  }

  const products = productsData?.products || [];
  const storeName = accountData._debug?.displayName || 'Seller Store';

  return (
    <StorefrontClient
      accountId={accountId}
      storeName={storeName}
      products={products}
    />
  );
}
