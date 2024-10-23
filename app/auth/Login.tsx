'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthForm from '../components/AuthForm'
import { supabase } from '@/utils/supabase/supabase'

export default function Login() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-8">Login</h1>
      <AuthForm onSubmit={handleLogin} buttonText="Login" />
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  )
}