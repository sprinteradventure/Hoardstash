'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Eye, EyeOff, Loader2, Mail, ArrowLeft } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(url, key)
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNeedsConfirmation(false)
    setResendSuccess(false)

    try {
      const supabaseClient = createSupabaseClient()
      const { data, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        // Check if it's an email not confirmed error
        if (authError.message?.toLowerCase().includes('email not confirmed') ||
            authError.message?.toLowerCase().includes('not confirmed')) {
          setNeedsConfirmation(true)
          setError('Please confirm your email address before signing in.')
        } else {
          setError(authError.message)
        }
        return
      }

      if (data.user) {
        router.push(redirect)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resendConfirmation = async () => {
    setResendLoading(true)
    setResendSuccess(false)
    
    try {
      const supabaseClient = createSupabaseClient()
      const { error } = await supabaseClient.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setResendSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend email')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      {needsConfirmation ? (
        <>
          <button
            onClick={() => setNeedsConfirmation(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-yellow-600" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Confirm Your Email</h1>
            <p className="text-gray-600">
              Please check your inbox at <strong>{formData.email}</strong> and click the confirmation link.
            </p>
          </div>

          {resendSuccess ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center mb-4">
              ✓ Confirmation email resent! Check your inbox.
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">Didn't receive it?</p>
              <button
                onClick={resendConfirmation}
                disabled={resendLoading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {resendLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Resend Confirmation Email'
                )}
              </button>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-500">
            <p className="mb-2"><strong>Tips:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your spam folder</li>
              <li>Make sure the email address is correct</li>
              <li>Wait a few minutes for delivery</li>
            </ul>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-gray-600 text-center mb-8">Sign in to your HoardStash account</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Remember me</span>
              </label>
              
              <Link href="/forgot-password" className="text-purple-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-purple-600 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-md mx-auto px-4 py-12">
        <Suspense fallback={
          <div className="bg-white rounded-lg shadow-sm p-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
