'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { Loader2, User, Mail, MapPin, FileText, Save, Upload, Camera, Truck } from 'lucide-react'

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  location: string | null
  bio: string | null
  email: string | null
  shipping_address: {
    name?: string
    street1?: string
    street2?: string
    city?: string
    state?: string
    zip?: string
    country?: string
    phone?: string
  } | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [profile, setProfile] = useState<Profile>({
    id: '',
    full_name: '',
    avatar_url: '',
    location: '',
    bio: '',
    email: '',
    shipping_address: {}
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = getSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login?redirect=/profile')
          return
        }

        // Get profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile({
          id: user.id,
          full_name: (profileData as any)?.full_name || '',
          avatar_url: (profileData as any)?.avatar_url || '',
          location: (profileData as any)?.location || '',
          bio: (profileData as any)?.bio || '',
          email: user.email || '',
          shipping_address: (profileData as any)?.shipping_address || {},
        })
      } catch (error) {
        console.error('Load error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const supabase = getSupabaseClient()

      const { error } = await (supabase
        .from('profiles') as any)
        .upsert({
          id: profile.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          location: profile.location,
          bio: profile.bio,
          shipping_address: profile.shipping_address,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-gray-600">Manage your personal information and how you appear to other users.</p>
        </div>

        {message.text && (
          <div className={`
            mb-6 p-4 rounded-lg
            ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
            ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : ''}
          `}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold mb-1">Personal Information</h2>
            <p className="text-gray-500 text-sm">This information is visible to other users on your listings.</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div>
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Change Photo
                </button>
                <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max 5MB.</p>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                Full Name
              </label>
              <input
                type="text"
                value={profile.full_name || ''}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Your name"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                Email Address
              </label>
              <input
                type="email"
                value={profile.email || ''}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed here. Contact support if needed.</p>
            </div>

            <div>
              <label className="block font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                Location
              </label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="City, State or Country"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={100}
              />
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-400" />
                Shipping Return Address
              </h3>
              <p className="text-sm text-gray-500 mb-4">Used for generating shipping labels when buyers purchase your items.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1 text-sm">Full Name / Business Name</label>
                  <input
                    type="text"
                    value={profile.shipping_address?.name || profile.full_name || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      shipping_address: { ...profile.shipping_address, name: e.target.value }
                    })}
                    placeholder="Name on return address"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-1 text-sm">Street Address *</label>
                  <input
                    type="text"
                    value={profile.shipping_address?.street1 || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      shipping_address: { ...profile.shipping_address, street1: e.target.value }
                    })}
                    placeholder="123 Main St"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-1 text-sm">Apt, Suite, Unit (optional)</label>
                  <input
                    type="text"
                    value={profile.shipping_address?.street2 || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      shipping_address: { ...profile.shipping_address, street2: e.target.value }
                    })}
                    placeholder="Apt 4B"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block font-medium mb-1 text-sm">City *</label>
                    <input
                      type="text"
                      value={profile.shipping_address?.city || ''}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        shipping_address: { ...profile.shipping_address, city: e.target.value }
                      })}
                      placeholder="City"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label className="block font-medium mb-1 text-sm">State *</label>
                    <input
                      type="text"
                      value={profile.shipping_address?.state || ''}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        shipping_address: { ...profile.shipping_address, state: e.target.value }
                      })}
                      placeholder="CA"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label className="block font-medium mb-1 text-sm">ZIP *</label>
                    <input
                      type="text"
                      value={profile.shipping_address?.zip || ''}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        shipping_address: { ...profile.shipping_address, zip: e.target.value }
                      })}
                      placeholder="12345"
                      maxLength={10}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1 text-sm">Country</label>
                    <input
                      type="text"
                      value={profile.shipping_address?.country || 'US'}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        shipping_address: { ...profile.shipping_address, country: e.target.value }
                      })}
                      placeholder="US"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-1 text-sm">Phone Number</label>
                    <input
                      type="tel"
                      value={profile.shipping_address?.phone || ''}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        shipping_address: { ...profile.shipping_address, phone: e.target.value }
                      })}
                      placeholder="555-555-5555"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                Bio
              </label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell others about yourself and your craft..."
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-1">{profile.bio?.length || 0}/500 characters</p>
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/seller/dashboard')}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold mb-1">Account Settings</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-gray-500">Update your account password</p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Reset Password
              </button>
            </div>

            <hr className="border-gray-100" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Seller Dashboard</p>
                <p className="text-sm text-gray-500">Manage your listings and sales</p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/seller/dashboard')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
