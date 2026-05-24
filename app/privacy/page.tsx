'use client'

import Navigation from '@/components/Navigation'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-6">Last updated: March 28, 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">1. Introduction</h2>
            <p className="text-gray-700">
              HoardStash ("we," "us," or "our") respects your privacy and is committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use 
              our website and services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">2. Information We Collect</h2>
            
            <p className="text-gray-700 mb-4"><strong>Personal Information:</strong></p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Name and email address</li>
              <li>Shipping and billing addresses</li>
              <li>Phone number</li>
              <li>Payment information (processed securely by Stripe)</li>
              <li>Profile photos and bio information</li>
            </ul>

            <p className="text-gray-700 mb-4"><strong>Transaction Information:</strong></p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Purchase and sales history</li>
              <li>Item listings and descriptions</li>
              <li>Shipping and tracking information</li>
              <li>Messages between buyers and sellers</li>
            </ul>

            <p className="text-gray-700 mb-4"><strong>Usage Information:</strong></p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>IP address and device information</li>
              <li>Browser type and settings</li>
              <li>Pages visited and features used</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">3. How We Use Your Information</h2>
            
            <p className="text-gray-700 mb-4">We use your information to:</p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide and maintain our Services</li>
              <li>Process transactions and payments</li>
              <li>Facilitate communication between buyers and sellers</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Provide customer support</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Improve our Services and user experience</li>
              <li>Detect and prevent fraud and abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">4. Information Sharing</h2>
            
            <p className="text-gray-700 mb-4">We may share your information with:</p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Other Users:</strong> When you make a purchase or sale, we share necessary information (name, address) with the other party to complete the transaction.</li>
              <li><strong>Service Providers:</strong> We use third-party services for payment processing (Stripe), shipping, and analytics.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights.</li>
            </ul>

            <p className="text-gray-700 mt-4">We do not sell your personal information to third parties.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">5. Data Security</h2>
            
            <p className="text-gray-700">
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. This includes encryption, 
              secure servers, and regular security assessments.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">6. Your Rights</h2>
            
            <p className="text-gray-700 mb-4">Depending on your location, you may have the right to:</p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your personal information</li>
              <li>Object to certain processing</li>
              <li>Export your data</li>
              <li>Withdraw consent for marketing</li>
            </ul>

            <p className="text-gray-700 mt-4">
              To exercise these rights, contact us at support@hoardstash.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">7. Cookies</h2>
            
            <p className="text-gray-700">
              We use cookies and similar technologies to enhance your experience, analyze usage, and deliver 
              personalized content. You can control cookies through your browser settings. Disabling cookies 
              may affect the functionality of our Services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">8. Children's Privacy</h2>
            
            <p className="text-gray-700">
              Our Services are not intended for children under 13. We do not knowingly collect personal 
              information from children under 13. If you believe we have collected information from a child 
              under 13, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">9. Changes to This Policy</h2>
            
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of significant changes 
              by posting the updated policy on our website and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">10. Contact Us</h2>
            
            <p className="text-gray-700">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            
            <p className="text-gray-700 mt-2">
              <strong>Email:</strong>{' '}
              <a href="mailto:support@hoardstash.com" className="text-purple-600 hover:underline">
                support@hoardstash.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}