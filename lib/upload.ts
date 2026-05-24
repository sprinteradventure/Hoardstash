'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(url, key)
}

export async function uploadProductImage(file: File, userId: string): Promise<string | null> {
  try {
    const supabaseClient = createSupabaseClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabaseClient.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return null
    }

    const { data: { publicUrl } } = supabaseClient.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const uploadImages = useCallback(async (files: FileList, userId: string) => {
    setUploading(true)
    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        console.error('File too large:', file.name)
        continue
      }

      const url = await uploadProductImage(file, userId)
      if (url) {
        uploadedUrls.push(url)
      }
    }

    setImages((prev) => [...prev, ...uploadedUrls])
    setUploading(false)
    return uploadedUrls
  }, [])

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  return { images, uploading, uploadImages, removeImage, setImages }
}