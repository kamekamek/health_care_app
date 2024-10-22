'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthForm from '../../components/AuthForm'
import { supabase } from '../../../utils/supabase/supabase'

export default function SignUp() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          アカウント登録
        </h2>
        <AuthForm onSubmit={handleSignUp} buttonText="登録" />
        {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
