'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthForm from '../../components/AuthForm'
import { supabase } from '@/utils/supabase/supabase'

export default function SignUp() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/login/`, // スラッシュを追加
      },
    });

    if (error) {
      console.error('Sign Up Error:', error); // エラーをコンソールに出力
      setError(error.message);
    } else {
      // サインアップ成功時の処理（例: メッセージ表示）
      alert('確認メールを送信しました。メールを確認してください。');
      router.push('/'); // サインアップ後にリダイレクトするページ
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-8">Sign Up</h1>
      <AuthForm onSubmit={handleSignUp} buttonText="Sign Up" />
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
