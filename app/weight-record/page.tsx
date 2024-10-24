'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { supabase } from '@/utils/supabase/supabase'

export default function WeightRecordPage() {
  const [weight, setWeight] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }

    const { data, error } = await supabase
      .from('weight_records')
      .insert([
        { user_id: user.id, weight: parseFloat(weight) }
      ])

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="flex flex-col items-center">
      <Button onClick={handleLogout} className="absolute top-4 right-4 bg-red-500 text-white">ログアウト</Button>
      <Card className="w-full max-w-md mt-10">
        <CardHeader>
          <CardTitle>体重記録</CardTitle>
          <CardDescription>今日の体重を記録してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight">体重 (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="65.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" className="w-full">記録する</Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push('/dashboard')} className="w-full">ダッシュボードに戻る</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
