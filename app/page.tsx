import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function HomePage() {
  const categories = [
    { name: 'Yarn & Thread', icon: '🧶' },
    { name: 'Fabric & Textiles', icon: '🧵' },
    { name: 'Paints & Inks', icon: '🎨' },
    { name: 'Drawing & Illustration', icon: '✏️' },
    { name: 'Scrapbooking', icon: '📔' },
    { name: 'Jewelry Making', icon: '💎' },
    { name: 'Woodworking', icon: '🪵' },
    { name: 'Sewing & Needlecraft', icon: '🪡' },
    { name: 'Paper Crafts', icon: '📄' },
    { name: 'Tools & Equipment', icon: '🔧' },
    { name: 'Books & Patterns', icon: '📚' },
    { name: 'Beads & Embellishments', icon: '✨' },
    { name: 'Party Supplies', icon: '🎉' },
    { name: 'Costumes', icon: '🎭' },
  ]

  return (
    <div className="min-h-screen bg-[#F8F6F4]">
      <Navigation />

      {/* Hero with Yarn Background - Full width image style */}
      <section 
        className="relative min-h-[600px] flex items-center justify-center"
        style={{
          backgroundImage: 'url(/images/yarn-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8F6F4]/70 via-[#F8F6F4]/40 to-[#F8F6F4]/80" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-[#4A4035] mb-6 leading-tight drop-shadow-sm">
            Give Your Craft Supplies
            <br />
            <span className="text-[#6B5D4D]">a Second Life</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-[#4A4035]/80">
            Buy and sell yarn, fabric, paints, tools, and more in our community of makers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/browse"
              className="px-8 py-4 bg-[#7A8B6E] text-white font-bold rounded-full hover:bg-[#6B7A60] transition-colors shadow-lg"
            >
              Start Shopping
            </Link>
            <Link
              href="/sell"
              className="px-8 py-4 border-2 border-[#4A4035] text-[#4A4035] font-bold rounded-full hover:bg-[#4A4035] hover:text-white transition-colors bg-white/80 backdrop-blur-sm"
            >
              Start Selling
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-[#4A4035]">
            <div className="text-center">
              <p className="text-3xl font-bold">5%</p>
              <p className="text-sm">Seller Fee</p>
            </div>
            <div className="w-px h-12 bg-[#4A4035]/20" />
            <div className="text-center">
              <p className="text-3xl font-bold">Free</p>
              <p className="text-sm">To List</p>
            </div>
            <div className="w-px h-12 bg-[#4A4035]/20" />
            <div className="text-center">
              <p className="text-3xl font-bold">Fast</p>
              <p className="text-sm">Payouts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4A4035] mb-4">Browse by Category</h2>
          <p className="text-[#6B5D4D] max-w-xl mx-auto">
            Find exactly what you need for your next project.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/category/${cat.name.toLowerCase().replace(/ /g, '-')}`}
              className="group bg-white p-6 rounded-2xl text-center hover:shadow-lg transition-all duration-300 border border-[#E8E4E0]"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <div className="font-medium text-[#4A4035]">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#4A4035] mb-4">How It Works</h2>
            <p className="text-[#6B5D4D] max-w-xl mx-auto">
              Three simple steps to give your stash a new home.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#F8F6F4] rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-[#7A8B6E] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="text-xl font-bold text-[#4A4035] mb-3">1. List Your Items</h3>
              <p className="text-[#6B5D4D]">Take photos, write a description, and set your price. It's free!</p>
            </div>
            
            <div className="bg-[#F8F6F4] rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-[#7A8B6E] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-[#4A4035] mb-3">2. Make a Sale</h3>
              <p className="text-[#6B5D4D]">When someone buys, we handle secure payments powered by Stripe.</p>
            </div>
            
            <div className="bg-[#F8F6F4] rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-[#7A8B6E] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-xl font-bold text-[#4A4035] mb-3">3. Ship & Get Paid</h3>
              <p className="text-[#6B5D4D]">Pack your items and ship. Funds deposited directly to your account.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4A4035] text-[#C4B5A5] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-[#F8F6F4] mb-4">HoardStash</h3>
              <p>The marketplace for craft supplies. Give your stash a second life.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-[#F8F6F4] mb-4">Buy</h4>
              <ul className="space-y-2">
                <li><Link href="/browse" className="hover:text-[#F8F6F4]">Browse All</Link></li>
                <li><Link href="/categories" className="hover:text-[#F8F6F4]">Categories</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-[#F8F6F4] mb-4">Sell</h4>
              <ul className="space-y-2">
                <li><Link href="/sell" className="hover:text-[#F8F6F4]">Start Selling</Link></li>
                <li><Link href="/seller/dashboard" className="hover:text-[#F8F6F4]">Seller Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-[#F8F6F4] mb-4">Help</h4>
              <ul className="space-y-2">
                <li><Link href="/faq" className="hover:text-[#F8F6F4]">FAQ</Link></li>
                <li><Link href="/terms" className="hover:text-[#F8F6F4]">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-[#F8F6F4]">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[#5A5045] mt-8 pt-8 text-center text-[#9A8B7A]">
            © 2026 HoardStash. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
