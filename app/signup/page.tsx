'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { supabase } from '@/utils/supabase/supabase'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { user, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signupError) {
      setError(signupError.message)
      return
    }

    // ユーザー情報をusersテーブルに挿入
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ id: user?.id, email }]) // user.idを使用

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>会員登録</CardTitle>
          <CardDescription>新しいアカウントを作成してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" className="w-full">登録</Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full">
            既にアカウントをお持ちの方は
            <a href="/" className="text-blue-500 hover:underline">こちら</a>
            からログインしてください
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
