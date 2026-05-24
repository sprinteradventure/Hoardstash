'use client'

import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          
          <p className="text-gray-600 mb-6">Last updated: March 28, 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              Welcome to HoardStash! These Terms of Service ("Terms") govern your access to and use of the HoardStash website, 
              mobile applications, and services (collectively, the "Services"). By accessing or using our Services, you agree to be 
              bound by these Terms. If you do not agree to these Terms, you may not access or use the Services.
            </p>
            <p className="text-gray-700">
              HoardStash is a marketplace that connects buyers and sellers of craft supplies. We do not buy, sell, or take possession 
              of any items listed on our platform. We provide the platform and tools to facilitate transactions between users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">2. Eligibility</h2>
            <p className="text-gray-700 mb-4">To use HoardStash, you must:</p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Be at least 18 years old</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Be a resident of a country where our Services are available</li>
              <li>Not be prohibited from using our Services under applicable laws</li>
              <li>Provide accurate and complete information when creating an account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">3. Account Registration</h2>
            <p className="text-gray-700 mb-4">
              To access certain features of our Services, you must register for an account. You agree to:
            </p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your account and password</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            
            <p className="text-gray-700 mt-4">
              We reserve the right to disable any user account at any time if we believe you have violated these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">4. Buying on HoardStash</h2>
            <p className="text-gray-700 mb-4">When you purchase an item on HoardStash:</p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>You agree to pay the listed price plus any applicable shipping costs and taxes</li>
              <li>You understand that items are sold by individual sellers, not by HoardStash</li>
              <li>You agree to review item descriptions, photos, and seller ratings before purchasing</li>
              <li>You acknowledge that item conditions are self-reported by sellers</li>
              <li>You agree to our refund and return policies as described in Section 9</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">5. Selling on HoardStash</h2>
            <p className="text-gray-700 mb-4">When you list items for sale on HoardStash:</p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>You must have legal right to sell the items you list</li>
              <li>You must accurately describe the condition, quantity, and quality of items</li>
              <li>You must upload clear photos that accurately represent the items</li>
              <li>You must ship items within 3 business days of receiving payment</li>
              <li>You must comply with all applicable laws regarding the sale of your items</li>
              <li>You agree to pay HoardStash a 10% commission on successful sales</li>
            </ul>
            
            <p className="text-gray-700 mt-4">
              Prohibited items include: counterfeit goods, illegal items, hazardous materials, 
              weapons, recalled items, and anything that violates intellectual property rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">6. Fees and Payments</h2>
            <p className="text-gray-700 mb-4"><strong>For Sellers:</strong></p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Listing items is free</li>
              <li>HoardStash charges a 5% commission on the final sale price (excluding shipping)</li>
              <li>Payment processing fees (typically 2.9% + $0.30) are deducted from your earnings</li>
              <li>You are responsible for shipping costs unless you offer free shipping</li>
            </ul>
            
            <p className="text-gray-700 mt-4 mb-4"><strong>For Buyers:</strong></p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Creating an account and browsing is free</li>
              <li>You pay the listed price plus shipping costs (if applicable)</li>
              <li>Sales tax may be applied based on your location</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">7. Shipping</h2>
            <p className="text-gray-700 mb-4"><strong>Seller Responsibilities:</strong></p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Ship items within 3 business days of receiving payment</li>
              <li>Use appropriate packaging to prevent damage</li>
              <li>Provide tracking information when available</li>
              <li>Comply with carrier restrictions and shipping regulations</li>
            </ul>
            
            <p className="text-gray-700 mt-4">
              HoardStash is not responsible for items lost or damaged during shipping. 
              We recommend purchasing shipping insurance for valuable items.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">8. Prohibited Activities</h2>
            <p className="text-gray-700 mb-4">You may not:</p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>List counterfeit or stolen goods</li>
              <li>Engage in fraudulent transactions</li>
              <li>Harass, threaten, or intimidate other users</li>
              <li>Use the platform for money laundering or illegal activities</li>
              <li>Circumvent our fees by completing transactions outside the platform</li>
              <li>Create multiple accounts to evade restrictions</li>
              <li>Upload malicious code or interfere with platform operations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">9. Returns and Refunds</h2>
            <p className="text-gray-700 mb-4"><strong>Return Policy:</strong></p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Buyers may request a return within 7 days of delivery</li>
              <li>Items must be returned in the same condition as received</li>
              <li>Buyers are responsible for return shipping costs unless the item was misrepresented</li>
              <li>Refunds are processed within 5 business days of receiving the returned item</li>
            </ul>
            
            <p className="text-gray-700 mt-4">
              If a seller fails to ship an item within 7 days, the buyer is entitled to a full refund.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">10. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              HoardStash and its content, features, and functionality are owned by HoardStash and are protected by 
              copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, 
              or create derivative works without our written permission.
            </p>
            
            <p className="text-gray-700">
              By uploading content to HoardStash, you grant us a non-exclusive, worldwide, royalty-free license 
              to use, display, and distribute your content for the purpose of operating and promoting our Services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">11. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              HoardStash is a platform that connects buyers and sellers. We are not responsible for:
            </p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>The quality, safety, or legality of items sold</li>
              <li>The accuracy of listings or seller representations</li>
              <li>The ability of sellers to ship items</li>
              <li>The ability of buyers to pay for items</li>
              <li>Disputes between buyers and sellers</li>
              <li>Items lost or damaged during shipping</li>
            </ul>
            
            <p className="text-gray-700 mt-4">
              To the maximum extent permitted by law, HoardStash's total liability shall not exceed the amount 
              you paid to use our Services in the 12 months preceding the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">12. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may suspend or terminate your account and access to our Services at any time, with or without 
              notice, for any reason, including violation of these Terms.
            </p>
            
            <p className="text-gray-700">
              Upon termination, your right to use the Services will immediately cease. All provisions of these 
              Terms that by their nature should survive termination shall survive.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700">
              We may modify these Terms at any time. We will notify users of significant changes by posting 
              the updated Terms on our website and updating the "Last updated" date. Your continued use of 
              the Services after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">14. Governing Law</h2>
            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of the State of 
              California, without regard to its conflict of law provisions. Any disputes arising under these 
              Terms shall be resolved in the courts located in California.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">15. Contact Information</h2>
            <p className="text-gray-700">
              If you have any questions about these Terms, please contact us at:
            </p>
            
            <p className="text-gray-700 mt-2">
              <strong>Email:</strong>{' '}
              <a href="mailto:support@hoardstash.com" className="text-purple-600 hover:underline">
                support@hoardstash.com
              </a>
            </p>
          </section>

          <div className="border-t pt-8 mt-8">
            <p className="text-gray-600 text-sm">
              By using HoardStash, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}