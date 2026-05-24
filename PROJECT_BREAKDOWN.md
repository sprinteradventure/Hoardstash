# HoardStash Project - Complete Breakdown
**Backup Date:** March 29, 2026  
**Live URL:** https://www.hoardstash.com  
**Backup File:** `/root/.openclaw/workspace/hoardstash-backup-20260329-094919.tar.gz` (155MB)

---

## 📁 Project Structure

```
hoardstash/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # API Routes
│   │   ├── create-checkout-session/ # Stripe checkout creation
│   │   ├── create-payment-intent/   # Stripe payment intent
│   │   ├── orders/                  # Order management
│   │   ├── products/                # Product CRUD
│   │   ├── seller/
│   │   │   ├── create-account/      # Stripe Connect onboarding
│   │   │   └── products/            # Seller product management
│   │   ├── shipping/
│   │   │   ├── label/               # Generate shipping labels (EasyPost)
│   │   │   └── rates/               # Get shipping rates (EasyPost)
│   │   └── webhooks/stripe/         # Stripe webhooks
│   ├── 📁 (pages)/
│   │   ├── browse/                  # Browse all products
│   │   ├── cart/                    # Shopping cart
│   │   ├── checkout/                # Checkout with shipping options
│   │   ├── login/                   # User login
│   │   ├── order/success/           # Order confirmation
│   │   ├── privacy/                 # Privacy policy
│   │   ├── product/[id]/            # Product detail page
│   │   ├── profile/                 # User profile
│   │   ├── sell/                    # Create listing
│   │   ├── seller/dashboard/        # Seller dashboard
│   │   ├── signup/                  # User signup
│   │   ├── terms/                   # Terms of service
│   │   ├── page.tsx                 # Homepage
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css              # Global styles
├── 📁 components/                   # React components
│   └── Navigation.tsx               # Main navigation
├── 📁 lib/                          # Utilities
│   ├── supabase.ts                  # Supabase client (browser)
│   ├── supabase-server.ts           # Supabase admin client
│   └── upload.ts                    # Image upload helper
├── 📁 public/                       # Static assets
│   └── images/
│       ├── logo.png                 # HoardStash logo
│       ├── yarn-bg.jpg              # Hero background
│       └── yarn-hero.png            # Alternative hero
├── package.json                     # Dependencies
├── tailwind.config.ts               # Tailwind config
├── tsconfig.json                    # TypeScript config
└── README.md                        # Project readme
```

---

## 🔧 Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (email confirmation enabled) |
| **Storage** | Supabase Storage (product-images bucket) |
| **Payments** | Stripe (Checkout + Connect) |
| **Shipping** | EasyPost API |
| **Hosting** | Vercel |

---

## 🗄️ Database Schema (Supabase)

### Tables:

```sql
-- User profiles (extends Supabase auth.users)
profiles
  - id (uuid, PK) - links to auth.users
  - full_name (text)
  - location (text)
  - bio (text)
  - avatar_url (text)
  - stripe_account_id (text) - for Connect
  - stripe_onboarding_complete (boolean)
  - created_at (timestamp)

-- Product listings
products
  - id (uuid, PK)
  - seller_id (uuid, FK → profiles)
  - title (text)
  - description (text)
  - price (numeric)
  - category (text)
  - condition (text)
  - images (text[])
  - status (text: 'active' | 'sold' | 'reserved' | 'deleted')
  - quantity (int)
  - shipping_weight (numeric) - ounces
  - shipping_dimensions (jsonb) - {length, width, height}
  - created_at (timestamp)

-- Orders
orders
  - id (uuid, PK)
  - buyer_id (uuid, FK → profiles)
  - seller_id (uuid, FK → profiles)
  - product_id (uuid, FK → products)
  - quantity (int)
  - item_price (numeric)
  - shipping_cost (numeric)
  - total_amount (numeric)
  - status (text: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled')
  - shipping_address (jsonb)
  - tracking_number (text)
  - shipping_label_url (text)
  - shipping_carrier (text)
  - shipping_service (text)
  - stripe_payment_intent_id (text)
  - created_at (timestamp)
  - shipped_at (timestamp)
  - delivered_at (timestamp)

-- Other tables
favorites, reviews, conversations, messages, categories
```

---

## 🔐 Environment Variables (Vercel)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://shtljdcrvtfedtaygmke.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_3K_...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# EasyPost
EASYPOST_API_KEY=EZT_...

# App
NEXT_PUBLIC_APP_URL=https://www.hoardstash.com
```

---

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Cream | `#F8F6F4` | Main background |
| Cream Dark | `#F5F0E8` | Cards, sections |
| Sand | `#EDE6D8` | Alternate sections |
| Beige | `#E8E4E0` | Borders, dividers |
| Taupe | `#C4B5A5` | Secondary text |
| Brown | `#6B5D4D` | Body text |
| Brown Dark | `#4A4035` | Headings, footer |
| Sage Green | `#7A8B6E` | Primary buttons, accents |
| Sage Dark | `#6B7A60` | Button hover |

---

## 🚀 Key Features

### Authentication
- Email/password signup with confirmation
- Login with "email not confirmed" handling
- Password reset flow
- Real-time auth state in navigation

### Product Listings
- Create listings with up to 8 images
- 5MB max per image
- Categories with emoji icons
- Condition selector
- Soft delete (status = 'deleted')

### Seller Dashboard
- Stripe Connect onboarding
- Stats: sales, active listings, items sold
- Manage/delete listings
- View orders

### Shopping & Checkout
- Shopping cart
- Real-time shipping rates via EasyPost
- Multiple carrier options (USPS, UPS, FedEx)
- Stripe Checkout integration
- Order confirmation

### Shipping (Partially Implemented)
- EasyPost API integration
- Rate calculation at checkout
- Label generation endpoint (needs seller address from profile)

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "@easypost/api": "^7.0.0",
    "@stripe/stripe-js": "^3.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "lucide-react": "^0.294.0",
    "next": "14.2.35",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "stripe": "^14.0.0",
    "uuid": "^9.0.0"
  }
}
```

---

## 🔄 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET/POST | List/create products |
| `/api/seller/products` | GET/DELETE | Seller's products |
| `/api/seller/create-account` | POST | Stripe Connect onboarding |
| `/api/orders` | POST | Create order |
| `/api/shipping/rates` | POST | Get shipping rates |
| `/api/shipping/label` | POST | Generate shipping label |
| `/api/create-checkout-session` | POST | Stripe checkout |
| `/api/webhooks/stripe` | POST | Stripe webhooks |

---

## 📝 TODO / Next Steps

1. **Complete Shipping Flow**
   - Add seller address to profile
   - Display orders in seller dashboard
   - Label generation UI
   - Tracking display for buyers

2. **Search & Browse**
   - Real search functionality
   - Filters (price, category, condition)
   - Sort options

3. **Messaging**
   - Buyer-seller conversation system
   - Notifications

4. **Reviews**
   - Leave reviews after purchase
   - Seller ratings

5. **Admin Features**
   - Moderation tools
   - Dispute handling

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
npx vercel deploy --prod
```

---

## 📞 Support Resources

- **Supabase Dashboard:** https://app.supabase.com/project/shtljdcrvtfedtaygmke
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **EasyPost Dashboard:** https://www.easypost.com/account

---

**Backup Location:** `/root/.openclaw/workspace/hoardstash-backup-20260329-094919.tar.gz`  
**To restore:** `tar -xzf hoardstash-backup-20260329-094919.tar.gz`
